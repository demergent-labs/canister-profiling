#!ic-repl
load "../../prelude.sh";

let pub_wasm = wasm_profiling(".dfx/local/canisters/pub/pub.wasm");
let sub_wasm = wasm_profiling(".dfx/local/canisters/sub/sub.wasm");
let pub = install(pub_wasm, encode (), null);
let sub = install(sub_wasm, encode (), null);

let file = "README.md";

let caller = call sub.setupSubscribe(pub, "Apples");
flamegraph(sub, "Subscribe Apples", "Azle@0.18.0_subscribe.svg");
let callee_cost = flamegraph(pub, "Register subscriber (called by sub canister)", "Azle@0.18.0_pub_register.svg");
output(file, stringify("|Azle@0.18.0|", pub_wasm.size(), "|", sub_wasm.size(), "|[", __cost_caller, "](Azle@0.18.0_subscribe.svg)|[", callee_cost, "](Azle@0.18.0_pub_register.svg)|"));

let caller = call pub.publish(record { topic = "Apples"; value = (42: nat64) });
flamegraph(pub, "Publish Apples", "Azle@0.18.0_publish.svg");
call sub.getCount();
assert _ == (42 : nat64);
let callee_cost = flamegraph(sub, "Update subscriber (callback from pub canister)", "Azle@0.18.0_sub_update.svg");
output(file, stringify("[", __cost_caller, "](Azle@0.18.0_publish.svg)|[", callee_cost, "](Azle@0.18.0_sub_update.svg)|\n"));
