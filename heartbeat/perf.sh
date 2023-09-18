#!ic-repl
load "../prelude.sh";

let heartbeat_mo = wasm_profiling("motoko/.dfx/local/canisters/heartbeat/heartbeat.wasm");
let timer_mo = wasm_profiling("motoko/.dfx/local/canisters/timer/timer.wasm");
let heartbeat_rs = wasm_profiling("rust/.dfx/local/canisters/heartbeat/heartbeat.wasm");
let timer_rs = wasm_profiling("rust/.dfx/local/canisters/timer/timer.wasm");
let heartbeat_ts_v0_17_1 = wasm_profiling("azle@0.17.1/.dfx/local/canisters/heartbeat/heartbeat.wasm");
let timer_ts_v0_17_1 = wasm_profiling("azle@0.17.1/.dfx/local/canisters/timer/timer.wasm");
let heartbeat_ts_v0_18_0 = wasm_profiling("azle@0.18.0/.dfx/local/canisters/heartbeat/heartbeat.wasm");
let timer_ts_v0_18_0 = wasm_profiling("azle@0.18.0/.dfx/local/canisters/timer/timer.wasm");

let file = "README.md";

function heartbeat_perf(wasm, title) {
  let cid = install(wasm, encode (), null);
  let svg = stringify(title, "_heartbeat.svg");
  let cost = flamegraph(cid, stringify(title, "_heartbeat"), svg);
  output(file, stringify("|", title, "|", wasm.size(), "|[", cost, "](", svg, ")|\n"));
  uninstall(cid);
};
function timer_perf(wasm, title) {
  let cid = install(wasm, encode (), null);
  output(file, stringify("|", title, "|", wasm.size(), "|"));

  call cid.__toggle_entry();
  let tid = call cid.setTimer((0: nat));
  // A second update call can usually capture both the job and setTimer, but it is flaky.
  call cid.__toggle_entry();
  let svg = stringify(title, "_setTimer.svg");
  let cost = flamegraph(cid, stringify(title, ".setTimer(0)"), svg);
  output(file, stringify("[", cost, "](", svg, ")|"));

  //call cid.__toggle_entry();
  let tid = call cid.setTimer((10: nat));
  call cid.cancelTimer(tid);
  let svg = stringify(title, "_cancelTimer.svg");
  flamegraph(cid, stringify(title, ".cancelTimer"), svg);
  output(file, stringify("[", __cost__, "](", svg, ")|\n"));
  uninstall(cid);
};

output(file, "\n## Heartbeat\n\n| |binary_size|heartbeat|\n|--:|--:|--:|\n");
heartbeat_perf(heartbeat_mo, "Motoko");
heartbeat_perf(heartbeat_rs, "Rust");
heartbeat_perf(heartbeat_ts_v0_17_1, "Azle@0.17.1");
heartbeat_perf(heartbeat_ts_v0_18_0, "Azle@0.18.0");

output(file, "\n## Timer\n\n| |binary_size|setTimer|cancelTimer|\n|--:|--:|--:|--:|\n");
timer_perf(timer_mo, "Motoko");
timer_perf(timer_rs, "Rust");
timer_perf(timer_ts_v0_17_1, "Azle@0.17.1");
timer_perf(timer_ts_v0_18_0, "Azle@0.18.0");
