import { SystemParams, Tokens } from "./types";

export function tokens(): Tokens {
  return { amount_e8s: 0n };
}

export function systemParams(): SystemParams {
  return {
    transfer_fee: tokens(),
    proposal_vote_threshold: tokens(),
    proposal_submission_deposit: tokens(),
  };
}
