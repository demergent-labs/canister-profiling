import { candid, nat64, Record, text } from "azle";

export class Counter extends Record {
  @candid(text)
  topic: text;

  @candid(nat64)
  value: nat64;
}

export class Subscriber extends Record {
  @candid(text)
  topic: text;
}
