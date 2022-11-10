const { Signer, Provider, Contract } = require('koilib');
const fs = require('fs');
const path = require('path');

const abi = require('../abi/delegation_abi.json');

const DELEGATION_CONTRACT_WIF = '5KYeDLo1yqMcAVxm7X2eaFXwsUrfLs9h9uSc1MbGLzbfERKscmm';

const main = async () => {
  const provider = new Provider('https://api.koinosblocks.com');

  // private key for the delegation contract
  const signer = Signer.fromWif(DELEGATION_CONTRACT_WIF);
  signer.provider = provider;

  const contract = new Contract({
    id: signer.address,
    provider: signer.provider,
    signer,
    bytecode: fs.readFileSync(path.resolve(__dirname, '../build/release/contract.wasm'))
  });

  const { transaction, receipt } = await contract.deploy({
    abi: fs.readFileSync(path.resolve(__dirname, '../abi/delegation.abi')).toString(),
    authorizesTransactionApplication: true,
    authorizesUploadContract: true,
    authorizesCallContract: true,
    payer: '1Bf5W4LZ2FTmzPcA6d8QeLgAYmCKdZp2nN'
  });

  console.log(receipt);

  await transaction.wait();
};

main()
  .catch(err => console.error(err));