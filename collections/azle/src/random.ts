import { nat32, nat64, Opt } from "azle";

export class Random implements Iterable<nat64> {
  state: nat64;
  size: Opt<nat32>;
  ind: nat32;

  constructor(size: Opt<nat32>, seed: nat64) {
    this.state = seed;
    this.size = size;
    this.ind = 0;
  }

  next(): IteratorResult<nat64, nat64 | undefined> {
    if (this.size.Some !== undefined) {
      const size = this.size.Some;
      this.ind += 1;
      if (this.ind > size) {
        return { value: undefined, done: true };
      }
    }

    this.state = (this.state * 48271n) % 0x7fffffffn;
    return { value: this.state, done: false };
  }

  [Symbol.iterator](): IterableIterator<nat64> {
    return this;
  }
}
