import {
  Err,
  nat64,
  None,
  Null,
  Ok,
  Opt,
  Principal,
  Result,
  Some,
  text,
  Vec,
  Void,
} from "azle";
import {
  Account,
  BasicDaoStableStorage,
  Proposal,
  ProposalPayload,
  ProposalState,
  SystemParams,
  Tokens,
  TransferArgs,
  UpdateSystemParamsPayload,
  VoteArgs,
} from "./types";
import { EmptyEnvironment, Environment } from "./env";
import * as Default from "./defaults";

type BasicDaoConstructorArgs = {
  env: Environment;
  accounts: Map<Principal, Tokens>;
  proposals: Map<nat64, Proposal>;
  nextProposalId: nat64;
  systemParams: SystemParams;
};

/** Implements the Basic DAO interface */
export class BasicDaoService {
  env: Environment;
  accounts: Map<Principal, Tokens>;
  proposals: Map<nat64, Proposal>;
  nextProposalId: nat64;
  systemParams: SystemParams;

  constructor({
    env,
    accounts,
    proposals,
    nextProposalId,
    systemParams,
  }: BasicDaoConstructorArgs) {
    this.env = env;
    this.accounts = accounts;
    this.proposals = proposals;
    this.nextProposalId = nextProposalId;
    this.systemParams = systemParams;
  }

  static default(): BasicDaoService {
    return new BasicDaoService({
      env: new EmptyEnvironment(),
      accounts: new Map(),
      proposals: new Map(),
      nextProposalId: 0n,
      systemParams: Default.systemParams(),
    });
  }

  static from(stable: BasicDaoStableStorage) {
    const accounts = new Map(
      stable.accounts.map((account) => [account.owner, account.tokens])
    );
    const proposals = new Map(
      stable.proposals.map((proposal) => [proposal.id, proposal])
    );

    return new BasicDaoService({
      env: new EmptyEnvironment(),
      accounts,
      proposals,
      nextProposalId: 0n,
      systemParams: stable.system_params,
    });
  }

  /** Transfer tokens from the caller's account to another account */
  transfer(transfer: TransferArgs): Result<Null, text> {
    const caller = this.env.caller();

    let account = this.accounts.get(caller);

    if (account === undefined) {
      return Err("Caller needs an account to transfer funds");
    }

    if (account.amount_e8s < transfer.amount.amount_e8s) {
      return Err(
        `Caller's account has insufficient funds to transfer ${transfer.amount}`
      );
    } else {
      account.amount_e8s -=
        transfer.amount.amount_e8s + this.systemParams.transfer_fee.amount_e8s;

      let toAccount =
        this.accounts.get(transfer.to) ??
        (() => {
          const newAccount = Default.tokens();
          this.accounts.set(transfer.to, newAccount);
          return newAccount;
        })();
      toAccount.amount_e8s += transfer.amount.amount_e8s;
    }

    return Ok(null);
  }

  /** Return the account balance of the caller */
  accountBalance(): Tokens {
    const caller = this.env.caller();
    const tokens = this.accounts.get(caller);

    return tokens ?? Default.tokens();
  }

  /** Lists all accounts */
  listAccounts(): Account[] {
    return Array.from(this.accounts.entries()).map(([key, value]) => ({
      owner: key,
      tokens: value,
    }));
  }

  /**
   * Submit a proposal
   *
   * A proposal contains a canister ID, method name and method args. If enough
   * users vote "yes" on the proposal, the given method will be called with the
   * given method args on the given canister.
   */
  submitProposal(payload: ProposalPayload): Result<nat64, text> {
    const deductionResult = this.deductProposalSubmissionDeposit();

    if (deductionResult.Err !== undefined) {
      return deductionResult;
    }

    const proposalId = this.nextProposalId;
    this.nextProposalId += 1n;

    const proposal: Proposal = {
      id: proposalId,
      timestamp: this.env.now(),
      proposer: this.env.caller(),
      payload,
      state: { Open: null },
      votes_yes: Default.tokens(),
      votes_no: Default.tokens(),
      voters: [],
    };

    this.proposals.set(proposalId, proposal);

    return Ok(proposalId);
  }

  /** Return the proposal with the given ID, if one exists */
  getProposal(proposalId: nat64): Opt<Proposal> {
    const proposal = this.proposals.get(proposalId);

    return proposal === undefined ? None : Some(proposal);
  }

  /** Return the list of all proposals */
  listProposals(): Vec<Proposal> {
    return Array.from(this.proposals.values());
  }

  /** Vote on an open proposal */
  vote(args: VoteArgs): Result<ProposalState, text> {
    const caller = this.env.caller();

    let proposal = this.proposals.get(args.proposal_id);

    if (proposal === undefined) {
      return Err(`No proposal with ID ${args.proposal_id} exists`);
    }

    if (!("Open" in proposal.state)) {
      return Err(`Proposal ${args.proposal_id} is not open for voting`);
    }

    const votingTokens = this.accounts.get(caller);

    if (votingTokens === undefined) {
      return Err(`Caller does not have any tokens to vote with`);
    }

    if (proposal.voters.includes(this.env.caller())) {
      return Err("Already voted");
    }

    if ("Yes" in args.vote) {
      proposal.votes_yes.amount_e8s += votingTokens.amount_e8s;
    } else {
      proposal.votes_no.amount_e8s += votingTokens.amount_e8s;
    }

    proposal.voters.push(caller);

    if (
      proposal.votes_yes.amount_e8s >=
      this.systemParams.proposal_vote_threshold.amount_e8s
    ) {
      // Refund the proposal deposit when the proposal is accepted
      let account = this.accounts.get(proposal.proposer);

      if (account !== undefined) {
        account.amount_e8s +=
          this.systemParams.proposal_submission_deposit.amount_e8s;
      }

      proposal.state = { Accepted: null };
    }

    if (
      proposal.votes_no.amount_e8s >=
      this.systemParams.proposal_vote_threshold.amount_e8s
    ) {
      proposal.state = { Rejected: null };
    }

    return Ok(proposal.state);
  }

  updateSystemParams(payload: UpdateSystemParamsPayload) {
    if (this.env.caller().toText() !== this.env.canisterId().toText()) {
      return;
    }

    if (payload.transfer_fee.Some !== undefined) {
      this.systemParams.transfer_fee.amount_e8s =
        payload.transfer_fee.Some.amount_e8s;
    }

    if (payload.proposal_vote_threshold.Some !== undefined) {
      this.systemParams.proposal_vote_threshold.amount_e8s =
        payload.proposal_vote_threshold.Some.amount_e8s;
    }

    if (payload.proposal_submission_deposit.Some !== undefined) {
      this.systemParams.proposal_submission_deposit.amount_e8s =
        payload.proposal_submission_deposit.Some.amount_e8s;
    }
  }

  /** Deduct the proposal submission deposit from the caller's account */
  deductProposalSubmissionDeposit(): Result<Void, text> {
    const caller = this.env.caller();

    let account = this.accounts.get(caller);

    if (account === undefined) {
      return Err("Caller needs an account to submit a proposal");
    }

    if (
      account.amount_e8s <
      this.systemParams.proposal_submission_deposit.amount_e8s
    ) {
      return Err(
        `Caller's account must have at least ${this.systemParams.proposal_submission_deposit} to submit a proposal`
      );
    }

    account.amount_e8s -=
      this.systemParams.proposal_submission_deposit.amount_e8s;

    return Ok(undefined);
  }
}
