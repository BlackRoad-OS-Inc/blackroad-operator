# Codex Ψ′ Patent Orchestrator Prompt Pack

## Overview

This pack bundles the Codex Ψ′ "Patent Orchestrator" prompt together with ready-made
inputs so an operator can drive a complete patent workflow for **five inventions** in
a single run. The orchestrator coordinates novelty analysis, claim drafting, drawings,
IDS compilation, and filing package preparation while keeping human approval gates
intact. Use it when you need attorney-ready material across a patent family without
hand stitching multiple prompts.

## Included Assets

- **Primary prompt** – `codex/prompts/patent_orchestrator.prompt.md`
- **Sample bundle input** – embedded JSON payload that lists the assignee, inventors,
  docket prefix, priority strategy, and the five inventions (keys `DE-001` → `QC-005`).
- **Task briefs** – staged responsibilities for the Prior-Art Analyst, Claim Drafter,
  Diagrammer, Compliance Clerk, and Docketing Bot agents.
- **Hard-stop gates** – G1 Draft/Claims, G2 IDS, G3 Drawings, G4 Filing Package,
  G5 Office Action Response.

Everything is copy-ready. Paste the prompt into your Codex Ψ′ session, feed the bundle
as the first message, and let the orchestrator emit artifacts per invention (claims,
spec, drawings manifest, IDS spreadsheet schema, and filing package checklist).

## Workflow Summary

1. **System guardrails** remind the agent to defer legal advice, enforce human review,
   and scrub sensitive inventor data before export.
2. **Input parsing** maps the shared metadata plus five invention payloads into staged
   tasks. Each invention retains its own evidence list and title for later packaging.
3. **Agent fan-out**:
   - *Prior-Art Analyst* scores overlap, surfaces differentiators, and writes
     `novelty_report.md`.
   - *Claim Drafter* generates independent/dependent claims, full specifications, and
     abstracts that stay within 150 words.
   - *Diagrammer* outlines required SVG drawing files with numbered callouts matching
     the specification.
   - *Compliance Clerk* assembles an IDS CSV schema with citation guidance.
   - *Docketing Bot* prepares per-invention filing package manifests covering
     provisional vs. non-provisional paths.
4. **Human gates** pause execution until the responsible attorney clears each stage.
5. **Outputs** are grouped by invention so the attorney can export documents directly
   into their docketing system.

## Usage Tips

- Update the bundle JSON with your real inventor roster and evidence filenames before
  running. Keep the five invention keys if you want to mirror the starter template.
- When adapting to fewer inventions, delete the unused entries but keep the structure
  so the orchestrator continues to fan out correctly.
- Store generated artifacts in a version-controlled workspace; the prompt assumes
  filenames like `claims.docx`, `spec.pdf`, and `ids.csv` under each invention's folder.
- Pair the pack with a retrieval system (e.g., novelty search API) by dropping links
  into the `evidence` or `links` fields—the orchestrator will reference them in the
  reports while keeping network calls disabled by default.

## Extending the Pack

Need extra jurisdictions or office action templates? Append new agent tracks after the
five core stages and insert additional gate labels (e.g., `G6 PCT Decision`). The
prompt's modular structure makes it easy to bolt on localized requirements while
retaining Codex Ψ′ guardrails.
