import { ic, nat64, Principal } from "azle";

export interface Environment {
  now(): nat64;
  caller(): Principal;
  canisterId(): Principal;
}

export class CanisterEnvironment implements Environment {
  now(): nat64 {
    return ic.time();
  }

  caller(): Principal {
    return ic.caller();
  }

  canisterId(): Principal {
    return ic.id();
  }
}

export class EmptyEnvironment implements Environment {
  now(): nat64 {
    throw "not implemented";
  }

  caller(): Principal {
    throw "not implemented";
  }

  canisterId(): Principal {
    throw "not implemented";
  }
}

export class TestEnvironment implements Environment {
  _now: nat64;
  _caller: Principal;
  _canisterId: Principal;

  constructor(now: nat64, caller: Principal, canisterId: Principal) {
    this._now = now;
    this._caller = caller;
    this._canisterId = canisterId;
  }

  now(): nat64 {
    return this._now;
  }

  caller(): Principal {
    return this._caller;
  }

  canisterId(): Principal {
    return this._canisterId;
  }
}
