"""Deterministic rationale generator used for the sandbox demo."""

from __future__ import annotations

import hashlib
import random
from typing import List

from . import config
from .models import ClientProfile, RationaleBundle


def _seed_from_profile(profile: ClientProfile) -> int:
    """Generate a reproducible seed from the client profile."""

    digest = hashlib.sha256(
        "|".join(
            [
                profile.client_name.lower(),
                str(profile.client_age),
                profile.investment_objective,
                profile.risk_tolerance,
                profile.net_worth_band,
            ]
        ).encode("utf-8")
    ).digest()
    return int.from_bytes(digest[:8], "big") ^ config.RATIONALE_SEED


def draft_rationale(profile: ClientProfile) -> RationaleBundle:
    """Create a rationale paragraph anchored to the supplied profile."""

    seed = _seed_from_profile(profile)
    rng = random.Random(seed)

    objective_map = {
        "income": "steady cashflow with capital stability",
        "growth": "long-term appreciation through diversified equities",
        "capital-preservation": "capital protection with inflation-aware coupons",
        "speculation": "targeted exposure to thematic accelerators",
    }
    risk_language = {
        "conservative": "a focus on high-grade debt and buffered structured notes",
        "moderate": "a barbell mix of dividend equities and short-duration bonds",
        "aggressive": "measured allocations to sector rotation and alternatives",
    }
    intro = (
        f"Based on {profile.client_name}'s stated objective of {profile.investment_objective}, "
        f"the portfolio emphasises {objective_map[profile.investment_objective]}."
    )
    risk_sentence = (
        f"The recommendation aligns with the {profile.risk_tolerance} risk tolerance via {risk_language[profile.risk_tolerance]}."
    )
    oversight_sentence = (
        "Supervision checkpoints include quarterly suitability attestations, liquidity monitoring, and disclosure refreshes."
    )
    compliance_sentence = (
        "Documentation from trade surveillance, product due diligence, and client attestations is attached to the record for audit readiness."
    )

    # Deterministic sourcing picks
    sources: List[str] = []
    candidate_sources = profile.data_sources or [
        "FINRA Investor Education Foundation",
        "SEC Marketing Rule FAQ",
        "Internal risk committee memo",
        "Morningstar fixed-income outlook",
    ]
    rng.shuffle(candidate_sources)
    sources.extend(candidate_sources[:2])

    remediation = None
    if "guaranteed" in profile.marketing_material.lower():
        remediation = (
            "Remove or rephrase the term 'guaranteed' and add explicit downside risk language before resubmission."
        )

    rationale_text = " ".join([intro, risk_sentence, oversight_sentence, compliance_sentence])

    return RationaleBundle(
        rationale_text=rationale_text,
        remediation_text=remediation,
        sources=sources,
    )
