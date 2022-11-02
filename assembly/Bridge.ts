import { Protobuf, System, Crypto, Token, Base58, Storage } from '@koinos/sdk-as';
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

  initialize(args: bridge.initialize_arguments): bridge.initialize_result {
    const initialValidators = args.initial_validators;
    System.require(initialValidators.length > 0, 'Validators required');

    const validators = new Validators(this.contractId);

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    System.require(!meta.initialized, 'Contract already initialized');

    for (let index = 0; index < initialValidators.length; index++) {
      const validator = initialValidators[index];
      System.require(!validators.has(validator), 'Validator not unique');
      validators.put(validator, new bridge.validator_object());
      meta.nb_validators += 1;
    }

    meta.initialized = true;
    metadata.put(meta);

    return new bridge.initialize_result();
  }

  get_validators(
    args: bridge.get_validators_arguments
  ): bridge.repeated_addresses {
    const start = args.start!;
    let limit = args.limit;
    let direction = args.direction;

    if (limit == 0) {
      limit = 100;
    }

    const validators = new Validators(this.contractId);
    let res: Uint8Array[] = [];

    if (validators.has(start)) {
      const d = direction == 0 ? Storage.Direction.Ascending : Storage.Direction.Descending;
      res = validators.getManyKeys(start, limit, d);
      res.unshift(start);
    }

    return new bridge.repeated_addresses(res);
  }

  get_supported_tokens(
    args: bridge.get_supported_tokens_arguments
  ): bridge.repeated_addresses {
    const start = args.start!;
    let limit = args.limit;
    let direction = args.direction;

    if (limit == 0) {
      limit = 100;
    }

    const tokens = new Tokens(this.contractId);
    let res: Uint8Array[] = [];

    if (tokens.has(start)) {
      const d = direction == 0 ? Storage.Direction.Ascending : Storage.Direction.Descending;
      res = tokens.getManyKeys(start, limit, d);
      res.unshift(start);
    }

    return new bridge.repeated_addresses(res);
  }

  get_supported_wrapped_tokens(
    args: bridge.get_supported_wrapped_tokens_arguments
  ): bridge.repeated_addresses {
    const start = args.start!;
    let limit = args.limit;
    let direction = args.direction;

    if (limit == 0) {
      limit = 100;
    }

    const tokens = new WrappedTokens(this.contractId);
    let res: Uint8Array[] = [];

    if (tokens.has(start)) {
      const d = direction == 0 ? Storage.Direction.Ascending : Storage.Direction.Descending;
      res = tokens.getManyKeys(start, limit, d);
      res.unshift(start);
    }

    return new bridge.repeated_addresses(res);
  }

  get_metadata(args: bridge.get_metadata_arguments): bridge.metadata_object {
    const metadata = new Metadata(this.contractId);
    return metadata.get()!;
  }

  set_pause(args: bridge.set_pause_arguments): bridge.set_pause_result {
    const signatures = args.signatures;
    const pause = args.pause;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');
    
    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.set_pause_action_hash(bridge.action_id.set_pause, pause, meta.nonce, this.contractId);

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

    return new bridge.set_pause_result();
  }

  transfer_tokens(
    args: bridge.transfer_tokens_arguments
  ): bridge.transfer_tokens_result {
    // cannot call when contract is paused
    new Pausable(this.contractId).whenNotPaused();

    // reentrancy guard
    const reentrancyGuard = new ReentrancyGuard(this.contractId);

    const from = args.from!;
    const token = args.token!;
    const amount = args.amount;
    const recipient = args.recipient!;

    const isSupportedToken = new Tokens(this.contractId).has(token);
    const isSupportedWrappedToken = new WrappedTokens(this.contractId).has(token);
    System.require(isSupportedToken || isSupportedWrappedToken, 'token is not supported');

    const tokenContract = new Token(token);
    const decimals = tokenContract.decimals();

    // don't deposit dust that can not be bridged due to the decimal shift
    let bridgedAmount = this.deNormalizeAmount(this.normalizeAmount(amount, decimals), decimals);

    if (isSupportedWrappedToken) {
      // transfer tokens to contract
      System.require(tokenContract.transfer(from, this.contractId, bridgedAmount), 'could not transfer wrapped tokens to the bridge');

      // and burn them...
      System.require(tokenContract.burn(this.contractId, bridgedAmount), 'could not burn wrapped tokens');
    } else {
      // query own token balance before transfer
      const balanceBefore = tokenContract.balanceOf(this.contractId);

      // transfer tokens to contract
      System.require(tokenContract.transfer(from, this.contractId, bridgedAmount), 'could not transfer tokens to the bridge');

      // query own token balance after transfer
      const balanceAfter = tokenContract.balanceOf(this.contractId);

      // correct amount for potential transfer fees
      bridgedAmount = balanceAfter - balanceBefore;
    }

    // normalize amount, we only want to handle 8 decimals maximum on Koinos
    const normalizedAmount = this.normalizeAmount(bridgedAmount, decimals);

    System.require(
      normalizedAmount > 0,
      'normalizedAmount amount must be greater than 0'
    );

    const event = new bridge.transfer_tokens_event(from, token, normalizedAmount, recipient, System.getHeadInfo().head_block_time);
    System.event('bridge.transfer_tokens_event', Protobuf.encode(event, bridge.transfer_tokens_event.encode), [from]);

    reentrancyGuard.reset();

    return new bridge.transfer_tokens_result();
  }

  complete_transfer(
    args: bridge.complete_transfer_arguments
  ): bridge.complete_transfer_result {
    // cannot call when contract is paused
    new Pausable(this.contractId).whenNotPaused();

    // reentrancy guard
    const reentrancyGuard = new ReentrancyGuard(this.contractId);

    const transaction_id = args.transaction_id!;
    const token = args.token!;
    const recipient = args.recipient!;
    const value = args.value;
    const signatures = args.signatures;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const isSupportedToken = new Tokens(this.contractId).has(token);
    const isSupportedWrappedToken = new WrappedTokens(this.contractId).has(token);
    System.require(isSupportedToken || isSupportedWrappedToken, 'token is not supported');

    const objToHash = new bridge.complete_transfer_hash(bridge.action_id.complete_transfer, transaction_id, token, recipient, value, this.contractId);
    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.complete_transfer_hash.encode))!;

    const transfers = new Transfers(this.contractId);

    System.require(!transfers.has(hash), '!transfer already completed');
    transfers.put(hash);

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    this.verifySignatures(hash, signatures, meta.nb_validators);

    const tokenContract = new Token(token);
    // query decimals
    const decimals = tokenContract.decimals();

    // adjust decimals
    const transferAmount = this.deNormalizeAmount(value, decimals);

    // transfer bridged amount to recipient
    if (isSupportedWrappedToken) {
      // mint wrapped asset
      System.require(tokenContract.mint(recipient, value), 'mint of new wrapped tokens failed');
    } else {
      System.require(tokenContract.transfer(this.contractId, recipient, transferAmount), 'transfer of tokens failed');
    }

    reentrancyGuard.reset();

    return new bridge.complete_transfer_result();
  }

  add_validator(
    args: bridge.add_validator_arguments
  ): bridge.add_validator_result {
    const signatures = args.signatures;
    const validator = args.validator!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const validators = new Validators(this.contractId);

    System.require(!validators.has(validator), 'Validator already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_validator, validator, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    const validatorObj = validators.get(validator);
    validators.put(validator, validatorObj);

    meta.nb_validators += 1;
    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.add_validator_result', new Uint8Array(0), [validator]);

    return new bridge.add_validator_result();
  }

  remove_validator(
    args: bridge.remove_validator_arguments
  ): bridge.remove_validator_result {
    const signatures = args.signatures;
    const validator = args.validator!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const validators = new Validators(this.contractId);

    System.require(validators.has(validator), 'Validator does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_validator, validator, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    validators.remove(validator);

    meta.nb_validators -= 1;
    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.remove_validator_result', new Uint8Array(0), [validator]);

    return new bridge.remove_validator_result();
  }

  add_supported_token(
    args: bridge.add_supported_token_arguments
  ): bridge.add_supported_token_result {
    const signatures = args.signatures;
    const token = args.token!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const tokens = new Tokens(this.contractId);
    System.require(!tokens.has(token), 'Token already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_supported_token, token, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    const tokenObj = tokens.get(token);
    tokens.put(token, tokenObj);

    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.add_supported_token_result', new Uint8Array(0), [token]);

    return new bridge.add_supported_token_result();
  }

  remove_supported_token(
    args: bridge.remove_supported_token_arguments
  ): bridge.remove_supported_token_result {
    const signatures = args.signatures;
    const token = args.token!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const tokens = new Tokens(this.contractId);
    System.require(tokens.has(token), 'Token does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_supported_token, token, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    tokens.remove(token);

    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.remove_supported_token_result', new Uint8Array(0), [token]);

    return new bridge.remove_supported_token_result();
  }

  add_supported_wrapped_token(
    args: bridge.add_supported_wrapped_token_arguments
  ): bridge.add_supported_wrapped_token_result {
    const signatures = args.signatures;
    const token = args.token!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signatures');

    const wrappedTokens = new WrappedTokens(this.contractId);
    System.require(!wrappedTokens.has(token), 'Token already exists');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.add_supported_wrapped_token, token, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    const tokenObj = wrappedTokens.get(token);
    wrappedTokens.put(token, tokenObj);

    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.add_supported_wrapped_token_result', new Uint8Array(0), [token]);

    const res = new bridge.add_supported_wrapped_token_result();

    return res;
  }

  remove_supported_wrapped_token(
    args: bridge.remove_supported_wrapped_token_arguments
  ): bridge.remove_supported_wrapped_token_result {
    const signatures = args.signatures;
    const token = args.token!;

    System.require(args.expiration >= System.getHeadInfo().head_block_time, 'Expired signature');

    const wrappedTokens = new WrappedTokens(this.contractId);
    System.require(wrappedTokens.has(token), 'Token does not exist');

    const metadata = new Metadata(this.contractId);
    const meta = metadata.get()!;
    const objToHash = new bridge.add_remove_action_hash(bridge.action_id.remove_supported_wrapped_token, token, meta.nonce, this.contractId);

    const hash = System.hash(Crypto.multicodec.sha2_256, Protobuf.encode(objToHash, bridge.add_remove_action_hash.encode))!;

    this.verifySignatures(hash, signatures, meta.nb_validators);

    wrappedTokens.remove(token);

    meta.nonce += 1;
    metadata.put(meta);

    System.event('bridge.remove_supported_wrapped_token_result', new Uint8Array(0), [token]);

    return new bridge.remove_supported_wrapped_token_result();
  }

  verifySignatures(hash: Uint8Array, signatures: Uint8Array[], nbValidators: u32): void {
    System.require(
      signatures.length as u32 >= (((nbValidators * 10) / 3) * 2) / 10 + 1,
      'quorum not met'
    );

    const validators = new Validators(this.contractId);

    const validatorAlreadySigned = new Map<string, boolean>();

    for (let index = 0; index < signatures.length; index++) {
      const signature = signatures[index];
      const pubKey = System.recoverPublicKey(signature, hash)!;
      const address = Crypto.addressFromPublicKey(pubKey);
      const b58Addr = Base58.encode(address);
 
      System.require(validators.has(address), `${b58Addr} is not a validator`);
      System.require(!validatorAlreadySigned.has(b58Addr), `validator ${b58Addr} already signed`);

      validatorAlreadySigned.set(b58Addr, true);
    }
  }

  normalizeAmount(amount: u64, decimals: u32): u64 {
    if (decimals > 8) {
      amount /= 10 ** (decimals - 8);
    }

    return amount;
  }

  deNormalizeAmount(amount: u64, decimals: u32): u64 {
    if (decimals > 8) {
      amount *= 10 ** (decimals - 8);
    }

    return amount;
  }
}
