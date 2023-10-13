import { nat64, Record, text } from "azle";

export const Counter = Record({
  topic: text,
  value: nat64,
});

export const Subscriber = Record({
  topic: text,
});
