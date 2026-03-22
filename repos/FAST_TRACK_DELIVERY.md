# Fast-Track Delivery Guide

When urgency is high we can still move quickly without abandoning safety. This playbook captures the fastest path to shipping code while honoring our baseline guardrails.

## 1. Cut Through Coordination Noise
- **Single-thread the decision maker.** Identify the sponsor who accepts risk for the change and record it in the issue.
- **Declare the scope in writing.** Drop a brief design or intent note (two paragraphs max) in the work item and link to it from the PR description.
- **Route for asynchronous review.** Mention the required reviewers explicitly and assign clear response-time expectations (e.g., "ACK within 30 minutes").

## 2. Harden the Minimum Validation Set
- **Smoke test locally.** Run the targeted unit or integration tests that cover the code path you touched. Capture the exact command and output in the PR.
- **Leverage feature flags.** If the change is high-risk, land it behind a flag so production exposure is controlled.
- **Automate sanity checks.** Use `make lint` or the relevant quick linters so style issues never block urgent merges later.

## 3. Collapse the Deployment Cycle
- **Batch dependent commits.** Squash related fixes into a single PR to cut CI queue churn.
- **Use pre-approved deployment windows.** Coordinate with ReleaseOps to reuse a still-open window instead of scheduling a new one.
- **Prep a rollback plan.** Document the exact revert command or config toggle before merging so on-call can act instantly if needed.

## 4. Document the Exception
- **Flag the PR.** Add a `fast-track` label and call out which checks were skipped (if any) plus the mitigating controls that cover the gap.
- **Retro afterwards.** Within 24 hours capture outcomes and surprises in the incident or ops journal so we keep improving the playbook.

Speed is achievable without chaos when we compress feedback loops, automate the essential checks, and keep risk ownership explicit.
