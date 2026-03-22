import { useCallback, useMemo, useState } from 'react';
import BundleVerifyDialog from './BundleVerifyDialog';
import { usePolicyEvaluation } from '../../hooks/usePolicyEvaluation';
import '../../styles/policy.css';

const DEFAULT_PROMPT = 'Summarise the incident and identify compliance red flags.';
const DEFAULT_INPUT = 'Potential breach reported by auditor. Need review.';

export default function PolicyCheckCard() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [model, setModel] = useState('gpt-4o');
  const [policyName, setPolicyName] = useState('Prism Default');
  const [policyVersion, setPolicyVersion] = useState('2024.09');
  const { quantumSecure, setQuantumSecure, evaluate, loading, result, error } = usePolicyEvaluation();

  const bundle = result?.bundle;
  const pqcSignature = bundle?.signatures?.pqc;

  const handleEvaluate = useCallback(() => {
    const inputs = { text: inputText };
    evaluate({
      inputs,
      prompt,
      model,
      bundle: true,
      policy: policyName,
      policyVersion
    }).catch(() => {
      /* handled via error state */
    });
  }, [inputText, prompt, model, evaluate, policyName, policyVersion]);

  const onDownload = useCallback(() => {
    if (bundle?.url) {
      window.open(bundle.url, '_blank');
    }
  }, [bundle]);

  const pqcBadge = useMemo(() => {
    if (!pqcSignature) return 'PQC unavailable';
    if (pqcSignature.mode === 'signed') return `PQC ✔ (${pqcSignature.algorithm})`;
    if (pqcSignature.mode === 'error') return 'PQC error';
    return `PQC ${pqcSignature.mode}`;
  }, [pqcSignature]);

  return (
    <div className="policy-card">
      <header>
        <div>
          <h3>Policy Evaluation</h3>
          <p>Sign and archive bundle evidence for every run.</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={quantumSecure}
            onChange={event => setQuantumSecure(event.target.checked)}
          />
          <span>Quantum-Secure</span>
        </label>
      </header>
      <div className="form-grid">
        <label>
          Policy name
          <input value={policyName} onChange={event => setPolicyName(event.target.value)} />
        </label>
        <label>
          Policy version
          <input value={policyVersion} onChange={event => setPolicyVersion(event.target.value)} />
        </label>
        <label>
          Model
          <input value={model} onChange={event => setModel(event.target.value)} />
        </label>
      </div>
      <label className="textarea">
        Prompt
        <textarea value={prompt} onChange={event => setPrompt(event.target.value)} />
      </label>
      <label className="textarea">
        Inputs
        <textarea value={inputText} onChange={event => setInputText(event.target.value)} />
      </label>
      <div className="actions">
        <button onClick={handleEvaluate} disabled={loading}>
          {loading ? 'Evaluating…' : 'Evaluate + Sign'}
        </button>
        <button onClick={onDownload} disabled={!bundle}>
          Download Bundle
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="result">
          <div className={`status ${result.decision?.compliant ? 'ok' : 'fail'}`}>
            {result.decision?.compliant ? 'Compliant' : 'Non-compliant'} · risk {result.decision?.riskScore?.toFixed(2)}
          </div>
          {bundle && (
            <div className="bundle-meta">
              <div className="badge success">Ed25519 ✔</div>
              <div className={`badge ${pqcSignature?.mode === 'signed' ? 'success' : 'neutral'}`}>{pqcBadge}</div>
              <div className="hash">
                SHA-256
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(bundle.sha256)}
                  className="copy"
                  aria-label="Copy bundle hash"
                >
                  Copy
                </button>
                <code>{bundle.sha256}</code>
              </div>
            </div>
          )}
        </div>
      )}
      <BundleVerifyDialog />
    </div>
  );
}
