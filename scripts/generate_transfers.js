const { Signer, Provider, Contract } = require('koilib');
const { LocalKoinos } = require('@roamin/local-koinos');
const abi = require('./bridge-abi.json')

abi.koilib_types = abi.types;

const BRIDGE_CONTRACT_ADDR = '1JaMS92SPa3rQoZqUifP7GJxp2MEULxrJB';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const localKoinos = new LocalKoinos();
  const [genesis, koin, bridge, mockToken, val1, val2, val3, user] = localKoinos.getAccounts();

  const provider = new Provider('http://localhost:8080');

  const signer = Signer.fromWif(user.wif);
  signer.provider = provider;

  const bridgeContract = new Contract({
    id: BRIDGE_CONTRACT_ADDR,
    abi,
    provider,
    signer,
  });

  for (let index = 0; index < 100000; index++) {
    try {
      const result = await bridgeContract.functions.transfer_tokens({
        from: signer.address,
        token: mockToken.address,
        amount: '2500',
        recipient: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
      });

      await result.transaction.wait();

      console.log('transfer tokens', result.receipt.events);
    } catch (error) {
      console.error(error);
      await sleep(4000);

    }
  }
}
main()
  .catch(error => console.error(error))
