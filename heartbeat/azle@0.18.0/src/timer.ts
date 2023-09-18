import { ic, nat, Service, update, Void } from "azle";

export default class extends Service {
  @update([nat], nat)
  setTimer(sec: nat): nat {
    return ic.setTimer(sec, () => {});
  }

  @update([nat], Void)
  cancelTimer(id: nat): Void {
    ic.clearTimer(id);
  }

  @update([], Void)
  no_op(): Void {}
}
