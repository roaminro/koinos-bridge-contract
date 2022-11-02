import { Storage } from '@koinos/sdk-as';
import { bridge } from '../proto/bridge';

const VALIDATORS_SPACE_ID = 100;

export class Validators extends Storage.Map<Uint8Array, bridge.validator_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      VALIDATORS_SPACE_ID,
      bridge.validator_object.decode,
      bridge.validator_object.encode
    );
  }

  // override "has" because "get" is overriden
  has(address: Uint8Array): boolean{
    const validator = super.get(address);

    return validator ? true : false;
  }

  get(address: Uint8Array): bridge.validator_object {
    const validator = super.get(address);

    return validator ? validator : new bridge.validator_object();
  }
}
