"""Pre-defined demo dataset for the quantum-secure compliance copilot."""

from __future__ import annotations

from typing import List

from .models import ClientProfile, DemoCase, ReviewRequest


def load_demo_cases() -> List[DemoCase]:
    cases: List[DemoCase] = []

    base_request_kwargs = {
        "advisor_email": "advisor@blackroad.io",
        "representative_id": "RR-2210",
        "pqc_enabled": False,
        "policy_version": "2025.11.07",
    }

    cases.append(
        DemoCase(
            case_id="QC-DEMO-001",
            title="Balanced income approval",
            description="Demonstrates a clean pass with balanced language and sourced data.",
            payload=ReviewRequest(
                profile=ClientProfile(
                    client_name="Jordan H.",
                    client_age=54,
                    net_worth_band="1m-5m",
                    investment_objective="income",
                    risk_tolerance="moderate",
                    marketing_material=(
                        "BlackRoad Advisors proposes a dividend-focused managed portfolio delivering steady income. "
                        "The materials reference Morningstar's dividend aristocrats report and note market volatility risk."
                    ),
                    data_sources=[
                        "Morningstar Dividend Aristocrats 2025",
                        "Internal macro outlook Q1",
                    ],
                    advisor_notes="Long-time client seeking predictable income streams.",
                ),
                mode="suitability",
                **base_request_kwargs,
            ),
            expected_outcome="approved",
            highlighted_rules=["finra_2210_003", "language_safety_003"],
        )
    )

    cases.append(
        DemoCase(
            case_id="QC-DEMO-002",
            title="Borderline marketing with superlatives",
            description="Fails due to superlative language and missing sources.",
            payload=ReviewRequest(
                profile=ClientProfile(
                    client_name="Skyler P.",
                    client_age=46,
                    net_worth_band="250k-1m",
                    investment_objective="growth",
                    risk_tolerance="moderate",
                    marketing_material=(
                        "BlackRoad Advisors guarantees the fund will outperform the market with double-digit returns and zero risk."
                    ),
                    data_sources=[],
                ),
                mode="marketing",
                **base_request_kwargs,
            ),
            expected_outcome="needs-remediation",
            highlighted_rules=["finra_2210_001", "language_safety_001"],
        )
    )

    cases.append(
        DemoCase(
            case_id="QC-DEMO-003",
            title="Speculative mismatch",
            description="Flags a Reg BI issue where conservative risk does not match a speculative objective.",
            payload=ReviewRequest(
                profile=ClientProfile(
                    client_name="Devon R.",
                    client_age=32,
                    net_worth_band="250k-1m",
                    investment_objective="speculation",
                    risk_tolerance="conservative",
                    marketing_material=(
                        "BlackRoad Advisors positions a venture debt sleeve that could double in value but notes the volatility risk."
                    ),
                    data_sources=["PitchBook Venture Debt Index"],
                ),
                mode="suitability",
                **base_request_kwargs,
            ),
            expected_outcome="needs-remediation",
            highlighted_rules=["finra_2210_005"],
        )
    )

    cases.append(
        DemoCase(
            case_id="QC-DEMO-004",
            title="Aggressive marketing with qualifiers",
            description="Passes while using PQC mode to show signature capture.",
            payload=ReviewRequest(
                profile=ClientProfile(
                    client_name="Morgan S.",
                    client_age=41,
                    net_worth_band="1m-5m",
                    investment_objective="growth",
                    risk_tolerance="aggressive",
                    marketing_material=(
                        "BlackRoad Advisors outlines a thematic equity sleeve that may deliver high yield but emphasises liquidity risk."
                    ),
                    data_sources=["BlackRock Thematic Outlook 2025"],
                ),
                mode="marketing",
                pqc_enabled=True,
                **base_request_kwargs,
            ),
            expected_outcome="approved",
            highlighted_rules=["language_safety_002", "sec_204_2_001"],
        )
    )

    cases.append(
        DemoCase(
            case_id="QC-DEMO-005",
            title="Short copy missing firm name",
            description="Fails due to absent firm attribution and risk references.",
            payload=ReviewRequest(
                profile=ClientProfile(
                    client_name="Alex T.",
                    client_age=58,
                    net_worth_band="1m-5m",
                    investment_objective="capital-preservation",
                    risk_tolerance="conservative",
                    marketing_material="Contact us for the best structured note returns without any risk.",
                    data_sources=["Structured Notes Quarterly"],
                ),
                mode="marketing",
                **base_request_kwargs,
            ),
            expected_outcome="needs-remediation",
            highlighted_rules=["finra_2210_004", "language_safety_003"],
        )
    )

    return cases
