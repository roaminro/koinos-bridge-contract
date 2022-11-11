const { Signer, Provider, Contract, utils } = require('koilib');
const { sha256 } = require('@noble/hashes/sha256')
const protobuf = require('protobufjs');
const path = require('path');
const abi = require('./bridge-abi.json')

abi.koilib_types = abi.types;

const USER_WIF = '5KgE5Tfm7zuJ6q6tnUJVW93dCDiDDk5mgaffrRJSdwg5hQbDHGK';
const BRIDGE_CONTRACT_ADDR = '1JaMS92SPa3rQoZqUifP7GJxp2MEULxrJB';

const bridgeProto = new protobuf.Root();
bridgeProto.loadSync(path.join(__dirname, '/../assembly/proto/bridge.proto'), { keepCase: true });
const completeTransferHashProto = bridgeProto.lookupType('bridge.complete_transfer_hash');
const actionIdProto = bridgeProto.lookupEnum('bridge.action_id');

const sign = async (buffer) => {
  const hash = sha256(buffer);
  const signatures = [];
  for (let index = 0; index < validators.length; index++) {
    const validator = validators[index];
    // signatures.push(utils.toHexString(await validator.signHash(hash)));
    signatures.push(utils.encodeBase64url(await validator.signHash(hash)));
  }

  return signatures;
};

const main = async () => {
  const provider = new Provider('http://localhost:8080');

  const signer = Signer.fromWif(USER_WIF);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: BRIDGE_CONTRACT_ADDR,
    abi,
    provider,
    signer,
  });

  const signatures = [
    "H3WQ4cZFt3Pmv4583o4FXJrx8B-_w3m1zm3nxKnrgkWbApU88C7z0P-ghvtWwJ-pZumTVAFnG_QdbitFJrAGWc0=",
    "H6HkSxIyv1vLC2V9PTSUPMHgPEdv-wEpETrag9z4RCNTIKxHGuf86FkTSiIee-G4b22T6hI0F6Ry511Cn-2bh3g=",
    "H7P1sicofw-eg9qyTZ7ErDYVOLDLCUzb8Zdc1wLwDTXCOBba2Ge9BKfZwotRyvdn92YaUPYb0vY2am4A6k3Nxv4="
  ];

  let result = await bridgeContract.functions.complete_transfer({
    transactionId: '0xc4400da5eb03fec6eb0450d1e02b694ea049d103e85ed0d10d568df2ee7800ad',
    token: '1NZcHP37xvQNDZEkGH2RUceFqa33K3FXEG',
    recipient: '1GE2JqXw5LMQaU1sj82Dy8ZEe2BRXQS1cs',
    value: '25000',
    expiration: '1668180607000',
    signatures
  });

  console.log(result.receipt);

  await result.transaction.wait();
};

main()
  .catch(err => console.error(err));