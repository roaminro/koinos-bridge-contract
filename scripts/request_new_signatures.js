const { Signer, Provider, Contract, utils } = require('koilib');
const abi = require('./bridge-abi.json')
require('dotenv').config();

abi.koilib_types = abi.types;

const { PRIVATE_KEY, RPC_URL, BRIDGE_ADDR } = process.env;

const main = async () => {
  const provider = new Provider(RPC_URL);

  const signer = Signer.fromWif(PRIVATE_KEY);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: BRIDGE_ADDR,
    abi,
    provider,
    signer,
  });

  let result = await bridgeContract.functions.request_new_signatures({
    transactionId: '0x1220796bb5a9436ef8d1ff79ac2c555b3c3de7f01309f9f24b3e0efa1d00055830f3',
  });

  console.log(result.receipt);

  const res = await result.transaction.wait();
  console.log('block', res.blockNumber);
};

main()
  .catch(err => console.error(err));