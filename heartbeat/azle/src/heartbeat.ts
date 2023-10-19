import { Canister, heartbeat, query, Void } from "azle";

export default Canister({
  heartbeat: heartbeat(() => {}),
  hack: query([], Void, () => {}),
});
