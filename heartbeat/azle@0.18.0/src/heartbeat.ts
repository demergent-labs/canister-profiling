import { query, heartbeat, Service, Void } from "azle";

export default class extends Service {
  @heartbeat
  heartbeat() {}

  @query([], Void)
  hack(): Void {}
}
