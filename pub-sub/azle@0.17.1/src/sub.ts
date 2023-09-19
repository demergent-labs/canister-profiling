import { $query, $update, ic, nat64, Principal, Record, text } from "azle";

let counter: nat64 = 0n;

type Counter = Record<{
  topic: text;
  value: nat64;
}>;

type Subscriber = Record<{
  topic: text;
}>;

$update;
export async function setupSubscribe(
  publisherId: Principal,
  topic: text
): Promise<void> {
  await ic.callRaw(
    publisherId,
    "subscribe",
    ic.candidEncode(`(record { topic = "${topic}"},)`),
    0n
  );
}

$update;
export function updateCount(c: Counter): void {
  counter += c.value;
}

$query;
export function getCount(): nat64 {
  return counter;
}
