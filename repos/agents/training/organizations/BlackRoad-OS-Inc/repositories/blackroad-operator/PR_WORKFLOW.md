# blackroad-operator — PR Workflow

## Creating a PR
1. Branch from `main`: `git checkout -b feat/short-description`
2. Make atomic commits with clear messages
3. Push: `git push -u origin feat/short-description`
4. Create PR with `gh pr create`:
   - Title under 70 chars
   - Body has `## Summary` and `## Test Plan`
   - Add labels
   - Request review from @blackboxprogramming

## Review Checklist
- [ ] Code follows existing patterns
- [ ] No hardcoded secrets
- [ ] Tests pass
- [ ] Brand compliance (if UI changes)
- [ ] Security standards met
- [ ] Documentation updated if needed

## After Merge
- Branch auto-deletes (delete-branch-on-merge enabled)
- Log to [JOURNAL]
- Broadcast [TIL] if you learned something
