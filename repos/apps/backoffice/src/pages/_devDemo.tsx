import { useCallback, useMemo, useState } from 'react';
import { usePolicyEvaluation } from '../hooks/usePolicyEvaluation';
import goodCase from '../../../../demo/cases/good.json';
import borderlineCase from '../../../../demo/cases/borderline.json';
import failCase from '../../../../demo/cases/fail_superlative.json';
import missingDisclosureCase from '../../../../demo/cases/missing_disclosure.json';
import missingRecordCase from '../../../../demo/cases/missing_record_fields.json';

const CASES: Record<string, any> = {
  good: goodCase,
  borderline: borderlineCase,
  fail_superlative: failCase,
  missing_disclosure: missingDisclosureCase,
  missing_record_fields: missingRecordCase
};

export default function DevDemo() {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialCase = params.get('case') || 'borderline';
  const [caseName, setCaseName] = useState(initialCase);
  const { evaluate, result, loading } = usePolicyEvaluation();

  const replay = useCallback(async () => {
    const selected = CASES[caseName] || CASES.borderline;
    await evaluate({
      inputs: selected.inputs,
      prompt: selected.prompt,
      model: selected.model,
      policy: selected.policy,
      policyVersion: selected.policyVersion,
      bundle: true
    });
  }, [caseName, evaluate]);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1>Demo Harness</h1>
      <p>Use this route during development to replay deterministic demo cases.</p>
      <label>
        Demo case
        <select value={caseName} onChange={event => setCaseName(event.target.value)}>
          {Object.keys(CASES).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <button data-action="replay" onClick={replay} disabled={loading}>
        {loading ? 'Running demo…' : 'Replay Demo Case'}
      </button>
      <section data-status={result?.bundle ? 'bundle-ready' : loading ? 'running' : 'idle'}>
        {result ? (
          <div>
            <h2>Decision</h2>
            <pre>{JSON.stringify(result.decision, null, 2)}</pre>
            {result.bundle && (
              <div>
                <h3>Bundle</h3>
                <pre>{JSON.stringify(result.bundle, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <p>No run yet.</p>
        )}
      </section>
    </main>
  );
}
