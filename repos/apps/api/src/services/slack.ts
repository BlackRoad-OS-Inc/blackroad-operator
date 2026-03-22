import type { PolicyResultCounts } from '../types/metrics.js';
import type { AttestStatus, PqcMode, PolicyEvalResult } from '../metrics/metrics.js';

interface SlackPayload {
  text: string;
  blocks: Array<
    | { type: 'section'; text: { type: 'mrkdwn'; text: string } }
    | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> }
  >;
}

export function isSlackConfigured(): boolean {
  return typeof process.env.SLACK_WEBHOOK_URL === 'string' && process.env.SLACK_WEBHOOK_URL.trim().length > 0;
}

export async function postWebhook(payload: SlackPayload, attempt = 0): Promise<boolean> {
  if (!isSlackConfigured()) {
    return false;
  }
  const url = (process.env.SLACK_WEBHOOK_URL as string).trim();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return true;
    }
    if (res.status >= 500 && attempt < 2) {
      await waitFor((attempt + 1) * 300);
      return postWebhook(payload, attempt + 1);
    }
    return false;
  } catch (_err) {
    if (attempt < 2) {
      await waitFor((attempt + 1) * 300);
      return postWebhook(payload, attempt + 1);
    }
    return false;
  }
}

export interface PolicySlackOptions {
  caseId: string;
  result: PolicyEvalResult;
  counts: PolicyResultCounts;
  ruleCount: number;
  pqc: PqcMode;
  consoleUrl?: string;
  bundleUrl?: string;
}

export async function notifyPolicyEvaluation(opts: PolicySlackOptions): Promise<boolean> {
  if (!isSlackConfigured()) {
    return false;
  }
  const title = `PolicyCheck ${opts.result} • case:${opts.caseId}`;
  const body = `pass=${opts.counts.pass} warn=${opts.counts.warn} fail=${opts.counts.fail} rules=${opts.ruleCount} pqc=${opts.pqc}`;
  const links: string[] = [];
  if (opts.consoleUrl) {
    links.push(`<${opts.consoleUrl}|view case>`);
  }
  if (opts.bundleUrl) {
    links.push(`<${opts.bundleUrl}|bundle>`);
  }
  const payload: SlackPayload = {
    text: `${title}\n${body}${links.length ? `\n${links.join(' · ')}` : ''}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${title}*\n${body}` }
      }
    ]
  };
  if (links.length > 0) {
    payload.blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: links.join(' · ') }]
    });
  }
  return postWebhook(payload);
}

export interface AttestSlackOptions {
  status: AttestStatus;
  pqc: PqcMode;
  reason?: string;
  bundleUrl?: string;
}

export async function notifyAttest(opts: AttestSlackOptions): Promise<boolean> {
  if (!isSlackConfigured()) {
    return false;
  }
  const isFailure = opts.status === 'fail';
  const title = isFailure ? 'Attest: bundle failed' : 'Attest: bundle ok';
  const reason = isFailure && opts.reason ? sanitizeReason(opts.reason) : undefined;
  const body = isFailure ? reason ?? 'reason unavailable' : `pqc=${opts.pqc}`;
  const links: string[] = [];
  if (opts.bundleUrl) {
    links.push(`<${opts.bundleUrl}|bundle>`);
  }
  const payload: SlackPayload = {
    text: `${title}\n${body}${links.length ? `\n${links.join(' · ')}` : ''}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${title}*\n${body}` }
      }
    ]
  };
  if (links.length > 0) {
    payload.blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: links.join(' · ') }] });
  }
  return postWebhook(payload);
}

function sanitizeReason(input: string): string {
  const trimmed = input.trim().slice(0, 200);
  return trimmed.replace(/\s+/g, ' ') || 'no details';
}

function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
