import {
  blob,
  Canister,
  nat,
  nat16,
  nat32,
  nat64,
  nat8,
  Null,
  Opt,
  Principal,
  Record,
  text,
  Tuple,
  update,
  Variant,
  Vec,
  Void,
} from "azle";

export const ConstrainedError = Variant({
  Unauthorized: Null,
});

export const InterfaceId = Variant({
  Approval: Null,
  TransactionHistory: Null,
  Mint: Null,
  Burn: Null,
  TransferNotification: Null,
});

export const MintResult = Record({
  token_id: nat64,
  id: nat,
});

export const MetadataPurpose = Variant({
  Preview: Null,
  Rendered: Null,
});

export const MetadataVal = Variant({
  TextContent: text,
  BlobContent: blob,
  NatContent: nat,
  Nat8Content: nat8,
  Nat16Content: nat16,
  Nat32Content: nat32,
  Nat64Content: nat64,
});

export const Error = Variant({
  Unauthorized: Null,
  InvalidTokenId: Null,
  ZeroAddress: Null,
  Other: Null,
});
export type Error = typeof Error;

export const MetadataKeyVal = Tuple(text, MetadataVal);

export const MetadataPart = Record({
  purpose: MetadataPurpose,
  key_val_data: Vec(MetadataKeyVal),
  data: blob,
});

export const MetadataDesc = Vec(MetadataPart);

export const ExtendedMetadataResult = Record({
  metadata_desc: MetadataDesc,
  token_id: nat64,
});

export const Nft = Record({
  owner: Principal,
  approved: Opt(Principal),
  id: nat64,
  metadata: MetadataDesc,
  content: blob,
});
export type Nft = typeof Nft;

type PrincipalString = string;

export type State = {
  nfts: Vec<Nft>;
  custodians: Set<PrincipalString>;
  operators: Map<PrincipalString, Set<PrincipalString>>; // owner to operators
  logo: LogoResult;
  name: string;
  symbol: string;
  txid: nat;
  nextTxid: () => nat;
};

export const LogoResult = Record({
  logo_type: text,
  data: text,
});
export type LogoResult = typeof LogoResult;

export const InitArgs = Record({
  custodians: Opt(Vec(Principal)),
  logo: LogoResult,
  name: text,
  symbol: text,
});

export const TransferSubscriber = Canister({
  onDIP721Received: update([Principal, Principal, nat64, blob], Void),
});
