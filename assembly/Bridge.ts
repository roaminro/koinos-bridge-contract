import { Protobuf, System, Crypto, Token, Base58, u128, SafeMath, Storage, authority } from '@koinos/sdk-as';
import { bridge } from './proto/bridge';
import { Metadata } from './state/Metadata';
import { Tokens } from './state/Tokens';
import { Transfers } from './state/Transfers';
import { Validators } from './state/Validators';
import { WrappedTokens } from './state/WrappedTokens';
import { Pausable } from './util/Pausable';
import { ReentrancyGuard } from './util/ReentrancyGuard';

export class Bridge {
  contractId: Uint8Array = System.getContractId();

  initialize(args: bridge.initialize_arguments): bridge.empty_object {
    // on this contract can initialize itself
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    // check that there is not at least 1 validator
    const initialValidators = args.initial_validators;
    System.require(initialValidators.length > 0, 'Validators required');

    // check that the contract has not been previously initialized
    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    System.require(!meta.initialized, 'Contract already initialized');
    
    // add validators
    const validators = new Validators(this.contractId);
    for (let index = 0; index < initialValidators.length; index++) {
      const validator = initialValidators[index];
      System.require(!validators.has(validator), 'Validator not unique');
      validators.put(validator, new bridge.empty_object());
      meta.nb_validators += 1;
    }
    meta.chain_id = args.chain_id;
    meta.initialized = true;
    metadata.put(meta);
    return new bridge.empty_object();
  }

  get_validators(
    args: bridge.get_validators_arguments
  ): bridge.repeated_addresses {
    const start = args.start;
    let limit = args.limit;
    if (limit == 0) {
      limit = 100;
    }
    const validators = new Validators(this.contractId);
    let res: Uint8Array[] = [];
    if (validators.has(start)) {
      const d = args.descending ? Storage.Direction.Descending : Storage.Direction.Ascending;
      res = validators.getManyKeys(start, limit, d);
      res.unshift(start);
    }
    return new bridge.repeated_addresses(res);
  }

  get_supported_tokens(
    args: bridge.get_supported_tokens_arguments
  ): bridge.repeated_addresses {
    const start = args.start;
    let limit = args.limit;
    if (limit == 0) {
      limit = 100;
    }
    const tokens = new Tokens(this.contractId);
    let res: Uint8Array[] = [];
    if (tokens.has(start)) {
      const d = args.descending ? Storage.Direction.Descending : Storage.Direction.Ascending;
      res = tokens.getManyKeys(start, limit, d);
      res.unshift(start);
    }
    return new bridge.repeated_addresses(res);
  }

  get_supported_wrapped_tokens(
    args: bridge.get_supported_wrapped_tokens_arguments
  ): bridge.repeated_addresses {
    const start = args.start;
    let limit = args.limit;
    if (limit == 0) {
      limit = 100;
    }
    const tokens = new WrappedTokens(this.contractId);
    let res: Uint8Array[] = [];
    if (tokens.has(start)) {
      const d = args.descending ? Storage.Direction.Descending : Storage.Direction.Ascending;
      res = tokens.getManyKeys(start, limit, d);
      res.unshift(start);
    }
    return new bridge.repeated_addresses(res);
  }

  get_metadata(args: bridge.get_metadata_arguments): bridge.metadata_object {
    const metadata = new Metadata(this.contractId);
    return metadata.get()!;
  }

  set_pause(args: bridge.set_pause_arguments): bridge.empty_object {
    const signatures = args.signatures;
    const pause = args.pause;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');
    
    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.set_pause_action_hash(bridge.action_id.set_pause, pause, meta.nonce, this.contractId, args.expiration);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.set_pause_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    const pausable = new Pausable(this.contractId);
    pausable.setPause(pause);

    meta.nonce += 1;
    metadata.put(meta);

    if (pause) {
      System.event('bridge.pause', new Uint8Array(0), []);
    } else {
      System.event('bridge.unpause', new Uint8Array(0), []);
    }

    return new bridge.empty_object();
  }

  transfer_tokens(
    args: bridge.transfer_tokens_arguments
  ): bridge.empty_object {
    // cannot call when contract is paused
    new Pausable(this.contractId).whenNotPaused();

    // reentrancy guard
    const reentrancyGuard = new ReentrancyGuard(this.contractId);

    // args
    let from = args.from;
    let token = args.token;
    let amount = args.amount;
    let toChain = args.to_chain;
    let recipient = args.recipient;

    // check tokens suport
    const isSupportedToken = new Tokens(this.contractId).has(token);
    const isSupportedWrappedToken = new WrappedTokens(this.contractId).has(token);
    System.require(isSupportedToken || isSupportedWrappedToken, 'token is not supported');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // tokens instance
    const tokenContract = new Token(token);

    if (isSupportedWrappedToken) {
      // transfer tokens to contract
      System.require(tokenContract.transfer(from, this.contractId, amount), 'could not transfer wrapped tokens to the bridge');

      // and burn them...
      System.require(tokenContract.burn(this.contractId, amount), 'could not burn wrapped tokens');
    } else {

      // check fee and send
      if(meta.fee_to.length) {
        let _fee = this.getFee(meta.fee_amount, amount);
        // query own token balance before transfer in fee
        const balanceFeeBefore = tokenContract.balanceOf(meta.fee_to);
        // transfer tokens to contract
        System.require(tokenContract.transfer(from, meta.fee_to, _fee), 'could not transfer fee tokens to validadtors');
        // query own token balance after transfer
        const balanceFeeAfter = tokenContract.balanceOf(meta.fee_to);
        // correct amount for potential transfer fees
        let feeFinal = balanceFeeAfter - balanceFeeBefore;
        amount = amount - feeFinal;
      }

      // query own token balance before transfer
      const balanceBefore = tokenContract.balanceOf(this.contractId);
      // transfer tokens to contract
      System.require(tokenContract.transfer(from, this.contractId, amount), 'could not transfer tokens to the bridge');
      // query own token balance after transfer
      const balanceAfter = tokenContract.balanceOf(this.contractId);

      // correct amount for potential transfer
      amount = balanceAfter - balanceBefore;
    }
    
    // normalize amount, we only want to handle 8 decimals maximum on Koinos
    const decimals = tokenContract.decimals();
    const normalizedAmount = this.normalizeAmount(amount, decimals);

    System.require(
      normalizedAmount > 0,
      'normalizedAmount amount must be greater than 0'
    );

    const event = new bridge.tokens_locked_event(from, token, normalizedAmount.toString(), recipient, toChain);
    System.event('bridge.tokens_locked_event', Protobuf.encode(event, bridge.tokens_locked_event.encode), [from]);

    reentrancyGuard.reset();

    return new bridge.empty_object();
  }

  complete_transfer(
    args: bridge.complete_transfer_arguments
  ): bridge.empty_object {
    // cannot call when contract is paused
    new Pausable(this.contractId).whenNotPaused();

    // reentrancy guard
    const reentrancyGuard = new ReentrancyGuard(this.contractId);

    // meta config
    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // args
    let transaction_id = args.transaction_id;
    let token = args.token;
    let recipient = args.recipient;
    let value = args.value;
    let signatures = args.signatures;
    let chainId = meta.chain_id;
    
    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if token in supported
    const isSupportedToken = new Tokens(this.contractId).has(token);
    const isSupportedWrappedToken = new WrappedTokens(this.contractId).has(token);
    System.require(isSupportedToken || isSupportedWrappedToken, 'token is not supported');

    // check if the transaction has not been completed previously
    const transfers = new Transfers(this.contractId);
    System.require(!transfers.has(transaction_id), 'transfer already completed');
    transfers.put(transaction_id);

    // check signatures of validators
    const objToHash = new bridge.complete_transfer_hash(bridge.action_id.complete_transfer, transaction_id, token, recipient, value, this.contractId, args.expiration, chainId);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.complete_transfer_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // tokens instance
    const tokenContract = new Token(token);
    
    // normalize amount, we only want to handle 8 decimals maximum on Koinos
    const decimals = tokenContract.decimals();
    let transferAmount = this.deNormalizeAmount(value, decimals);

    // transfer bridged amount to recipient
    if (isSupportedWrappedToken) {
      // mint wrapped asset
      System.require(tokenContract.mint(recipient, value), 'mint of new wrapped tokens failed');
    } else {

      if(meta.fee_to.length) {
        let _fee = this.getFee(meta.fee_amount, transferAmount);
        // query own token balance before transfer in fee
        const balanceFeeBefore = tokenContract.balanceOf(meta.fee_to);
        // transfer tokens to contract
        System.require(tokenContract.transfer(this.contractId, meta.fee_to, _fee), 'could not transfer fee tokens to validadtors');
        // query own token balance after transfer
        const balanceFeeAfter = tokenContract.balanceOf(meta.fee_to);
        // correct amount for potential transfer fees
        let feeFinal = balanceFeeAfter - balanceFeeBefore;
        transferAmount = transferAmount - feeFinal;
      }

      // transfer tokens
      System.require(tokenContract.transfer(this.contractId, recipient, transferAmount), 'transfer of tokens failed');
    }

    const event = new bridge.transfer_completed_event(transaction_id);
    System.event('bridge.transfer_completed_event', Protobuf.encode(event, bridge.transfer_completed_event.encode), [recipient]);

    reentrancyGuard.reset();

    return new bridge.empty_object();
  }

  add_validator(
    args: bridge.add_validator_arguments
  ): bridge.empty_object {
    const signatures = args.signatures;
    const validator = args.validator;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if the validator does not exist
    const validators = new Validators(this.contractId);
    System.require(!validators.has(validator), 'Validator already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    
    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_validator, validator, meta.nonce, this.contractId, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // add validator
    validators.put(validator, new bridge.empty_object());
    meta.nb_validators += 1;
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.add_validator_result', new Uint8Array(0), [validator]);
    return new bridge.empty_object();
  }

  remove_validator(
    args: bridge.remove_validator_arguments
  ): bridge.empty_object {
    const signatures = args.signatures;
    const validator = args.validator;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if validator exist
    const validators = new Validators(this.contractId);
    System.require(validators.has(validator), 'Validator does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_validator, validator, meta.nonce, this.contractId, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // remove validator
    validators.remove(validator);
    meta.nb_validators -= 1;
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.remove_validator_result', new Uint8Array(0), [validator]);
    return new bridge.empty_object();
  }

  add_supported_token(
    args: bridge.add_supported_token_arguments
  ): bridge.empty_object {
    const signatures = args.signatures;
    const token = args.token;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if the token does not exist
    const tokens = new Tokens(this.contractId);
    System.require(!tokens.has(token), 'Token already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_supported_token, token, meta.nonce, this.contractId, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // add token
    tokens.put(token, new bridge.empty_object());
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.add_supported_token_result', new Uint8Array(0), [token]);
    return new bridge.empty_object();
  }

  remove_supported_token(
    args: bridge.remove_supported_token_arguments
  ): bridge.empty_object {    
    const signatures = args.signatures;
    const token = args.token;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if the token exists
    const tokens = new Tokens(this.contractId);
    System.require(tokens.has(token), 'Token does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_supported_token, token, meta.nonce, this.contractId, args.expiration);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // remove token
    tokens.remove(token);
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.remove_supported_token_result', new Uint8Array(0), [token]);
    return new bridge.empty_object();
  }

  add_supported_wrapped_token(
    args: bridge.add_supported_wrapped_token_arguments
  ): bridge.empty_object {    
    const signatures = args.signatures;
    const token = args.token;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    // check if wrapped tokens does not exist
    const wrappedTokens = new WrappedTokens(this.contractId);
    System.require(!wrappedTokens.has(token), 'Token already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_supported_wrapped_token, token, meta.nonce, this.contractId, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // add wrapped tokens
    wrappedTokens.put(token, new bridge.empty_object());
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.add_supported_wrapped_token_result', new Uint8Array(0), [token]);
    return new bridge.empty_object();
  }

  remove_supported_wrapped_token(
    args: bridge.remove_supported_wrapped_token_arguments
  ): bridge.empty_object {    
    const signatures = args.signatures;
    const token = args.token;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signature');

    // check if wrapped tokens exist
    const wrappedTokens = new WrappedTokens(this.contractId);
    System.require(wrappedTokens.has(token), 'Token does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // check signatures of validators
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_supported_wrapped_token, token, meta.nonce, this.contractId, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // remove wrapped tokens
    wrappedTokens.remove(token);
    meta.nonce += 1;
    metadata.put(meta);
    System.event('bridge.remove_supported_wrapped_token_result', new Uint8Array(0), [token]);
    return new bridge.empty_object();
  }

  set_fee_wallet(
    args: bridge.set_fee_wallet_arguments
  ): bridge.empty_object {
    const signatures = args.signatures;
    const fee_to = args.fee_to;
    const fee_amount = args.fee_amount;

    // check expiration
    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signature');

    // check if fee is greater than 0
    System.require(fee_amount > 0, 'Expired signature');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;

    // verify hashed signatures
    const objToHash = new bridge.set_fee_wallet_hash(bridge.action_id.set_fee_wallet, fee_amount, fee_to, args.expiration, meta.chain_id);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.set_fee_wallet_hash.encode))!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    // add new fee
    meta.nonce += 1;
    meta.fee_to = fee_to;
    meta.fee_amount = fee_amount;  // 10000 == 100%
    metadata.put(meta);
    System.event('bridge.add_supported_wrapped_token_result', new Uint8Array(0), [fee_to]);
    return new bridge.empty_object();
  }

  verifySignatures(hash: Uint8Array, signatures: Uint8Array[], nbValidators: u32): void {
    // The following function is equivalent to 5, meaning that there must be 5 or more validator signatures for the quorum to be reached.
    // (nbValidators * 5 + 10) / 9
    System.require(
      signatures.length as u32 >= (nbValidators * 5 + 10) / 9,
      'quorum not met'
    );
    const validators = new Validators(this.contractId);
    const validatorAlreadySigned = new Map<string, boolean>();
    for (let index = 0; index < signatures.length; index++) {
      const signature = signatures[index];
      const pubKey = System.recoverPublicKey(signature, hash)!;
      const address = Crypto.addressFromPublicKey(pubKey);
      const addressString = address.toString();
      if (!validators.has(address)) {
        System.revert(`${Base58.encode(address)} is not a validator`);
      }
      if (validatorAlreadySigned.has(addressString)) {
        System.revert(`validator ${Base58.encode(address)} already signed`);
      }
      validatorAlreadySigned.set(addressString, true);
    }
  }

  request_new_signatures(
    args: bridge.request_new_signatures_arguments
  ): bridge.empty_object {    
    System.event('bridge.request_new_signatures_event', Protobuf.encode(args, bridge.request_new_signatures_arguments.encode), []);
    return new bridge.empty_object();
  }

  get_transfer_status(
    args: bridge.get_transfer_status_arguments
  ): bridge.boole {
    const transfers = new Transfers(this.contractId);
    return new bridge.boole(transfers.has(args.transaction_id));
  }

  private normalizeAmount(amount: u64, decimals: u32): u64 {
    if (decimals > 8) {
      amount /= 10 ** (decimals - 8);
    }
    if (decimals < 8) {
      amount *= 10 ** (8 - decimals);
    }
    return amount;
  }

  private deNormalizeAmount(amount: u64, decimals: u32): u64 {
    if (decimals > 8) {
      amount *= 10 ** (decimals - 8);
    }
    if (decimals < 8) {
      amount /= 10 ** (8 - decimals);
    }
    return amount;
  }

  private getFee(fee: u64, amount: u64): u64 {    
    System.require( amount>0, 'INSUFFICIENT_AMOUNT', 1);
    System.require( fee>0, 'INSUFFICIENT_FEE', 1);
    // data in u128
    let _fee = u128.fromU64(fee);
    let _10000 = u128.fromU64(10000);
    let _amount = u128.fromU64(amount);
    // process
    let result = SafeMath.div(SafeMath.mul(_fee, _amount), _10000);
    return result.toU64();
  }
}
