# Interference Truth Engine Specification

**Version:** 0.1 — 2025-02-08

The Interference Truth Engine evaluates competing statements, tracks minority perspectives, and collapses observations into anchored truth-steps. It operates on top of SIG geometry and PS-SHA∞ identity, ensuring every decision is both spatially situated and cryptographically accountable.

## Text Snapshots
- **Snapshot inputs:** Structured claims with SIG `(r, θ, τ)` coordinates, PS-SHA∞ anchor, and originating agent role.
- **Normalization:** Claims are normalized into canonical phrasing and units to make interference comparisons deterministic.
- **Temporal layering:** Snapshots retain timestamped layers so later claims can interfere constructively or destructively with earlier ones.

## Agent Assessments
- **Assessment packets:** Agents submit confidence scores, rationale citations, and risk classifications tied to their PS-SHA∞ anchors.
- **Context windows:** Assessments reference local SIG neighborhoods, enabling proximity-aware reasoning about relevance and overlap.
- **Bias accounting:** Mesh metadata (trust weights, historical accuracy) influences how heavily an assessment impacts aggregate confidence.

## Minority Reports
- **Preservation:** Minority or dissenting views remain journaled even when not adopted, creating an audit trail of alternative hypotheses.
- **Escalation:** Minority reports above a risk threshold trigger Lucidia routing to guardians or human operators.
- **Attribution:** Each minority report carries both PS-SHA∞ identity and factor-tree path to maintain accountable lineage.

## Truth Collapse
- **Collapse trigger:** When aggregate confidence passes a deterministic threshold or when latency budgets expire.
- **Collapse output:** Selected claim, residual uncertainty, references to supporting/contradicting snapshots, and SIG coordinates for rendering.
- **Reversibility:** Subsequent evidence can reopen a collapsed truth, spawning a new branch while retaining prior state as a minority record.

## Confidence Aggregation
- **Interference summation:** Confidence updates follow constructive/destructive interference based on angular separation in SIG space.
- **Weighting:** Trust weights, recency, and evidence quality modulate the amplitude before summation.
- **Normalization:** Outputs are normalized to `[0,1]` with explicit uncertainty bands for operator dashboards.

## PS-SHA∞ Anchoring
- **Journal binding:** Every snapshot, assessment, and collapse event is hashed with its predecessors for tamper-evidence.
- **Cross-layer attestations:** Block headers in RoadChain reference collapse events, enabling external verification.
- **Agent lineage:** Delegated agents include parent anchors to preserve the chain of custody for each decision.

## Outputs and Interfaces
- **To Lucidia:** Supplies routing signals (entropy, minority density) for ribbon scheduling.
- **To RoadChain:** Emits ledger-ready events for each collapse and for elevated minority reports.
- **To Operator/Core:** Provides dashboards, alerts, and audit extracts aligned to regulators and enterprise controls.
