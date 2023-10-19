import { Canister, ic, nat, update, Void } from "azle";

export default Canister({
  setTimer: update([nat], nat, (sec) => {
    return ic.setTimer(sec, () => {});
  }),

  cancelTimer: update([nat], Void, (id) => {
    ic.clearTimer(id);
  }),

  no_op: update([], Void, () => {}),
});
