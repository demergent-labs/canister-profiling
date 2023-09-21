import { ic, Principal, Service, update, Void } from "azle";
import { Counter, Subscriber } from "./types";

type SubscriberStore = {
  [key: string]: Subscriber;
};

export default class extends Service {
  subscribers: SubscriberStore = {};

  @update([Subscriber], Void)
  subscribe(subscriber: Subscriber): Void {
    let subscriberPrincipalId = ic.caller().toText();
    console.log(`Registered principal: ${subscriberPrincipalId}`);
    this.subscribers[subscriberPrincipalId] = subscriber;
  }

  @update([Counter], Void)
  publish(counter: Counter): Void {
    Object.entries(this.subscribers).forEach(([k, v]) => {
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
  }
}
