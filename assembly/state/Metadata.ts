import { Space } from 'koinos-sdk-as';
import { bridge } from '../proto/bridge';

const METADATA_SPACE_ID = 0;
const METADATA_KEY = new Uint8Array(0);

export class Metadata extends Space.Space<Uint8Array, bridge.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(contractId, METADATA_SPACE_ID, bridge.metadata_object.decode, bridge.metadata_object.encode);
  }

  get(): bridge.metadata_object {
    const validator = super.get(METADATA_KEY);

    return validator ? validator : new bridge.metadata_object(false, 1, 0);
  }

  // @ts-ignore put can be overriden this way
  put(metadata: bridge.metadata_object): void {
    super.put(METADATA_KEY, metadata);
  }
}
