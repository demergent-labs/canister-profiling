from kybra import ic, nat, nat64, update, void


@update
def setTimer(sec: nat) -> nat:
    return ic.set_timer(sec, lambda: None)


@update
def cancelTimer(id: nat64) -> void:
    ic.clear_timer(id)
