import {
  ic,
  nat64,
  principal,
  Principal,
  query,
  Service,
  text,
  update,
  Void,
} from "azle";
import { Counter } from "./types";

export default class extends Service {
  counter: nat64 = 0n;

  @update([principal, text], Void)
  async setupSubscribe(publisherId: Principal, topic: text): Promise<void> {
    await ic.callRaw(
      publisherId,
      "subscribe",
      ic.candidEncode(`(record { topic = "${topic}"},)`),
      0n
    );
  }

  @update([Counter], Void)
  updateCount(c: Counter): Void {
    this.counter += c.value;
  }

  @query([], nat64)
  getCount(): nat64 {
    return this.counter;
  }
}
