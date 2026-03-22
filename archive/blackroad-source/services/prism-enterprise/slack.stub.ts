import assert from 'node:assert/strict';
import { notifyPolicyEvaluation } from '../src/services/slack.ts';

async function main(): Promise<void> {
  delete (process as any).env.SLACK_WEBHOOK_URL;
  const ok = await notifyPolicyEvaluation({
    caseId: 'stub',
    result: 'pass',
    counts: { pass: 1, warn: 0, fail: 0 },
    ruleCount: 1,
    pqc: 'unavailable'
  });
  assert.equal(ok, false);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
