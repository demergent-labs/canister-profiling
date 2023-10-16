import { Canister, Principal, blob, nat64, update } from "azle";
import { sha224, sha256 } from "js-sha256";
import { sha512 } from "js-sha512";

const textEncoder = new TextEncoder();

const SUBACCOUNT_ZERO = new Uint8Array(32).fill(0);
const ACCOUNT_SEPARATOR = new Uint8Array([
  0x0a,
  ...textEncoder.encode("account-id"),
]);

export default Canister({
  sha256: update([blob], blob, (blob) => {
    return new Uint8Array(sha256.create().update(blob).digest());
  }),
  sha512: update([blob], blob, (blob) => {
    return new Uint8Array(sha512.create().update(blob).digest());
  }),
  principalToAccount: update([Principal], blob, (id) => {
    const hash = sha224.create();
    hash.update(ACCOUNT_SEPARATOR);
    hash.update(new Uint8Array(id.toUint8Array()));
    hash.update(SUBACCOUNT_ZERO);
    return new Uint8Array(hash.array());
  }),
  principalToNeuron: update([Principal, nat64], blob, (id, nonce) => {
    const hash = sha256.create();
    hash.update(new Uint8Array([0x0c]));
    hash.update(textEncoder.encode("neuron-stake"));
    hash.update(new Uint8Array(id.toUint8Array()));
    hash.update(bigintToUint8Array(nonce));
    return new Uint8Array(hash.array());
  }),
});

function bigintToUint8Array(input: bigint): Uint8Array {
  let view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, input, false);
  return new Uint8Array(view.buffer);
}
