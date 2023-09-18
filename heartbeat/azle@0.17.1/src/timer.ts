import { ic, nat, $update } from "azle";

$update;
export function setTimer(sec: nat): nat {
  return ic.setTimer(sec, () => {});
}

$update;
export function cancelTimer(id: nat): void {
  ic.clearTimer(id);
}

$update;
export function no_op(): void {}
