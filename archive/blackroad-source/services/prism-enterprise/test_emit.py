from __future__ import annotations

from roadqlm.agents.covenants import Covenant, CovenantProjector
from roadqlm.agents.emit import emit
from roadqlm.agents.trust import TrustInputs


def test_emit_accepts_when_trust_high() -> None:
    projector = CovenantProjector(Covenant(name="default", rules={"compliance": 0.5}))
    log = emit("ok", projector, TrustInputs(compliance=0.8, transparency=0.7, entropy=0.1))
    assert log.accepted is True
    assert log.payload == "ok"


def test_emit_rejects_on_low_trust() -> None:
    projector = CovenantProjector(Covenant(name="default", rules={"compliance": 0.9}))
    log = emit("ok", projector, TrustInputs(compliance=0.5, transparency=0.1, entropy=0.9))
    assert log.accepted is False
    assert log.payload is None
