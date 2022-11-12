const { Signer, Provider, Contract, utils } = require('koilib');
const abi = require('./bridge-abi.json')

abi.koilib_types = abi.types;

const USER_WIF = '5KgE5Tfm7zuJ6q6tnUJVW93dCDiDDk5mgaffrRJSdwg5hQbDHGK';
const BRIDGE_CONTRACT_ADDR = '1JaMS92SPa3rQoZqUifP7GJxp2MEULxrJB';

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

  let result = await bridgeContract.functions.request_new_signatures({
    transactionId: '0x1220796bb5a9436ef8d1ff79ac2c555b3c3de7f01309f9f24b3e0efa1d00055830f3',
  });

  console.log(result.receipt);

  const res = await result.transaction.wait();
  console.log('block', res.blockNumber);
};

main()
  .catch(err => console.error(err));