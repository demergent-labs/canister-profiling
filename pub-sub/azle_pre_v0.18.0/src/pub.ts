import { $update, ic, nat64, Principal, Record, text } from "azle";

type SubscriberStore = {
  [key: string]: Subscriber;
};

type Counter = Record<{
  topic: text;
  value: nat64;
}>;

type Subscriber = Record<{
  topic: text;
}>;

let subscribers: SubscriberStore = {};

$update;
export function subscribe(subscriber: Subscriber): void {
  let subscriberPrincipalId = ic.caller().toString();
  subscribers[subscriberPrincipalId] = subscriber;
}

$update;
export function publish(counter: Counter): void {
  Object.entries(subscribers).forEach(([k, v]) => {
    if (v.topic === counter.topic) {
      ic.notifyRaw(
        Principal.fromText(k),
        "updateCount",
        ic.candidEncode(
          `(record { topic = "${counter.topic}"; value = ${counter.value}: nat64},)`
        ),
        0n
      );
    }
  });
}
