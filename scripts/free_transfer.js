const { Signer, Provider, Contract, utils } = require('koilib');

const USER_WIF = '5KgE5Tfm7zuJ6q6tnUJVW93dCDiDDk5mgaffrRJSdwg5hQbDHGK';
const DELEGATION_CONTRACT_ADDR = '1P3GbpJMcgXK7HtuE7kcPkSGS4J6TTARZZ';

const main = async () => {
  const provider = new Provider('https://api.koinosblocks.com');
  // private key of the account that wants to use the delegation contract
  const signer = Signer.fromWif(USER_WIF);
  signer.provider = provider;

  const koinContract = new Contract({
    id: '19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ',
    abi: utils.tokenAbi,
    provider,
    signer,
  });

  const koin = koinContract.functions;

  const { transaction, receipt } = await koin.transfer({
    from: signer.address,
    to: '18VpN36TGrssknBaAbA68nuZFMebN8QDro',
    value: '1',
  }, {
    rcLimit: '1000000000',
    payer: DELEGATION_CONTRACT_ADDR,
    payee: signer.address
  });

  console.log(transaction, receipt);

  await transaction.wait();
};

main()
  .catch(err => console.error(err));