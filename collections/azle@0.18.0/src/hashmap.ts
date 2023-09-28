import {
  nat,
  nat32,
  nat64,
  None,
  Opt,
  query,
  Service,
  Some,
  Tuple,
  update,
  Void,
} from "azle";

class Random implements Iterable<nat64> {
  state: nat64;
  size: Opt<nat32>;
  ind: nat32;

  constructor(size: Opt<nat32>, seed: nat64) {
    this.state = seed;
    this.size = size;
    this.ind = 0;
  }

  next(): IteratorResult<nat64, nat64 | undefined> {
    if (this.size.length !== 0) {
      const size = this.size[0];
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

let map = new Map<nat64, nat64>();
const rand = new Random(None, 42n);

export default Service({
  generate: update([nat32], Void, (size) => {
    const rand = new Random(Some(size), 1n);
    for (const x of rand) {
      map.set(x, x);
    }
  }),
  // Gets the total number of u128 (2-byte) units available. WASM pages are 64KiB
  // in size (or 32768 2-byte units). So we get the number of allocated pages and
  // multiply by 32768 to get the total number of 2-byte units available.
  get_mem: query([], Tuple(nat, nat, nat), () => {
    // TODO: Find an API to get the WASM memory pages available
    // const size = WebAssembly.getMemoryPagesAvailable() * 32768n;
    const size = 0n;
    return [size, size, size];
  }),
  batch_get: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      const nextVal = rand.next();

      if (nextVal.done) {
        return;
      }

      const k = nextVal.value;
      map.get(k);
    });
  }),
  batch_put: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      const nextVal = rand.next();

      if (nextVal.done) {
        return;
      }

      const k = nextVal.value;
      map.set(k, k);
    });
  }),
  batch_remove: update([nat32], Void, (n) => {
    const localRand = new Random(None, 1n);

    [...Array(n)].forEach(() => {
      const nextVal = localRand.next();

      if (nextVal.done) {
        return;
      }

      const k = nextVal.value;
      map.delete(k);
    });
  }),
});
