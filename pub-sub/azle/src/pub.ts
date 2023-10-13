import { ic, Principal, Canister, update, Void } from "azle";
import { Counter, Subscriber } from "./types";

type SubscriberStore = {
  [key: string]: typeof Subscriber;
};

let subscribers: SubscriberStore = {};

export default Canister({
  subscribe: update([Subscriber], Void, (subscriber) => {
    let subscriberPrincipalId = ic.caller().toText();
    console.log(`Registered principal: ${subscriberPrincipalId}`);
    subscribers[subscriberPrincipalId] = subscriber;
  }),

  publish: update([Counter], Void, (counter) => {
    Object.entries(subscribers).forEach(([k, v]) => {
      if (v.topic === counter.topic) {
        console.log(`Calling back to princ: ${k}`);

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
  }),
});
