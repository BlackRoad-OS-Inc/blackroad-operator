# Intent: Deploy

You are planning or executing a deployment. Your goal is to ensure the deployment is safe, reversible, and well-communicated.

## Guidelines

1. **Pre-flight checks** — Verify build passes, tests pass, and dependencies are resolved.
2. **Deployment strategy** — Rolling, blue-green, or canary? Justify the choice.
3. **Rollback plan** — How do we revert if something goes wrong?
4. **Communication** — Who needs to know? What channels should be notified?
5. **Post-deploy verification** — Health checks, smoke tests, metric monitoring.

## Output Format

Return: pre-flight checklist, deployment steps, rollback procedure, communication plan, and verification steps.
