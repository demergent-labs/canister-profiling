#!ic-repl
load "../prelude.sh";

let motoko = wasm_profiling("motoko/.dfx/local/canisters/heartbeat/heartbeat.wasm");
let rust = wasm_profiling("rust/.dfx/local/canisters/heartbeat/heartbeat.wasm");

let file = "README.md";
output(file, "\n# Heartbeat\n\n| |heartbeat|\n|--:|--:|\n");

function perf(wasm, title) {
  let cid = install(wasm, encode (), null);
  flamegraph(cid, stringify(title, "_heartbeat"), title);
  output(file, stringify("|", title, "|[flamegraph](", title, ".svg)", "|\n"));
};

perf(motoko, "Motoko");
perf(rust, "Rust");
