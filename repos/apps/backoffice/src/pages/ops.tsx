import React, { useEffect, useMemo, useState } from 'react';

type CounterGroup = Record<string, number>;

interface PolicyMetrics {
  version: string;
  now: string;
  counters: {
    policy_eval_total: CounterGroup;
    policy_eval_error_total: CounterGroup;
    attest_bundle_total: CounterGroup;
  };
  gauges: {
    policy_rules_count: number;
    uptime_seconds: number;
  };
  latency: {
    policy_eval_p95_ms: number;
    engine_p95_ms: number;
  };
}

const REFRESH_INTERVAL_MS = 10_000;

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 72,
  padding: '8px 12px',
  borderRadius: 20,
  fontWeight: 600,
  marginRight: 12
};

export default function Ops(): JSX.Element {
  const [metrics, setMetrics] = useState<PolicyMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/policy/metrics');
        if (!response.ok) {
          throw new Error(`metrics request failed: ${response.status}`);
        }
        const body = (await response.json()) as PolicyMetrics;
        if (active) {
          setMetrics(body);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'unable to load metrics');
        }
      }
    };
    fetchMetrics();
    const id = window.setInterval(fetchMetrics, REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  const bundleSuccessRate = useMemo(() => {
    if (!metrics) {
      return 0;
    }
    const ok = metrics.counters.attest_bundle_total.ok ?? 0;
    const fail = metrics.counters.attest_bundle_total.fail ?? 0;
    const total = ok + fail;
    if (!total) {
      return 0;
    }
    return Math.round((ok / total) * 100);
  }, [metrics]);

  const chips = useMemo(() => {
    if (!metrics) {
      return null;
    }
    const totals = metrics.counters.policy_eval_total;
    return (
      <div style={{ marginBottom: 16 }}>
        <span style={{ ...chipStyle, background: '#e6ffed', color: '#067647' }}>Pass {totals.pass ?? 0}</span>
        <span style={{ ...chipStyle, background: '#fff7e6', color: '#b05e00' }}>Warn {totals.warn ?? 0}</span>
        <span style={{ ...chipStyle, background: '#ffecec', color: '#b42318' }}>Fail {totals.fail ?? 0}</span>
      </div>
    );
  }, [metrics]);

  if (error) {
    return (
      <section style={{ padding: 16 }}>
        <h2>Policy Ops</h2>
        <div role="alert" style={{ color: '#b42318' }}>Failed to load metrics: {error}</div>
      </section>
    );
  }

  if (!metrics) {
    return (
      <section style={{ padding: 16 }}>
        <h2>Policy Ops</h2>
        <p>Loading policy metrics…</p>
      </section>
    );
  }

  return (
    <section style={{ padding: 16 }}>
      <h2>Policy Ops</h2>
      <p style={{ color: '#475467', marginBottom: 8 }}>
        Version {metrics.version} • Updated {new Date(metrics.now).toLocaleTimeString()}
      </p>
      {chips}
      <div style={{ marginBottom: 16 }}>
        <strong>p95 latency:</strong>
        <div style={{ marginTop: 4 }}>
          <span style={{ marginRight: 16 }}>Eval: {metrics.latency.policy_eval_p95_ms} ms</span>
          <span>Engine: {metrics.latency.engine_p95_ms} ms</span>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Bundle success rate:</strong> {bundleSuccessRate}%
      </div>
      <div style={{ color: '#475467' }}>
        <div>Rules loaded: {metrics.gauges.policy_rules_count}</div>
        <div>Uptime: {metrics.gauges.uptime_seconds}s</div>
      </div>
    </section>
  );
}
