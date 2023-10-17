#!ic-repl
load "../prelude.sh";

// Setup initial account
identity alice;
identity bob;
identity cathy;
identity dory;
identity genesis;

let motoko = wasm_profiling("motoko/.dfx/local/canisters/basic_dao/basic_dao.wasm", mo_config);
let rust = wasm_profiling("rust/.dfx/local/canisters/basic_dao/basic_dao.wasm", rs_config);
let azle = wasm_profiling("azle/.dfx/local/canisters/basic_dao/basic_dao.wasm", ts_config);

let file = "README.md";
output(file, "\n## Basic DAO\n\n| |binary_size|init|transfer_token|submit_proposal|vote_proposal|upgrade|\n|--|--:|--:|--:|--:|--:|--:|\n");

function perf(wasm, title) {
let init = encode wasm.__init_args(
  record {
    accounts = vec {
      record { owner = genesis; tokens = record { amount_e8s = (1_000_000_000_000: nat64) } };
      record { owner = alice; tokens = record { amount_e8s = (100: nat64) } };
      record { owner = bob; tokens = record { amount_e8s = (200: nat64) } };
      record { owner = cathy; tokens = record { amount_e8s = (300: nat64) } };
    };
    proposals = vec {};
    system_params = record {
      transfer_fee = record { amount_e8s = (100: nat64) };
      proposal_vote_threshold = record { amount_e8s = (100: nat64) };
      proposal_submission_deposit = record { amount_e8s = (100: nat64) };
    };
  }
);

let DAO = install(wasm, init, null);
call DAO.__get_cycles();
output(file, stringify("|", title, "|", wasm.size(), "|", _, "|"));

// transfer tokens
let _ = call DAO.transfer(record { to = dory; amount = record { amount_e8s = (400: nat64) } });
let svg = stringify(title, "_dao_transfer.svg");
output(file, stringify("[", __cost__, "](", svg, ")|"));
flamegraph(DAO, "DAO.transfer", svg);

// alice makes a proposal
identity alice;
let update_transfer_fee = record { transfer_fee = opt record { amount_e8s = (10_000: nat64) } };
call DAO.submit_proposal(
  record {
    canister_id = DAO;
    method = "update_system_params";
    message = encode DAO.update_system_params(update_transfer_fee);
  },
);
let alice_id = 0; // hardcode id, because motoko returns #ok instead of #Ok
let svg = stringify(title, "_submit_proposal.svg");
output(file, stringify("[", __cost__, "](", svg, ")|"));
flamegraph(DAO, "DAO.submit_proposal", svg);

// voting
identity bob;
call DAO.vote(record { proposal_id = alice_id; vote = variant { Yes } });
let svg = stringify(title, "_vote.svg");
output(file, stringify("[", __cost__, "](", svg, ")|"));
flamegraph(DAO, "DAO.vote", svg);

// upgrade
identity genesis;
upgrade(DAO, wasm, init);
let svg = stringify(title, "_upgrade.svg");
flamegraph(DAO, "DAO.upgrade", svg);
output(file, stringify("[", _, "](", svg, ")|\n"));
call DAO.get_proposal(0);
assert _?.proposer == alice;
};

perf(motoko, "Motoko");
perf(rust, "Rust");
perf(azle, "Azle");
