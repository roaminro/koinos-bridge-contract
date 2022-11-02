import { MockVM, Base58, Arrays, StringBytes, System, Base64, chain } from "@koinos/sdk-as";
import { Bridge } from "../Bridge";
import { bridge } from "../proto/bridge";

const CONTRACT_ID = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");

// ordered to ease the unit tests
const validatorsAddr = [
  '17ZLzYQgEJoW5nUpJVueYpfSnzn5CZsUwp',
  '1APSqB9thACzxSL9uL43gqTUYrHYX5JrdA',
  '1ApwoZ7GyCFJSUizrFzwJaSJMvByJyoAgr',
  '1BTG2Xo4EgMMchMSytW3bmyY75Ce54oCaw',
  '1GWSnBFJB1fx2Qotb3nx9b2JL9TFB14e2P',
  '1Dd9qtqWTPGvhKRLhyDvPkNsGPK1qNz6Hk',
  '1MwE1VWBWyRNDWcdgDGNChatXBU73Sc42p',
  '1FTx6dfpvSpyToKmkdAAQsVHW6DsyqSeHZ',
];

const validatorsAddrBytes: Uint8Array[] = [];

validatorsAddr.forEach((valAddr) => {
  validatorsAddrBytes.push(Base58.decode(valAddr));
});

const convertSigsToBytes = (signatures: string[]): Uint8Array[] => {
  const ret: Uint8Array[] = [];

  for (let index = 0; index < signatures.length; index++) {
    ret.push(Base64.decode(signatures[index]));
  }

  return ret;
};

describe('bridge', () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    // we don't set any block_time in the head info so that we don't need to set an expiration in our tests
    MockVM.setHeadInfo(new chain.head_info());
  });

  it('should initialize bridge', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    const getMetaArgs = new bridge.get_metadata_arguments();
    const metadata = b.get_metadata(getMetaArgs);

    expect(metadata.nb_validators).toBe(8);

    let getValArgs = new bridge.get_validators_arguments(validatorsAddrBytes[0]);
    let res = b.get_validators(getValArgs);

    expect(res.addresses.length).toBe(8);
    for (let index = 0; index < res.addresses.length; index++) {
      const val = res.addresses[index];
      expect(Arrays.equal(val, validatorsAddrBytes[index]));
    }
  });

  it('should not initialize bridge', () => {
    // missing validators
    expect(() => {
      const b = new Bridge();
      const validators: Uint8Array[] = [];

      const initArgs = new bridge.initialize_arguments(validators);

      b.initialize(initArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Validators required');

    // not unique validators
    expect(() => {
      MockVM.setContractId(CONTRACT_ID);
      const b = new Bridge();
      const validators: Uint8Array[] = [];
      for (let index = 0; index < validatorsAddrBytes.length; index++) {
        validators.push(validatorsAddrBytes[index]);
      }

      validators.push(validatorsAddrBytes[5]);

      const initArgs = new bridge.initialize_arguments(validators);

      b.initialize(initArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Validator not unique');

    // already initialized
    expect(() => {
      MockVM.setContractId(CONTRACT_ID);
      const b = new Bridge();
      const initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

      b.initialize(initArgs);
      b.initialize(initArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Contract already initialized');
  });

  it('should add support for token', () => {
    MockVM.setHeadInfo(new chain.head_info(null, 123456));
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    const signatures = convertSigsToBytes([
      'H+Y6m6vRLFXRDN8OnWkrWKmcwNOE0Ib8NoBAkyjXomKsXMgyIzvjgsPLkWCb7+JuR96zHG1eDafrC8wIoj5mZrQ=',
      'Hw+s64tgoE6L/HsVHnd8CrFrGK7kY9L2emq3fqbHHQaQG6VrmZoUqR7zrTjIND47UxbH1LzPs8d2i02Yfb1B20g=',
      'H2iClnYBCziOolekL/4DNUX1zoYGdrmedaMfM65F4u1DQWEjEu98ImfzB3ptJjiW6VwzjSXkKHMIC/pHYirWFqE=',
      'HxQ2gTOIgDwY7f9Lkuf3uhQK3AhCjmXdDgKz5M+Lh6bkdF3UmZVAirjf8B1/YQ0NL6vyG3XD7hyhVn7OMks2Zw4=',
      'IOkpAB0Z8i9BN58uODf5arwzM7a6UEgLCL6OSz77c1CrHaSQPMlzvS+k4blivYo95Csj5W33pLMOqYE6ss5Q/aA=',
      'H+J7+BplkQFEFTDRACVHZls9y9jXU5eU624IoHaDyfo/Purcajf7fq2nul/ZKcSa9NLfNucAK7c6UVSIrvYmUrg=',
      'H86M5kwU1hRwMX+JxnF8wvt2MIzEhPrmNhDow9lWPvjwBIyA7jPeswGIyARWSgzCn4N6RboovvfAS+ju6QBWMNw=',
      'IGpDS6X/bgaj5wVcx6CdPWB/8PhWeXFKIUHaCDtpb8iLX9ouFX8WhTSy8UvLUIMFo/zkN7nAi0kz2k3Pnz1SO6M='
    ]);

    const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr, 123457);
    b.add_supported_token(addTokenArgs);

    const getTokenArgs = new bridge.get_supported_tokens_arguments(tokenAddr);
    const res = b.get_supported_tokens(getTokenArgs);

    expect(res.addresses.length).toBe(1);
    expect(Arrays.equal(res.addresses[0], tokenAddr)).toBe(true);

    const ev = MockVM.getEvents()[0];
    expect(ev.name).toStrictEqual('bridge.add_supported_token_result');
    expect(Arrays.equal(ev.impacted[0], tokenAddr)).toBe(true);
  });

  it('should not add support for token', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    MockVM.commitTransaction();

    expect(() => {
      const b = new Bridge();
      const signatures = convertSigsToBytes([
        'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
        'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
        'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
        'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
        'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q=',
        'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
        'IJOAvfUnuxkFEDOJKa4sbPWmsSBY3HXcqyJO7J1pZUowNdURN+ZABAzUEnmj2xir8tZrIFJjO0Y6KyMDVkoCkyc=',
        'H6+Nq3s17Vu3LfRCst301d6YhYfUXnY8UGcQaXiLj6W0aWaKb2lgBXcjpZa8enb25kjGtu+s91tc1TbkfprAH50='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPK');

      const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);
      b.add_supported_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('1M7YfL49EK4NGs9ZYKNTeBx9HTMEz3Fh2S is not a validator');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
        'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
        'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
        'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
        'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q=',
        'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
        'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
        'IJOAvfUnuxkFEDOJKa4sbPWmsSBY3HXcqyJO7J1pZUowNdURN+ZABAzUEnmj2xir8tZrIFJjO0Y6KyMDVkoCkyc=',
        'H6+Nq3s17Vu3LfRCst301d6YhYfUXnY8UGcQaXiLj6W0aWaKb2lgBXcjpZa8enb25kjGtu+s91tc1TbkfprAH50='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

      const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);
      b.add_supported_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('validator 1BTG2Xo4EgMMchMSytW3bmyY75Ce54oCaw already signed');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
        'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
        'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
        'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
        'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);

      b.add_supported_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('quorum not met');

    const signatures = convertSigsToBytes([
      'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
      'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
      'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
      'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
      'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q=',
      'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
      'IJOAvfUnuxkFEDOJKa4sbPWmsSBY3HXcqyJO7J1pZUowNdURN+ZABAzUEnmj2xir8tZrIFJjO0Y6KyMDVkoCkyc=',
      'H6+Nq3s17Vu3LfRCst301d6YhYfUXnY8UGcQaXiLj6W0aWaKb2lgBXcjpZa8enb25kjGtu+s91tc1TbkfprAH50='
    ]);

    const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);
    b.add_supported_token(addTokenArgs);

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
        'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
        'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
        'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
        'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q=',
        'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
        'IJOAvfUnuxkFEDOJKa4sbPWmsSBY3HXcqyJO7J1pZUowNdURN+ZABAzUEnmj2xir8tZrIFJjO0Y6KyMDVkoCkyc=',
        'H6+Nq3s17Vu3LfRCst301d6YhYfUXnY8UGcQaXiLj6W0aWaKb2lgBXcjpZa8enb25kjGtu+s91tc1TbkfprAH50='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);

      b.add_supported_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Token already exists');

    expect(() => {
      MockVM.setHeadInfo(new chain.head_info(null, 123456));
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H5lFRpLkZXaoaWf0gc2kcOKSPxVv3UKTboBNAnM3q6RwNgJ4pYtYnfujKr+vf1y1NPGe3Dt0IPEEV9zyoxJQaB8=',
        'ID9TrPaRw+/9jFPBKLcnE3/PH3gELjgg6xK+dOfkQQroG50wxOXi6aQDBSQoZFLCyPH7FrdR2pQLxv6lFCqi22w=',
        'IIYmnE/temidt3AxWc2J6hssaNQJJBfOXKWtLV8lNV1+PXk9eaK3tuGh5JgCq5xEd7qcUi4aybl7E6bqDIDItIU=',
        'IOXq8mIS6ZmyuoT7ARA27z1L2eWVBP0rNI5KmjK9hLlmHRv9U7N7Ut15vWxpzKA56aT55q7svckSdRMHmOguhT4=',
        'H3NzUiI5CpOc0+EttyIfLumxmFhR7wsMP5zYlkM25tDxLarRTLv6trdBWQC3g3pCafnEwzk+9sWqoLlWH4xLY8Q=',
        'H4KMreDNVxSP8G6Q6r7QWCnXdjE29E4V3bHStnBcecpNSwacxDrsX8s+xQkZM1w/BiGFwD3/k7IwWqlEHkmEWxI=',
        'IJOAvfUnuxkFEDOJKa4sbPWmsSBY3HXcqyJO7J1pZUowNdURN+ZABAzUEnmj2xir8tZrIFJjO0Y6KyMDVkoCkyc=',
        'H6+Nq3s17Vu3LfRCst301d6YhYfUXnY8UGcQaXiLj6W0aWaKb2lgBXcjpZa8enb25kjGtu+s91tc1TbkfprAH50='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addTokenArgs = new bridge.add_supported_token_arguments(signatures, tokenAddr);

      b.add_supported_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Expired signatures');
  });

  it('should add support for wrapped token', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    const signatures = convertSigsToBytes([
      'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
      'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
      'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
      'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
      'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
      'INLnIlY2FqxIIb6XcjGg1EmTwLoMMnwe+6AVSACJd0ipEp7/Cw/aFz1G14aOXPd86TYUHuzQZQVFQBRFXqEVhfo=',
      'IPoiiFz5fg57E4BcSyPJWciqnCuhdVPy2ayw7/JstuRiHTXSqh/wQNJw+mwm2ODD2v9ypVigyY6W0kd+yjtCTZE=',
      'H7T3AZ9yuuYb10SEjTurwv2W9jrnSFoPAuFJ9z/kRoW1W6xf/duDP9q6zqUjHwaouFNFvJlQq8ieurH/F8RBCPc='
    ]);

    const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);
    b.add_supported_wrapped_token(addTokenArgs);

    const getTokenArgs = new bridge.get_supported_wrapped_tokens_arguments(tokenAddr);
    const res = b.get_supported_wrapped_tokens(getTokenArgs);

    expect(res.addresses.length).toBe(1);
    expect(Arrays.equal(res.addresses[0], tokenAddr)).toBe(true);

    const ev = MockVM.getEvents()[0];
    expect(ev.name).toStrictEqual('bridge.add_supported_wrapped_token_result');
    expect(Arrays.equal(ev.impacted[0], tokenAddr)).toBe(true);
  });

  it('should not add support for wrapped token', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    MockVM.commitTransaction();

    expect(() => {
      const b = new Bridge();
      const signatures = convertSigsToBytes([
        'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
        'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
        'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
        'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
        'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
        'INLnIlY2FqxIIb6XcjGg1EmTwLoMMnwe+6AVSACJd0ipEp7/Cw/aFz1G14aOXPd86TYUHuzQZQVFQBRFXqEVhfo=',
        'IPoiiFz5fg57E4BcSyPJWciqnCuhdVPy2ayw7/JstuRiHTXSqh/wQNJw+mwm2ODD2v9ypVigyY6W0kd+yjtCTZE=',
        'H7T3AZ9yuuYb10SEjTurwv2W9jrnSFoPAuFJ9z/kRoW1W6xf/duDP9q6zqUjHwaouFNFvJlQq8ieurH/F8RBCPc='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPK');

      const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);
      b.add_supported_wrapped_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('16CAaFoNPh9yZmbzod7NXAymFmxeU1EKnQ is not a validator');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
        'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
        'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
        'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
        'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
        'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
        'INLnIlY2FqxIIb6XcjGg1EmTwLoMMnwe+6AVSACJd0ipEp7/Cw/aFz1G14aOXPd86TYUHuzQZQVFQBRFXqEVhfo=',
        'IPoiiFz5fg57E4BcSyPJWciqnCuhdVPy2ayw7/JstuRiHTXSqh/wQNJw+mwm2ODD2v9ypVigyY6W0kd+yjtCTZE=',
        'H7T3AZ9yuuYb10SEjTurwv2W9jrnSFoPAuFJ9z/kRoW1W6xf/duDP9q6zqUjHwaouFNFvJlQq8ieurH/F8RBCPc='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

      const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);
      b.add_supported_wrapped_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('validator 1FTx6dfpvSpyToKmkdAAQsVHW6DsyqSeHZ already signed');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
        'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
        'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
        'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
        'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);

      b.add_supported_wrapped_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('quorum not met');

    const signatures = convertSigsToBytes([
      'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
      'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
      'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
      'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
      'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
      'INLnIlY2FqxIIb6XcjGg1EmTwLoMMnwe+6AVSACJd0ipEp7/Cw/aFz1G14aOXPd86TYUHuzQZQVFQBRFXqEVhfo=',
      'IPoiiFz5fg57E4BcSyPJWciqnCuhdVPy2ayw7/JstuRiHTXSqh/wQNJw+mwm2ODD2v9ypVigyY6W0kd+yjtCTZE=',
      'H7T3AZ9yuuYb10SEjTurwv2W9jrnSFoPAuFJ9z/kRoW1W6xf/duDP9q6zqUjHwaouFNFvJlQq8ieurH/F8RBCPc='
    ]);

    const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);
    b.add_supported_wrapped_token(addTokenArgs);

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H80QLYEdEJQ+sCKZBmEi44NvbIRiigJJB/r8Vu6YmNGVbk63hlrNxk6u+a7ZqqZLKUCSyYFpqtK4Fv51nENKSQE=',
        'H/Auu18V8Ft51mqy6SxCvX5agX3JUn/3UuR2z9Yc74AFcf57cl4vEbPQQaV0ISgIicasjZ0cRSIWRoPjLmuG3/M=',
        'HybNR4I3VHePD6s+13LRBlIkovmUnzwYR2GoPcRuOBjNMuT+2Gy1kvrYYmzC3dz8h36JDSbyI0NapohoTRsnVEo=',
        'H+2Ve1nOM2+/fFD5Ss/bddMRJ10vr21ePkofH/1CKS3DPsuwJFbGYaaCuZnhY78QqT5loAbL2d80MOM+e57He1c=',
        'IIiEch6ccUdmpT4GYcbVzjbuR5Duf9tQTER5MGYL93KsNa/T2Kj98ABqnGwygKBtmJ1SuIrCfuupSUoGHwgN5Kc=',
        'INLnIlY2FqxIIb6XcjGg1EmTwLoMMnwe+6AVSACJd0ipEp7/Cw/aFz1G14aOXPd86TYUHuzQZQVFQBRFXqEVhfo=',
        'IPoiiFz5fg57E4BcSyPJWciqnCuhdVPy2ayw7/JstuRiHTXSqh/wQNJw+mwm2ODD2v9ypVigyY6W0kd+yjtCTZE=',
        'H7T3AZ9yuuYb10SEjTurwv2W9jrnSFoPAuFJ9z/kRoW1W6xf/duDP9q6zqUjHwaouFNFvJlQq8ieurH/F8RBCPc='
      ]);

      const tokenAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addTokenArgs = new bridge.add_supported_wrapped_token_arguments(signatures, tokenAddr);

      b.add_supported_wrapped_token(addTokenArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Token already exists');
  });

  it('should add a validator', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    const signatures = convertSigsToBytes([
      'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
      'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
      'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
      'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
      'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
      'H2NifuR0/STtBJQc5UkEIgwXNiybV1uVtCO6mplTu35wGgJSSPWjibwl7JOSW95tqAdUc0p7W437bhcvD5fX0ic=',
      'IAvMl4F4Iii+UlJcKB9pr4zsVlaUBm+xDa0VeWEZMximA9FePyOy9LmL/JWDP2TZGGyC0N1p+WZ+kj9FsvBEJaw=',
      'IKb6TP5XFg1VZMRwDc87FL4+8Wy8gZKItSJ9TaNa5HNJfKGZKHm8jv8X63EPLQxTFgp5srI/4quxyNeBun1RLkk='
    ]);

    const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);
    b.add_validator(addValidatorArgs);

    const getValidatorArgs = new bridge.get_validators_arguments(Base58.decode(validatorsAddr[0]));
    const res = b.get_validators(getValidatorArgs);

    expect(res.addresses.length).toBe(9);
    expect(Arrays.equal(res.addresses[1], validatorAddr)).toBe(true);

    const ev = MockVM.getEvents()[0];
    expect(ev.name).toStrictEqual('bridge.add_validator_result');
    expect(Arrays.equal(ev.impacted[0], validatorAddr)).toBe(true);
  });

  it('should not add a validator', () => {
    const b = new Bridge();
    let initArgs = new bridge.initialize_arguments(validatorsAddrBytes);

    b.initialize(initArgs);

    MockVM.commitTransaction();

    expect(() => {
      const b = new Bridge();
      const signatures = convertSigsToBytes([
        'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
        'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
        'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
        'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
        'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
        'H2NifuR0/STtBJQc5UkEIgwXNiybV1uVtCO6mplTu35wGgJSSPWjibwl7JOSW95tqAdUc0p7W437bhcvD5fX0ic=',
        'IAvMl4F4Iii+UlJcKB9pr4zsVlaUBm+xDa0VeWEZMximA9FePyOy9LmL/JWDP2TZGGyC0N1p+WZ+kj9FsvBEJaw=',
        'IKb6TP5XFg1VZMRwDc87FL4+8Wy8gZKItSJ9TaNa5HNJfKGZKHm8jv8X63EPLQxTFgp5srI/4quxyNeBun1RLkk='
      ]);

      const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPK');

      const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);
      b.add_validator(addValidatorArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('15Q6zC8Q4mHy3AoCKb2bEfLaGrzuUGjtGj is not a validator');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
        'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
        'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
        'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
        'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
        'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
        'H2NifuR0/STtBJQc5UkEIgwXNiybV1uVtCO6mplTu35wGgJSSPWjibwl7JOSW95tqAdUc0p7W437bhcvD5fX0ic=',
        'IAvMl4F4Iii+UlJcKB9pr4zsVlaUBm+xDa0VeWEZMximA9FePyOy9LmL/JWDP2TZGGyC0N1p+WZ+kj9FsvBEJaw=',
        'IKb6TP5XFg1VZMRwDc87FL4+8Wy8gZKItSJ9TaNa5HNJfKGZKHm8jv8X63EPLQxTFgp5srI/4quxyNeBun1RLkk='
      ]);

      const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

      const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);
      b.add_validator(addValidatorArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('validator 1FTx6dfpvSpyToKmkdAAQsVHW6DsyqSeHZ already signed');

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
        'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
        'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
        'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
        'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU='
      ]);

      const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);

      b.add_validator(addValidatorArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('quorum not met');

    const signatures = convertSigsToBytes([
      'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
      'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
      'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
      'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
      'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
      'H2NifuR0/STtBJQc5UkEIgwXNiybV1uVtCO6mplTu35wGgJSSPWjibwl7JOSW95tqAdUc0p7W437bhcvD5fX0ic=',
      'IAvMl4F4Iii+UlJcKB9pr4zsVlaUBm+xDa0VeWEZMximA9FePyOy9LmL/JWDP2TZGGyC0N1p+WZ+kj9FsvBEJaw=',
      'IKb6TP5XFg1VZMRwDc87FL4+8Wy8gZKItSJ9TaNa5HNJfKGZKHm8jv8X63EPLQxTFgp5srI/4quxyNeBun1RLkk='
    ]);

    const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');

    const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);
    b.add_validator(addValidatorArgs);

    expect(() => {
      const b = new Bridge();

      const signatures = convertSigsToBytes([
        'H45uKmYRzh7dx1AFj6BcntFR2jIP/pWwY5E75RU1tOTOPn/uqqtv7VRYrB2h3yPP9x2Ub0zHfdK6Z24hML0m7cg=',
        'H7RBwkulIxkL2kwPq+93DZXGe6JCjV6Abmx14HQWxSOIXpssH8y4unbxdlQn5BnmZU5MLYVkZbacsfWEi30z/+U=',
        'IKvCMTS3tlNyf8DwgkFV3URtzo0C3nUjBly3VPWCDwg7YubGrvvJpVXYCl3Vl2AiqJ7WZjL0c3KR8AC2aSAJBM8=',
        'HwTiBABA7fJLB198YG2/Zx7RVIzK2NTn5kocA5mQeeauHCYnjsqkb4+pTIE5v2D9BwyvmLPCHudVqTEU3Kipt2A=',
        'H0EVliEHi1CUURle5qWobakp5AKA9NaBRcDBsoXifgbjCFmigo6q1zDhLiLzcFTvKkbQfHMwX2bZDudhLjEOeOU=',
        'H2NifuR0/STtBJQc5UkEIgwXNiybV1uVtCO6mplTu35wGgJSSPWjibwl7JOSW95tqAdUc0p7W437bhcvD5fX0ic=',
        'IAvMl4F4Iii+UlJcKB9pr4zsVlaUBm+xDa0VeWEZMximA9FePyOy9LmL/JWDP2TZGGyC0N1p+WZ+kj9FsvBEJaw=',
        'IKb6TP5XFg1VZMRwDc87FL4+8Wy8gZKItSJ9TaNa5HNJfKGZKHm8jv8X63EPLQxTFgp5srI/4quxyNeBun1RLkk='
      ]);

      const validatorAddr = Base58.decode('19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ');
      const addValidatorArgs = new bridge.add_validator_arguments(signatures, validatorAddr);

      b.add_validator(addValidatorArgs);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('Validator already exists');
  });
});
