import {
  Canister,
  ic,
  init,
  nat64,
  Null,
  Opt,
  postUpgrade,
  preUpgrade,
  query,
  Result,
  text,
  update,
  Vec,
  Void,
} from "azle";
import { BasicDaoService } from "./service";
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
import { CanisterEnvironment } from "./env";

let service = BasicDaoService.default();

export default Canister({
  init: init([BasicDaoStableStorage], (initState) => {
    ic.stableGrow(4096);

    let initService = BasicDaoService.from(initState);
    initService.env = new CanisterEnvironment();

    service = initService;
  }),
  // pre_upgrade: preUpgrade(() => {}),
  // post_upgrade: postUpgrade([], () => {}),
  get_system_params: query([], SystemParams, () => {
    return service.systemParams;
  }),
  transfer: update([TransferArgs], Result(Null, text), (args) => {
    return service.transfer(args);
  }),
  account_balance: query([], Tokens, () => {
    return service.accountBalance();
  }),
  list_accounts: query([], Vec(Account), () => {
    return service.listAccounts();
  }),
  submit_proposal: update(
    [ProposalPayload],
    Result(nat64, text),
    (proposal) => {
      return service.submitProposal(proposal);
    }
  ),
  get_proposal: query([nat64], Opt(Proposal), (proposalId) => {
    return service.getProposal(proposalId);
  }),
  list_proposals: query([], Vec(Proposal), () => {
    return service.listProposals();
  }),
  vote: update([VoteArgs], Result(ProposalState, text), (args) => {
    return service.vote(args);
  }),
  update_system_params: update([UpdateSystemParamsPayload], Void, (payload) => {
    return service.updateSystemParams(payload);
  }),
});
