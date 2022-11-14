const { Signer, Provider, Contract, utils } = require('koilib');
const abi = require('./bridge-abi.json')

abi.koilib_types = abi.types;

// const USER_WIF = '5KgE5Tfm7zuJ6q6tnUJVW93dCDiDDk5mgaffrRJSdwg5hQbDHGK';
// const BRIDGE_CONTRACT_ADDR = '1JaMS92SPa3rQoZqUifP7GJxp2MEULxrJB';

const USER_WIF = '5Hs4H2Ks2EyFZTMxkQprC5t54Xw5LRDoHRfyjedNNBJC4jcM1nU';
const BRIDGE_CONTRACT_ADDR = '17XHjr7n2E4auykiHkfJMLGGovvaCadtQS';

const main = async () => {
  // const provider = new Provider('http://localhost:8080');
  const provider = new Provider('https://harbinger-api.koinos.io');

  const signer = Signer.fromWif(USER_WIF);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: BRIDGE_CONTRACT_ADDR,
    abi,
    provider,
    signer,
  });

  const signatures = [
    "H17JrQ0FtuqmzTwPsHtzvS9ovb4uBwcTa9Uki0swt-xRc8zjzkvn_wKnjE94X8La4g_RR3paSoEaryNvCcw-i-c=",
    "IKGYmCJiCcj56I4C03Bn0JgKizGMqLkQIHx4uI2AxoZ2IM2ifwOEeuT_sIBocyVvVti0x68-o4DoO3U9w6ZyVsg=",
    "ICgywzuM82ZgKQ1XQQ_DxYNyTwLIwjubdmXJTiZDlQJfBcuxIQlWBQMiHBHVEsKqKY624cZ4iPoGpHWIdmVmu8w="
  ];

  let result = await bridgeContract.functions.complete_transfer({
    transactionId: '0x2f458303bf74101568eca556aab36bcc2f1d1a48a0f583ba59c6d496ea2d824a',
    token: '1KazZFUnZSLjeXq2QrifdnYqiBvA7RVF3G',
    recipient: '1Bf5W4LZ2FTmzPcA6d8QeLgAYmCKdZp2nN',
    value: '1',
    expiration: '1668411096000',
    signatures
  });

  // let result = await bridgeContract.functions.complete_transfer({
  //   transactionId: '0xc4519e2c82831a2760bd3fbbdef9b2e946c865ed2a8558ea6fe6f9c4b883c73d',
  //   token: '1NZcHP37xvQNDZEkGH2RUceFqa33K3FXEG',
  //   recipient: '1GE2JqXw5LMQaU1sj82Dy8ZEe2BRXQS1cs',
  //   value: '25000',
  //   expiration: '1668411096000',
  //   signatures
  // });

  console.log(result.receipt);

  const res = await result.transaction.wait();
  console.log('block', res.blockNumber);
};

main()
  .catch(err => console.error(err));