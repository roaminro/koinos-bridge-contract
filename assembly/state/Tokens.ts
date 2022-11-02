import { Storage } from '@koinos/sdk-as';
import { bridge } from '../proto/bridge';

const TOKENS_SPACE_ID = 101;

export class Tokens extends Storage.Map<Uint8Array, bridge.token_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      TOKENS_SPACE_ID, 
      bridge.token_object.decode, 
      bridge.token_object.encode
    );
  }

  // override "has" because "get" is overriden
  has(address: Uint8Array): boolean{
    const token = super.get(address);

    return token ? true : false;
  }

  get(address: Uint8Array): bridge.token_object {
    const token = super.get(address);

    return token ? token : new bridge.token_object();
  }
}
