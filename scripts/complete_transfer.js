const { Signer, Provider, Contract, utils } = require('koilib');
const abi = require('./bridge-abi.json')

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

  const signatures = [
    "IL1HmPger6O1erHP12qiQoWo9mFkXiRuCKWfM-BhFXY0bUh_Ex4213UV3ftK4JwEOUMKjT8TZsWKZM_ojJYb4pE=",
    "IHQGflMBSJVuYU9Im1mWE5r1IMvpfPKxsoAYkiRRAFz1J8Orflqo09PRm1uQ9J_z8G2XjKf5sG89S8yDaw_WQqA=",
    "H5vmEJi-3n1JSNjrHycDacTWNQusCpuiiwRyEB_SCng5TsKIUn06Qfln8ATroCMAdIFclQZ83lIIaqDTqmcX-BU="
  ];

  let result = await bridgeContract.functions.complete_transfer({
    transactionId: '0xeaf75ff289091a5df0215c47e383106c16439c9b5520de396c1b7c7e93f13ad1',
    token: '1KazZFUnZSLjeXq2QrifdnYqiBvA7RVF3G',
    recipient: '1Bf5W4LZ2FTmzPcA6d8QeLgAYmCKdZp2nN',
    value: '1',
    expiration: '1668465588000',
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