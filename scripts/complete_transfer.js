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
    "HwsWS8ZU7WmUz_k3Y9OlC9YPSFamMMR_jeXrKAaNZe2SOz8xqzOjRuXO7pS9Wa2bkRD6Q_O53xQHHvntVOsnQJc=",
    "H7V9S6FCSYBqJuOcQmp7FfBzljdR-bgg1TyKBOY1ayj-AvQ6Tok2ihuQVpE6lFDGsmMzS_sXhyKawMeLiHyoD1c=",
    "H-LDbBH7xYP3VCnXJdH-xO7apsgPwwJ6xgJNCRXEEcGRNxegKfeX2DVmHhAmBMeIPElb9HHEsfiXaluicLGjJho="
  ];

  let result = await bridgeContract.functions.complete_transfer({
    transactionId: '0xa64d6e52b6ba96e66e0f195e6d493e7fee9366d03b2e0ff8d26efe35db4ca98c',
    token: '1NZcHP37xvQNDZEkGH2RUceFqa33K3FXEG',
    recipient: '1GE2JqXw5LMQaU1sj82Dy8ZEe2BRXQS1cs',
    value: '25000',
    expiration: '1668133510000',
    signatures
  });

  console.log(result.receipt);

  await result.transaction.wait();
};

main()
  .catch(err => console.error(err));