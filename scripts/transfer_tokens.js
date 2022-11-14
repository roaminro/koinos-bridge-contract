const { Signer, Provider, Contract } = require('koilib');
const abi = require('./bridge-abi.json');
require('dotenv').config();

abi.koilib_types = abi.types;

const { PRIVATE_KEY, RPC_URL, BRIDGE_ADDR } = process.env;

const TOKEN_ADDR = '19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ';
const AMOUNT = '1';
const RECIPIENT = '0x3D7D98070a3B5762fF4ed30Afc58F8f0000bE3b3';

async function main() {
  const provider = new Provider(RPC_URL);
  const signer = Signer.fromWif(PRIVATE_KEY);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: BRIDGE_ADDR,
    abi,
    provider,
    signer,
  });

  const result = await bridgeContract.functions.transfer_tokens({
    from: signer.address,
    token: TOKEN_ADDR,
    amount: AMOUNT,
    recipient: RECIPIENT
  });

  await result.transaction.wait();

  console.log('transaction id', result.transaction.id);
  console.log('transfered tokens', result.receipt.events);
}
main()
  .catch(error => console.error(error));
