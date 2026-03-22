from __future__ import annotations

from roadqlm.agents.trust import TrustConfig, TrustInputs, trust


def test_trust_increases_with_compliance() -> None:
    low = trust(TrustInputs(compliance=0.1, transparency=0.3, entropy=0.2))
    high = trust(TrustInputs(compliance=0.9, transparency=0.3, entropy=0.2))
    assert high > low


def test_trust_decreases_with_entropy() -> None:
    low_entropy = trust(TrustInputs(compliance=0.6, transparency=0.6, entropy=0.1))
    high_entropy = trust(TrustInputs(compliance=0.6, transparency=0.6, entropy=0.9))
    assert low_entropy > high_entropy
