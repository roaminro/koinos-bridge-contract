const { Signer, Provider, Contract } = require('koilib');
const path = require('path');
const fs = require('fs');
const abi = require('./token-abi.json')
require('dotenv').config();

const { TOKEN_PK, RPC_URL } = process.env;

abi.koilib_types = abi.types;

async function main() {
  // deploy bridge contract
  const provider = new Provider(RPC_URL);
  const signer = Signer.fromWif(TOKEN_PK);
  signer.provider = provider;

  const bytecode = fs.readFileSync(path.resolve(__dirname, '../build/release/contract.wasm'));
  const bridgeContract = new Contract({
    id: signer.address,
    abi,
    provider,
    signer,
    bytecode
  });

  const { transaction } = await bridgeContract.deploy({
    abi: fs.readFileSync(path.resolve(__dirname, '../abi/token.abi')).toString(),
  });

  await transaction.wait();

  console.log('token contract deployed at', bridgeContract.getId());

}

main()
  .catch(error => console.error(error));
