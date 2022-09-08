import { Space } from 'koinos-sdk-as';
import { bridge } from '../proto/bridge';

const WRAPPED_TOKENS_SPACE_ID = 102;

export class WrappedTokens extends Space.Space<Uint8Array, bridge.wrapped_token_object> {
  constructor(contractId: Uint8Array) {
    super(contractId, WRAPPED_TOKENS_SPACE_ID, bridge.wrapped_token_object.decode, bridge.wrapped_token_object.encode);
  }

  // override "has" because "get" is overriden
  // @ts-ignore
  has(address: Uint8Array): bool{
    const token = super.get(address);

    return token ? true : false;
  }

  get(address: Uint8Array): bridge.wrapped_token_object {
    const token = super.get(address);

    return token ? token : new bridge.wrapped_token_object();
  }
}
