import { $query, $update, Opt, Tuple, nat, nat32, nat64 } from "azle";

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

let map = new Map<nat64, nat64>();
const rand = new Random(Opt.None, 42n);

$update;
export function generate(size: nat32): void {
  const rand = new Random(Opt.Some(size), 1n);
  for (const x of rand) {
    map.set(x, x);
  }
}

// Gets the total number of u128 (2-byte) units available. WASM pages are 64KiB
// in size (or 32768 2-byte units). So we get the number of allocated pages and
// multiply by 32768 to get the total number of 2-byte units available.
$query;
export function get_mem(): Tuple<[nat, nat, nat]> {
  // TODO: Find an API to get the WASM memory pages available
  // const size = WebAssembly.getMemoryPagesAvailable() * 32768n;
  const size = 0n;
  return [size, size, size];
}

$update;
export function batch_get(n: nat32): void {
  [...Array(n)].forEach(() => {
    const nextVal = rand.next();

    if (nextVal.done) {
      return;
    }

    const k = nextVal.value;
    map.get(k);
  });
}

$update;
export function batch_put(n: nat32): void {
  [...Array(n)].forEach(() => {
    const nextVal = rand.next();

    if (nextVal.done) {
      return;
    }

    const k = nextVal.value;
    map.set(k, k);
  });
}

$update;
export function batch_remove(n: nat32): void {
  const localRand = new Random(Opt.None, 1n);

  [...Array(n)].forEach(() => {
    const nextVal = localRand.next();

    if (nextVal.done) {
      return;
    }

    const k = nextVal.value;
    map.delete(k);
  });
}
