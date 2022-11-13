const { Signer, Provider, Contract } = require('koilib');
const path = require('path');
const fs = require('fs');
const abi = require('./bridge-abi.json')
require('dotenv').config();

const { VALIDATORS_ADDR, PRIVATE_KEY, RPC_URL } = process.env;

const validators = VALIDATORS_ADDR.split('|');

abi.koilib_types = abi.types;

async function main() {
  // deploy bridge contract
  const provider = new Provider(RPC_URL);
  const signer = Signer.fromWif(PRIVATE_KEY);
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
    abi: fs.readFileSync(path.resolve(__dirname, '../abi/bridge.abi')).toString(),
  });

  await transaction.wait();

  console.log('bridge contract deployed at', bridgeContract.getId());

  const result = await bridgeContract.functions.initialize({
    initialValidators: validators
  });

  await result.transaction.wait();

  console.log('initialized bridge contract');

}

main()
  .catch(error => console.error(error));
