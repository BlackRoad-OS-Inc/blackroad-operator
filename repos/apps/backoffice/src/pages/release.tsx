import React, { useEffect, useMemo, useState } from 'react';

type GateEnvironment = 'preview' | 'staging' | 'production';

interface PolicySummary { pass: boolean; rules: number; violations: number; warnings: number }
interface TestsSummary { unit: string; ui: string; opa: string }
interface MetricsSummary { contract: string; observability: string }
interface ApprovalsSummary { required: string[]; granted: string[]; pending: string[] }
interface GateStatus {
  commit: string;
  env: GateEnvironment;
  policy: PolicySummary;
  tests: TestsSummary;
  metrics: MetricsSummary;
  approvals: ApprovalsSummary;
  ready: boolean;
  reasons: string[];
}

const envOptions: GateEnvironment[] = ['preview', 'staging', 'production'];

const releaseManagerFlag = true;

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ReleasePage() {
  const defaultCommit = useMemo(() => {
    const globalAny = window as any;
    return (
      globalAny.__APP_COMMIT__ ||
      globalAny.__COMMIT_SHA__ ||
      globalAny.__BUILD_SHA__ ||
      ''
    );
  }, []);
  const [env, setEnv] = useState<GateEnvironment>('preview');
  const [commit, setCommit] = useState<string>(defaultCommit);
  const [status, setStatus] = useState<GateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workflowUrl = useMemo(() => {
    const repo = (window as any).GITHUB_REPOSITORY || 'blackroad/prism-console';
    return `https://github.com/${repo}/actions/workflows/gate-and-promote.yml`;
  }, []);

  useEffect(() => {
    if (!commit) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/gate/status?commit=${encodeURIComponent(commit)}&env=${env}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((payload: GateStatus) => {
        if (cancelled) return;
        setStatus(payload);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [commit, env]);

  return (
    <section>
      <h2>Release Readiness</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label>
          Environment
          <select value={env} onChange={(event) => setEnv(event.target.value as GateEnvironment)} style={{ marginLeft: 8 }}>
            {envOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Commit
          <input
            value={commit}
            onChange={(event) => setCommit(event.target.value)}
            placeholder="Commit SHA"
            style={{ marginLeft: 8, minWidth: 220 }}
          />
        </label>
      </div>
      {loading && <p>Loading gate status…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {status && !loading && (
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 4, maxWidth: 640 }}>
          <p>
            <strong>Commit:</strong> {status.commit}
          </p>
          <p>
            <strong>Ready:</strong> {status.ready ? 'Yes' : 'No'}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Gate</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Policy</td>
                <td>{status.policy.pass ? 'Pass' : 'Fail'}</td>
                <td>
                  {status.policy.rules} rules, {status.policy.violations} violations, {status.policy.warnings} warnings
                </td>
              </tr>
              <tr>
                <td>Tests</td>
                <td>
                  Unit {formatStatus(status.tests.unit)}, UI {formatStatus(status.tests.ui)}, OPA {formatStatus(status.tests.opa)}
                </td>
                <td>All suites must be green before promotion.</td>
              </tr>
              <tr>
                <td>Metrics</td>
                <td>
                  Contract {formatStatus(status.metrics.contract)}, Observability {formatStatus(status.metrics.observability)}
                </td>
                <td>Monitors must be within thresholds.</td>
              </tr>
              <tr>
                <td>Approvals</td>
                <td>{status.approvals.pending.length === 0 ? 'Complete' : 'Pending'}</td>
                <td>
                  Required: {status.approvals.required.join(', ') || 'None'}
                  <br />
                  Granted: {status.approvals.granted.join(', ') || 'None'}
                </td>
              </tr>
            </tbody>
          </table>
          {status.reasons.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Blocking reasons:</strong>
              <ul>
                {status.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {releaseManagerFlag && (
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            disabled
            title="Dispatch the gate-and-promote workflow from GitHub Actions"
            onClick={() => window.open(`${workflowUrl}/dispatch`, '_blank')}
          >
            Promote via GitHub Actions
          </button>
        </div>
      )}
    </section>
  );
}
