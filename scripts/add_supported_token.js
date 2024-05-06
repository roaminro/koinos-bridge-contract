const { Signer, Provider, Contract, utils } = require('koilib');
const path = require('path');
const fs = require('fs');
const protobuf = require('protobufjs');
const { sha256 } = require('@noble/hashes/sha256')
const abi = require('./bridge-abi.json')
require('dotenv').config();

const { VALIDATORS_PK, PRIVATE_KEY, RPC_URL, BRIDGE_ADDR } = process.env;

const TOKEN_ADDR = '1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju';

const pks = VALIDATORS_PK.split('|');

const validators = [];
for (let index = 0; index < pks.length; index++) {
  const pk = pks[index];
  validators.push(Signer.fromWif(pk));
}

abi.koilib_types = abi.types;

const bridgeProto = new protobuf.Root();
bridgeProto.loadSync(path.join(__dirname, '/../assembly/proto/bridge.proto'), { keepCase: true });
const addRemoveActionHashProto = bridgeProto.lookupType('bridge.add_remove_action_hash');
const actionIdProto = bridgeProto.lookupEnum('bridge.action_id');

const sign = async (buffer) => {
  const hash = sha256(buffer);
  const signatures = [];
  for (let index = 0; index < validators.length; index++) {
    const validator = validators[index];
    signatures.push(utils.encodeBase64url(await validator.signHash(hash)));
  }

  return signatures;
};

async function main() {
  // deploy bridge contract
  const provider = new Provider(RPC_URL);
  const signer = Signer.fromWif(PRIVATE_KEY);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: signer.address,
    abi,
    provider,
    signer,
  });

  let { result: { nonce, chainId } } = await bridgeContract.functions.get_metadata();

  let expiration = `${new Date().getTime()+3600*1000}`;
  let buffer = addRemoveActionHashProto.encode({
    action: actionIdProto.values['add_supported_token'],
    address: utils.decodeBase58(TOKEN_ADDR),
    nonce,
    contract_id: utils.decodeBase58(BRIDGE_ADDR),
    expiration,
    chain: chainId
  }).finish();  

  let signatures = await sign(buffer);

  const result = await bridgeContract.functions.add_supported_token({
    signatures,
    token: TOKEN_ADDR,
    expiration
  },{    
    rcLimit: 1000000000,
    sendTransaction: true
  });

  console.log(result.transaction)
  await result.transaction.wait();

  console.log('added support for token ', TOKEN_ADDR);
}

main()
  .catch(error => console.error(error));
