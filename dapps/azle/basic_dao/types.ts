import {
  blob,
  nat64,
  Null,
  Opt,
  Principal,
  Record,
  text,
  Variant,
  Vec,
} from "azle";

export const Tokens = Record({
  amount_e8s: nat64,
});
export type Tokens = typeof Tokens;

export const TransferArgs = Record({
  to: Principal,
  amount: Tokens,
});
export type TransferArgs = typeof TransferArgs;

export const Account = Record({
  owner: Principal,
  tokens: Tokens,
});
export type Account = typeof Account;

export const ProposalPayload = Record({
  canister_id: Principal,
  method: text,
  message: blob,
});
export type ProposalPayload = typeof ProposalPayload;

export const ProposalState = Variant({
  Open: Null,
  Accepted: Null,
  Rejected: Null,
  Executing: Null,
  Succeeded: Null,
  Failed: text,
});
export type ProposalState = typeof ProposalState;

export const Proposal = Record({
  id: nat64,
  timestamp: nat64,
  proposer: Principal,
  payload: ProposalPayload,
  state: ProposalState,
  votes_yes: Tokens,
  votes_no: Tokens,
  voters: Vec(Principal),
});
export type Proposal = typeof Proposal;

export const SystemParams = Record({
  transfer_fee: Tokens,
  proposal_vote_threshold: Tokens,
  proposal_submission_deposit: Tokens,
});
export type SystemParams = typeof SystemParams;

export const UpdateSystemParamsPayload = Record({
  transfer_fee: Opt(Tokens),
  proposal_vote_threshold: Opt(Tokens),
  proposal_submission_deposit: Opt(Tokens),
});
export type UpdateSystemParamsPayload = typeof UpdateSystemParamsPayload;

export const Vote = Variant({
  Yes: Null,
  No: Null,
});
export type Vote = typeof Vote;

export const VoteArgs = Record({
  proposal_id: nat64,
  vote: Vote,
});
export type VoteArgs = typeof VoteArgs;

export const BasicDaoStableStorage = Record({
  accounts: Vec(Account),
  proposals: Vec(Proposal),
  system_params: SystemParams,
});
export type BasicDaoStableStorage = typeof BasicDaoStableStorage;
