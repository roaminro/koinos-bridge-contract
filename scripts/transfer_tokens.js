const { Signer, Provider, Contract } = require('koilib');
const abi = require('./bridge-abi.json');
require('dotenv').config();

abi.koilib_types = abi.types;

const { PRIVATE_KEY, RPC_URL, BRIDGE_ADDR } = process.env;

const TOKEN_ADDR = '1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju';
const AMOUNT = '200000000';
const RECIPIENT = '0x7EB00942c7387da2Be7d5a65B50d9B82c0Db4cfc';
const CHAIN_ID = 0;

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
    toChain: CHAIN_ID,
    recipient: RECIPIENT
  },{    
    rcLimit: 1000000000,
    sendTransaction: true
  });

  await result.transaction.wait();

  console.log('transaction id', result.transaction.id);
  console.log('transfered tokens', result.receipt.events);
}
main()
  .catch(error => console.error(error));
