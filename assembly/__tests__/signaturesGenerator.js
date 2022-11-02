const { Signer, utils } = require('koilib');
const protobuf = require('protobufjs');
const { sha256 } = require('@noble/hashes/sha256')
const path = require('path');

const CONTRACT_ID = utils.decodeBase58('1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe');

(async () => {
  const bridgeProto = new protobuf.Root();
  bridgeProto.loadSync(path.join(__dirname, '/../proto/bridge.proto'), { keepCase: true });
  const completeTransferHashProto = bridgeProto.lookupType('bridge.complete_transfer_hash');
  const addRemoveActionHashProto = bridgeProto.lookupType('bridge.add_remove_action_hash');
  const actionIdProto = bridgeProto.lookupEnum('bridge.action_id');

  const wif = "5KEX4TMHG66fT7cM9HMZLmdp4hVq4LC4X2Fkg6zeypM5UteWmtd";

  const validators = [];
  const nbValidators = 8;

  for (let index = 0; index < nbValidators; index++) {
    validators[index] = Signer.fromSeed(`validator ${index}`);
    console.log('validator', index, validators[index].getAddress(), validators[index].getPrivateKey('wif', false));
  }

  const sign = async (buffer) => {
    const hash = sha256(buffer);
    const signatures = [];
    for (let index = 0; index < validators.length; index++) {
      const validator = validators[index];
      // signatures.push(utils.toHexString(await validator.signHash(hash)));
      signatures.push(utils.encodeBase64(await validator.signHash(hash)));
    }

    return signatures;
  };

  const signer = Signer.fromWif(wif);
  /*
    message complete_transfer_hash {
      bytes transaction_id = 1;
      bytes token = 2;
      bytes recipient = 3;
      uint64 amount = 4;
      bytes contract_id = 5;
    }
 */
  let buffer = completeTransferHashProto.encode({
    action: actionIdProto.values['complete_transfer'],
    transaction_id: utils.toUint8Array('0xe70f101e559301f9611a680a344f4d58ead8449a281090bbb6ccc4afd6be8990'),
    token: utils.decodeBase58('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ'),
    recipient: utils.decodeBase58('1GE2JqXw5LMQaU1sj82Dy8ZEe2BRXQS1cs'),
    amount: '25000',
    contract_id: CONTRACT_ID
  }).finish();

  let sigs = await sign(buffer);

  console.log('complete_transfer', sigs);

  buffer = addRemoveActionHashProto.encode({
    action: actionIdProto.values['add_supported_token'],
    address: utils.decodeBase58('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ'),
    nonce: '1',
    contract_id: CONTRACT_ID,
    expiration: 123457
  }).finish();
  
  sigs = await sign(buffer);

  console.log('should add support for token', sigs);

  buffer = addRemoveActionHashProto.encode({
    action: actionIdProto.values['add_supported_wrapped_token'],
    address: utils.decodeBase58('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ'),
    nonce: '1',
    contract_id: CONTRACT_ID
  }).finish();
  
  sigs = await sign(buffer);

  console.log('should add support for wrapped token', sigs);

  buffer = addRemoveActionHashProto.encode({
    action: actionIdProto.values['add_validator'],
    address: utils.decodeBase58('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ'),
    nonce: '1',
    contract_id: CONTRACT_ID
  }).finish();
  
  sigs = await sign(buffer);

  console.log('should add validator', sigs);
})();
