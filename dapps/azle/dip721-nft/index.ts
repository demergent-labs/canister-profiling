import {
  blob,
  bool,
  Canister,
  Err,
  ic,
  init,
  nat,
  nat64,
  None,
  Null,
  Ok,
  Principal,
  query,
  Result,
  Some,
  text,
  update,
  Vec,
} from "azle";
import {
  ConstrainedError,
  Error,
  ExtendedMetadataResult,
  InitArgs,
  InterfaceId,
  LogoResult,
  MetadataDesc,
  MintResult,
  Nft,
  State,
  TransferSubscriber,
} from "./types";

const MGMT: Principal = Principal.fromUint8Array(new Uint8Array([]));

let state: State = {
  nfts: [],
  custodians: new Set(),
  operators: new Map(),
  logo: {
    logo_type: "",
    data: "",
  },
  name: "",
  symbol: "",
  txid: 0n,
  nextTxid() {
    return ++this.txid;
  },
};

function transferFrom(
  from: Principal,
  to: Principal,
  tokenId: nat64
): Result<nat, Error> {
  const nft = state.nfts[Number(tokenId)];

  if (nft === undefined) {
    return Err({ InvalidTokenId: null });
  }

  const caller = ic.caller().toText();
  const callerIsOwner = nft.owner.toText() === caller;
  const operators = state.operators.get(from.toText());
  const callerIsOperator =
    operators === undefined ? false : operators.has(caller);
  const callerIsCustodian = state.custodians.has(caller);
  if (!callerIsOwner && !callerIsOperator && !callerIsCustodian) {
    return Err({ Unauthorized: null });
  } else if (nft.owner.toText() !== from.toText()) {
    return Err({ Other: null });
  } else {
    nft.approved = None;
    nft.owner = to;
    return Ok(state.nextTxid());
  }
}

function transferFromNotify(
  from: Principal,
  to: Principal,
  tokenId: nat64,
  data: blob
): Result<nat, Error> {
  const result = transferFrom(from, to, tokenId);

  if (result.Err !== undefined) {
    return Err(result.Err);
  }

  ic.notify(TransferSubscriber(to).onDIP721Received, {
    args: [ic.caller(), from, tokenId, data],
  });

  return Ok(result.Ok);
}

export default Canister({
  init: init([InitArgs], (args) => {
    ic.stableGrow(4096);

    const custodians =
      args.custodians.Some !== undefined
        ? new Set(args.custodians.Some.map((principal) => principal.toText()))
        : new Set([ic.caller().toText()]);

    state.custodians = custodians;
    state.name = args.name;
    state.symbol = args.symbol;
    state.logo = args.logo;
  }),
  // --------------
  // base interface
  // --------------
  balanceOfDip721: query([Principal], nat64, (user) => {
    const count = state.nfts.filter((nft) => {
      nft.owner.toText() === user.toText();
    }).length;

    return BigInt(count);
  }),
  ownerOfDip721: query([nat64], Result(Principal, Error), (tokenId) => {
    const nft = state.nfts[Number(tokenId)];

    if (nft === undefined) {
      return Err({ InvalidTokenId: null });
    }

    return Ok(nft.owner);
  }),
  transferFromDip721: update(
    [Principal, Principal, nat64],
    Result(nat, Error),
    transferFrom
  ),
  safeTransferFromDip721: update(
    [Principal, Principal, nat64],
    Result(nat, Error),
    (from, to, tokenId) => {
      if (to.toText() === MGMT.toText()) {
        return Err({ ZeroAddress: null });
      } else {
        return transferFrom(from, to, tokenId);
      }
    }
  ),
  supportedInterfacesDip721: query([], Vec(InterfaceId), () => {
    return [{ TransferNotification: null }, { Burn: null }, { Mint: null }];
  }),
  nameDip721: query([], text, () => {
    return state.name;
  }),
  symbolDip721: query([], text, () => {
    return state.symbol;
  }),
  totalSupplyDip721: query([], nat64, () => {
    return BigInt(state.nfts.length);
  }),
  getMetadataDip721: query([nat64], Result(MetadataDesc, Error), (tokenId) => {
    const nft = state.nfts[Number(tokenId)];

    if (nft === undefined) {
      return Err({ InvalidTokenId: null });
    }

    return Ok(nft.metadata);
  }),
  getMetadataForUserDip721: query(
    [Principal],
    Vec(ExtendedMetadataResult),
    (user) => {
      return state.nfts
        .filter((n) => n.owner.toText() === user.toText())
        .map((n) => ({
          metadata_desc: n.metadata,
          token_id: n.id,
        }));
    }
  ),
  // ----------------------
  // notification interface
  // ----------------------
  transferFromNotifyDip721: update(
    [Principal, Principal, nat64, blob],
    Result(nat, Error),
    transferFromNotify
  ),
  safeTransferFromNotifyDip721: update(
    [Principal, Principal, nat64, blob],
    Result(nat, Error),
    (from, to, tokenId, data) => {
      if (to.toText() === MGMT.toText()) {
        return Err({ ZeroAddress: null });
      } else {
        return transferFromNotify(from, to, tokenId, data);
      }
    }
  ),
  // ------------------
  // approval interface
  // ------------------
  approveDip721: update(
    [Principal, nat64],
    Result(nat, Error),
    (user, tokenId) => {
      const caller = ic.caller().toText();
      const nft = state.nfts[Number(tokenId)];

      if (nft === undefined) {
        return Err({ InvalidTokenId: null });
      }

      const callerIsOwner = nft.owner.toText() === caller;
      const callerIsApproved = nft.approved.Some?.toText() === caller;
      const operators = state.operators.get(user.toText());
      const callerIsOperator =
        operators === undefined ? false : operators.has(caller);
      const callerIsCustodian = state.custodians.has(caller);
      if (
        !callerIsOwner &&
        !callerIsApproved &&
        !callerIsOperator &&
        !callerIsCustodian
      ) {
        return Err({ Unauthorized: null });
      } else {
        nft.approved = Some(user);
        return Ok(state.nextTxid());
      }
    }
  ),
  setApprovalForAllDip721: update(
    [Principal, bool],
    Result(nat, Error),
    (op, isApproved) => {
      const caller = ic.caller().toText();
      const operator = op.toText();

      if (operator === caller) {
        let operators =
          state.operators.get(caller) ??
          (() => {
            const newOperatorsList = new Set([]);
            state.operators.set(caller, newOperatorsList);
            return newOperatorsList;
          })();
        if (operator === MGMT.toText()) {
          if (!isApproved) {
            operators.clear();
          } else {
            // cannot enable everyone as an operator
          }
        } else {
          if (isApproved) {
            operators.add(operator);
          } else {
            operators.delete(operator);
          }
        }
      }

      return Ok(state.nextTxid());
    }
  ),
  // Not exported as canister method because of incorrect interface.
  // See https://github.com/Psychedelic/DIP721/issues/5
  // getApprovedDip721: query([nat64], Result(Principal, Error), (tokenId) => {
  //   const nft = state.nfts[Number(tokenId)];

  //   if (nft === undefined) {
  //     return Err({ InvalidTokenId: null });
  //   }

  //   return nft.approved.Some === undefined
  //     ? Ok(ic.caller())
  //     : Ok(nft.approved.Some);
  // }),
  isApprovedForAllDip721: query([Principal], bool, (operator) => {
    const operators = state.operators.get(ic.caller().toText());
    const callerIsOperator =
      operators === undefined ? false : operators.has(operator.toText());
    return callerIsOperator;
  }),
  // --------------
  // mint interface
  // --------------
  mintDip721: update(
    [Principal, MetadataDesc],
    Result(MintResult, ConstrainedError),
    (to, metadata) => {
      if (!state.custodians.has(ic.caller().toText())) {
        return Err({ Unauthorized: null });
      }

      const newId = BigInt(state.nfts.length);
      const nft: Nft = {
        owner: to,
        approved: None,
        id: newId,
        metadata,
        content: new Uint8Array([]),
      };

      state.nfts.push(nft);

      return Ok({
        id: state.nextTxid(),
        token_id: newId,
      });
    }
  ),
  // --------------
  // burn interface
  // --------------
  burnDip721: update([nat64], Result(nat, Error), (tokenId) => {
    const nft = state.nfts[Number(tokenId)];
    if (nft === undefined) {
      return Err({ InvalidTokenId: null });
    }

    if (nft.owner.toText() != ic.caller().toText()) {
      return Err({ Unauthorized: null });
    } else {
      nft.owner = MGMT;
      return Ok(state.nextTxid());
    }
  }),
  set_name: update([text], Result(Null, Error), (name) => {
    if (state.custodians.has(ic.caller().toText())) {
      state.name = name;
      return Ok(null);
    } else {
      return Err({ Unauthorized: null });
    }
  }),
  set_symbol: update([text], Result(Null, Error), (sym) => {
    if (state.custodians.has(ic.caller().toText())) {
      state.symbol = sym;
      return Ok(null);
    } else {
      return Err({ Unauthorized: null });
    }
  }),
  set_logo: update([LogoResult], Result(Null, Error), (logo) => {
    if (state.custodians.has(ic.caller().toText())) {
      state.logo = logo;
      return Ok(null);
    } else {
      return Err({ Unauthorized: null });
    }
  }),
  set_custodian: update(
    [Principal, bool],
    Result(Null, Error),
    (user, custodian) => {
      if (state.custodians.has(ic.caller().toText())) {
        if (custodian) {
          state.custodians.add(user.toText());
        } else {
          state.custodians.delete(user.toText());
        }
        return Ok(null);
      } else {
        return Err({ Unauthorized: null });
      }
    }
  ),
  is_custodian: query([Principal], bool, (principal) => {
    return state.custodians.has(principal.toText());
  }),
});
