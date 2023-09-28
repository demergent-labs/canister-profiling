import {
  nat,
  nat32,
  nat64,
  None,
  query,
  Canister,
  Some,
  Tuple,
  update,
  Void,
} from "azle";
import Heap from "heap";
import { Random } from "./random";

// Heap is a min-heap by default
let map = new Heap<nat64>();
const rand = new Random(None, 42n);

export default Canister({
  generate: update([nat32], Void, (size) => {
    const rand = new Random(Some(size), 1n);
    for (const x of rand) {
      map.push(x);
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
      map.pop();
    });
  }),
  batch_put: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      const nextVal = rand.next();

      if (nextVal.done) {
        return;
      }

      const k = nextVal.value;
      map.push(k);
    });
  }),
  batch_remove: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      map.pop();
    });
  }),
});
