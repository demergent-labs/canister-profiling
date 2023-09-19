#!ic-repl
load "../../prelude.sh";

let pub_wasm = wasm_profiling(".dfx/local/canisters/pub/pub.wasm");
let sub_wasm = wasm_profiling(".dfx/local/canisters/sub/sub.wasm");
let pub = install(pub_wasm, encode (), null);
let sub = install(sub_wasm, encode (), null);

let file = "README.md";

let caller = call sub.setupSubscribe(pub, "Apples");
flamegraph(sub, "Subscribe Apples", "az_subscribe.svg");
let callee_cost = flamegraph(pub, "Register subscriber (called by sub canister)", "az_pub_register.svg");
output(file, stringify("|Azle|", pub_wasm.size(), "|", sub_wasm.size(), "|[", __cost_caller, "](az_subscribe.svg)|[", callee_cost, "](az_pub_register.svg)|"));

let caller = call pub.publish(record { topic = "Apples"; value = 42 });
flamegraph(pub, "Publish Apples", "az_publish.svg");
call sub.getCount();
assert _ == (42 : nat64);
let callee_cost = flamegraph(sub, "Update subscriber (callback from pub canister)", "az_sub_update.svg");
output(file, stringify("[", __cost_caller, "](az_publish.svg)|[", callee_cost, "](az_sub_update.svg)|\n"));
