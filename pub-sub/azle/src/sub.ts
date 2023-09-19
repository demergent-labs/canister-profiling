import {
  ic,
  nat64,
  Principal,
  query,
  text,
  update,
  Void,
  Canister,
} from "azle";
import { Counter } from "./types";

let counter: nat64 = 0n;

export default Canister({
  setupSubscribe: update(
    [Principal, text],
    Void,
    async (publisherId, topic) => {
      await ic.callRaw(
        publisherId,
        "subscribe",
        ic.candidEncode(`(record { topic = "${topic}"},)`),
        0n
      );
    }
  ),

  updateCount: update([Counter], Void, (c) => {
    counter += c.value;
  }),

  getCount: query([], nat64, () => {
    return counter;
  }),
});
