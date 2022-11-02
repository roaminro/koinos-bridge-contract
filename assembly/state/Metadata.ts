import { Storage } from '@koinos/sdk-as';
import { bridge } from '../proto/bridge';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<bridge.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      bridge.metadata_object.decode, 
      bridge.metadata_object.encode,
      () => new bridge.metadata_object(false, 1, 0)
    );
  }
}
