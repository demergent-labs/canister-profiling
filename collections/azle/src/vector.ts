import { nat, nat32, nat64, query, Canister, Tuple, update, Void } from "azle";

let map: nat64[] = [];

export default Canister({
  generate: update([nat32], Void, (size) => {
    map.length = 0;
    [...Array(size)].forEach(() => {
      map.push(42n);
    });
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
    [...Array(n)].forEach((_v, idx) => {
      let _ = map[idx];
    });
  }),
  batch_put: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      map.push(42n);
    });
  }),
  batch_remove: update([nat32], Void, (n) => {
    [...Array(n)].forEach(() => {
      map.pop();
    });
  }),
});
