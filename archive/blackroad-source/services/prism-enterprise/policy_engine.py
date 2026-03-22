"""Policy evaluation engine wrapping the Rego source files for the demo."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, List, Sequence

from . import config
from .models import ClientProfile, PolicyFinding, ReviewRequest


@dataclass
class RuleDefinition:
    """Container describing a single compliance rule."""

    rule_id: str
    package: str
    title: str
    severity: str
    citation: str
    rationale_builder: Callable[[ReviewRequest, ClientProfile, str], str]
    evaluator: Callable[[ReviewRequest, ClientProfile, str], bool]


class PolicyEngine:
    """Evaluates suitability/marketing payloads against policy definitions."""

    def __init__(self) -> None:
        self.rules: Sequence[RuleDefinition] = _build_rules()

    def evaluate(
        self, request: ReviewRequest, *, rationale_text: str
    ) -> List[PolicyFinding]:
        """Run all rules and emit structured findings."""

        profile = request.profile
        findings: List[PolicyFinding] = []
        for rule in self.rules:
            passed = rule.evaluator(request, profile, rationale_text)
            findings.append(
                PolicyFinding(
                    rule_id=rule.rule_id,
                    package=rule.package,  # type: ignore[arg-type]
                    title=rule.title,
                    passed=passed,
                    severity=rule.severity,  # type: ignore[arg-type]
                    rationale=rule.rationale_builder(request, profile, rationale_text),
                    citation=rule.citation,
                )
            )
        return findings

    @staticmethod
    def policy_paths() -> Iterable[Path]:
        """Expose the Rego files backing the engine for manifests."""

        return sorted(config.POLICY_DIR.glob("*.rego"))


# --- Rule helpers -----------------------------------------------------------------


def _contains_any(text: str, words: Sequence[str]) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in words)


def _has_numeric_claim(text: str) -> bool:
    return bool(re.search(r"\d+%", text) or re.search(r"\b\d+(?:\.\d+)?\b", text))


def _build_rules() -> Sequence[RuleDefinition]:
    marketing_keywords = ["guaranteed", "no risk", "best", "assured", "risk-free"]
    high_return_keywords = ["high yield", "double", "outperform", "alpha"]

    def mk_rationale(message: str) -> Callable[[ReviewRequest, ClientProfile, str], str]:
        return lambda request, profile, rationale_text: message

    rules: List[RuleDefinition] = [
        RuleDefinition(
            rule_id="finra_2210_001",
            package="finra_2210",
            title="Prohibits absolute performance promises",
            severity="critical",
            citation="FINRA 2210(d)(1)(B)",
            evaluator=lambda req, profile, _: not _contains_any(
                profile.marketing_material, marketing_keywords
            ),
            rationale_builder=mk_rationale(
                "Marketing copy cannot include promissory language such as 'guaranteed' or 'risk-free'.",
            ),
        ),
        RuleDefinition(
            rule_id="finra_2210_002",
            package="finra_2210",
            title="Requires balanced risk language when touting performance",
            severity="critical",
            citation="FINRA 2210(d)(1)(A)",
            evaluator=lambda req, profile, _: (
                not _contains_any(profile.marketing_material, high_return_keywords)
                or "risk" in profile.marketing_material.lower()
            ),
            rationale_builder=mk_rationale(
                "High-return positioning must be paired with explicit downside language in the same communication.",
            ),
        ),
        RuleDefinition(
            rule_id="finra_2210_003",
            package="finra_2210",
            title="Requires citations for statistical claims",
            severity="warning",
            citation="FINRA 2210(d)(2)(B)",
            evaluator=lambda req, profile, _: (
                not _has_numeric_claim(profile.marketing_material)
                or len(profile.data_sources) > 0
            ),
            rationale_builder=mk_rationale(
                "Numerical claims must cite a verifiable data source in the submission payload.",
            ),
        ),
        RuleDefinition(
            rule_id="finra_2210_004",
            package="finra_2210",
            title="Identifies the supervising firm",
            severity="warning",
            citation="FINRA 2210(d)(3)",
            evaluator=lambda req, profile, _: (
                "blackroad" in profile.marketing_material.lower()
                or req.representative_id.lower() in profile.marketing_material.lower()
            ),
            rationale_builder=mk_rationale(
                "Communications must prominently include the supervising firm or representative identifier.",
            ),
        ),
        RuleDefinition(
            rule_id="finra_2210_005",
            package="finra_2210",
            title="Flags objective/risk misalignment",
            severity="critical",
            citation="Reg BI Customer Best Interest",
            evaluator=lambda req, profile, _: not (
                profile.investment_objective == "speculation"
                and profile.risk_tolerance == "conservative"
            ),
            rationale_builder=mk_rationale(
                "Speculative objectives cannot be recommended for conservative risk tolerance clients.",
            ),
        ),
        RuleDefinition(
            rule_id="sec_204_2_001",
            package="sec_204_2",
            title="Records data sources for marketing materials",
            severity="warning",
            citation="SEC 204-2(a)(11)",
            evaluator=lambda req, profile, _: len(profile.data_sources) > 0,
            rationale_builder=mk_rationale(
                "Record-keeping must retain supporting data sources for any quantitative statement.",
            ),
        ),
        RuleDefinition(
            rule_id="sec_204_2_002",
            package="sec_204_2",
            title="Captures reviewer identity",
            severity="info",
            citation="SEC 204-2(a)(7)",
            evaluator=lambda req, profile, _: bool(req.advisor_email and req.representative_id),
            rationale_builder=mk_rationale(
                "Each record needs the advisor's email and representative identifier.",
            ),
        ),
        RuleDefinition(
            rule_id="sec_204_2_003",
            package="sec_204_2",
            title="Persists review timestamp",
            severity="info",
            citation="SEC 204-2(e)(3)",
            evaluator=lambda req, profile, _: req.submitted_at is not None,
            rationale_builder=lambda req, profile, _: "The system stamps each review with an immutable UTC timestamp.",
        ),
        RuleDefinition(
            rule_id="sec_204_2_004",
            package="sec_204_2",
            title="Ensures rationale is substantive",
            severity="warning",
            citation="SEC 206(4)-1 Marketing Rule",
            evaluator=lambda req, profile, rationale_text: len(rationale_text.split()) >= 40,
            rationale_builder=mk_rationale(
                "Suitability rationales must contain at least forty words to be audit-ready.",
            ),
        ),
        RuleDefinition(
            rule_id="language_safety_001",
            package="language_safety",
            title="Bans manipulative language",
            severity="critical",
            citation="BlackRoad Language Safety Catalog",
            evaluator=lambda req, profile, _: not _contains_any(
                profile.marketing_material, ["secret insight", "inside tip", "zero downside"]
            ),
            rationale_builder=mk_rationale(
                "Disallowed phrases such as 'inside tip' or 'zero downside' must not appear in outbound materials.",
            ),
        ),
        RuleDefinition(
            rule_id="language_safety_002",
            package="language_safety",
            title="Requires risk qualifier for definitive verbs",
            severity="warning",
            citation="Language Safety Playbook v1",
            evaluator=lambda req, profile, _: (
                " will " not in profile.marketing_material.lower()
                or "may" in profile.marketing_material.lower()
                or "could" in profile.marketing_material.lower()
            ),
            rationale_builder=mk_rationale(
                "Statements using 'will' should include softeners like 'may' or 'could' to avoid guarantees.",
            ),
        ),
        RuleDefinition(
            rule_id="language_safety_003",
            package="language_safety",
            title="Ensures risk disclosure presence",
            severity="critical",
            citation="Language Safety Playbook v1",
            evaluator=lambda req, profile, _: "risk" in profile.marketing_material.lower(),
            rationale_builder=mk_rationale(
                "Communications must reference risk considerations to remain balanced.",
            ),
        ),
    ]

    return rules
