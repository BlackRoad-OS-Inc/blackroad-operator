import fs from 'node:fs/promises';
import path from 'node:path';
import { GateCheckInput, GateCheckResult, GateCheckState, GateEnvironment, GateStatus, GateStatusInput, MetricsSummary, PolicySummary, TestsSummary } from '../types/gate.js';

const ROOT = process.env.PRISM_CONSOLE_ROOT
  ? path.resolve(process.env.PRISM_CONSOLE_ROOT)
  : path.resolve(process.cwd(), '..');

function resolvePath(...segments: string[]): string {
  return path.join(ROOT, ...segments);
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

interface PolicyCase {
  label?: string;
  rules?: unknown[];
  violations?: unknown[];
  warnings?: unknown[];
}

async function evaluatePolicyCases(): Promise<PolicySummary> {
  const casesDir = resolvePath('demo', 'cases');
  let entries: string[] = [];
  try {
    entries = await fs.readdir(casesDir);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return { pass: false, rules: 0, violations: 0, warnings: 0 };
    }
    throw error;
  }

  let totalRules = 0;
  let totalWarnings = 0;
  let totalViolations = 0;

  for (const entry of entries) {
    if (!entry.endsWith('.json')) {
      continue;
    }
    const parsed = await readJsonFile<PolicyCase>(path.join(casesDir, entry));
    if (!parsed) {
      continue;
    }
    const label = (parsed.label ?? '').toString().toLowerCase();
    if (label !== 'good' && label !== 'borderline') {
      continue;
    }
    totalRules += Array.isArray(parsed.rules) ? parsed.rules.length : 0;
    totalWarnings += Array.isArray(parsed.warnings) ? parsed.warnings.length : 0;
    totalViolations += Array.isArray(parsed.violations) ? parsed.violations.length : 0;
  }

  return {
    pass: totalViolations === 0 && totalRules > 0,
    rules: totalRules,
    violations: totalViolations,
    warnings: totalWarnings,
  };
}

interface TestsSnapshot {
  unit?: string;
  ui?: string;
  opa?: string;
}

const GREEN = 'green';

function normaliseStatus(value: unknown, fallback = 'unknown'): string {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : fallback;
}

async function readTests(commit: string): Promise<TestsSummary> {
  const data = await readJsonFile<TestsSnapshot>(resolvePath('data', 'tests', `${commit}.json`));
  const unit = normaliseStatus(data?.unit, GREEN);
  const ui = normaliseStatus(data?.ui, GREEN);
  const opa = normaliseStatus(data?.opa, GREEN);
  return { unit, ui, opa };
}

interface MetricsSnapshot {
  contract?: string;
  observability?: string;
}

async function readMetrics(): Promise<MetricsSummary> {
  const data = await readJsonFile<MetricsSnapshot>(resolvePath('data', 'metrics', 'status.json'));
  const contract = normaliseStatus(data?.contract, GREEN);
  const observability = normaliseStatus(data?.observability, GREEN);
  return { contract, observability };
}

interface ApprovalsState {
  granted?: string[];
}

type ApprovalsManifest = Partial<Record<GateEnvironment, string[]>>;

async function readApprovalsManifest(): Promise<ApprovalsManifest> {
  const manifest = await readJsonFile<ApprovalsManifest>(resolvePath('config', 'approvals.json'));
  return manifest ?? {};
}

async function readApprovals(commit: string): Promise<string[]> {
  const record = await readJsonFile<ApprovalsState>(resolvePath('data', 'approvals', `${commit}.json`));
  if (!record?.granted) {
    return [];
  }
  return Array.from(new Set(record.granted.map((value) => value.toLowerCase())));
}

function diffApprovals(required: string[], granted: string[]): { granted: string[]; pending: string[] } {
  const grantedSet = new Set(granted.map((value) => value.toLowerCase()));
  const grantedList = required.filter((value) => grantedSet.has(value.toLowerCase()));
  const pending = required.filter((value) => !grantedSet.has(value.toLowerCase()));
  return { granted: grantedList, pending };
}

export async function getGateStatus(input: GateStatusInput): Promise<GateStatus> {
  const [policy, tests, metrics, manifest, approvalsGranted] = await Promise.all([
    evaluatePolicyCases(),
    readTests(input.commit),
    readMetrics(),
    readApprovalsManifest(),
    readApprovals(input.commit),
  ]);

  const required = Array.isArray(manifest[input.env]) ? manifest[input.env]! : [];
  const approvals = diffApprovals(required, approvalsGranted);
  const reasons: string[] = [];

  if (!policy.pass) {
    reasons.push('policy:violations present');
  }

  (Object.entries(tests) as [keyof TestsSummary, string][]).forEach(([key, value]) => {
    if (value !== GREEN) {
      reasons.push(`test:${key} ${value}`);
    }
  });

  (Object.entries(metrics) as [keyof MetricsSummary, string][]).forEach(([key, value]) => {
    if (value !== GREEN) {
      reasons.push(`metric:${key} ${value}`);
    }
  });

  approvals.pending.forEach((name) => {
    reasons.push(`approval:${name} pending`);
  });

  return {
    commit: input.commit,
    env: input.env,
    policy,
    tests,
    metrics,
    approvals: { required, granted: approvals.granted, pending: approvals.pending },
    ready: reasons.length === 0,
    reasons,
  };
}

function resolveRepository(): { owner: string; repo: string } | null {
  const repoSource = process.env.GATE_GITHUB_REPOSITORY || process.env.GITHUB_REPOSITORY;
  if (!repoSource) {
    return null;
  }
  const [owner, repo] = repoSource.split('/');
  if (!owner || !repo) {
    return null;
  }
  return { owner, repo };
}

const CHECK_RUN_ENDPOINT = 'https://api.github.com';

function mapConclusion(status: GateCheckState): GateCheckState {
  return status;
}

export async function upsertGateCheck(input: GateCheckInput): Promise<GateCheckResult> {
  const token = process.env.GH_CHECKS_PAT || process.env.GITHUB_TOKEN;
  if (!token) {
    return { ok: false, action: 'skipped', message: 'missing_github_token' };
  }
  const repository = resolveRepository();
  if (!repository) {
    return { ok: false, action: 'skipped', message: 'missing_repository' };
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'blackroad-prism-console-gatekeeper',
    'X-GitHub-Api-Version': '2022-11-28',
  } as const;

  const listUrl = `${CHECK_RUN_ENDPOINT}/repos/${repository.owner}/${repository.repo}/commits/${input.commit}/check-runs`;

  try {
    const listResponse = await fetch(listUrl, { headers });
    if (!listResponse.ok) {
      return { ok: false, action: 'skipped', message: `list_failed:${listResponse.status}` };
    }
    const payload = (await listResponse.json()) as { check_runs?: { id: number; name: string }[] };
    const existing = payload.check_runs?.find((run) => run.name === input.name);
    const body = {
      name: input.name,
      status: 'completed',
      conclusion: mapConclusion(input.status),
      output: {
        title: input.name,
        summary: input.summary ?? '',
      },
    };

    if (existing) {
      const updateUrl = `${CHECK_RUN_ENDPOINT}/repos/${repository.owner}/${repository.repo}/check-runs/${existing.id}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...body, completed_at: new Date().toISOString() }),
      });
      if (!updateResponse.ok) {
        return { ok: false, action: 'skipped', message: `update_failed:${updateResponse.status}` };
      }
      return { ok: true, action: 'updated', checkRunId: existing.id };
    }

    const createUrl = `${CHECK_RUN_ENDPOINT}/repos/${repository.owner}/${repository.repo}/check-runs`;
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, head_sha: input.commit }),
    });
    if (!createResponse.ok) {
      return { ok: false, action: 'skipped', message: `create_failed:${createResponse.status}` };
    }
    const created = (await createResponse.json()) as { id?: number };
    return { ok: true, action: 'created', checkRunId: created.id };
  } catch (error: unknown) {
    return { ok: false, action: 'skipped', message: (error as Error).message };
  }
}
