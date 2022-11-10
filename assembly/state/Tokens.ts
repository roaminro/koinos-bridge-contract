import { Storage } from '@koinos/sdk-as';
import { bridge } from '../proto/bridge';

const TOKENS_SPACE_ID = 101;

export class Tokens extends Storage.Map<Uint8Array, bridge.empty_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      TOKENS_SPACE_ID, 
      bridge.empty_object.decode, 
      bridge.empty_object.encode,
      () => new bridge.empty_object()
    );
  }
}
