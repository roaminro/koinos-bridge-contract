import { chain, System } from "koinos-sdk-as";

const REENNTRACY_GUARD_SPACE_ID = 100001;
const REENNTRACY_GUARD_KEY = new Uint8Array(0);

export class ReentrancyGuard {
  private _space: chain.object_space;

  constructor(contractId: Uint8Array) {
    this._space = new chain.object_space(false, contractId, REENNTRACY_GUARD_SPACE_ID);

    this.check();
    this.set();
  }

  private check(): void {
    const guard = System.getBytes(this._space, REENNTRACY_GUARD_KEY);

    // if guard is triggered, the tx reversion will reset it, so no need to do it
    System.require(guard == null, 'ReentrancyGuard: reentrant call');
  }

  private set(): void {
    System.putBytes(this._space, REENNTRACY_GUARD_KEY, REENNTRACY_GUARD_KEY);
  }

  reset(): void {
    System.removeObject(this._space, REENNTRACY_GUARD_KEY);
  }
}
