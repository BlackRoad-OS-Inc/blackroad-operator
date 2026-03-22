import { useCallback, useEffect, useMemo, useState } from 'react';

const QS_STORAGE_KEY = 'policy.quantumSecure';

type EvaluationPayload = {
  inputs: Record<string, unknown>;
  prompt: string;
  model: string;
  bundle: boolean;
  policy: string;
  policyVersion: string;
};

type EvaluationResult = {
  ok: boolean;
  decision?: {
    compliant: boolean;
    riskScore: number;
    reasons: string[];
    hits: string[];
  };
  bundle?: {
    url: string;
    sha256: string;
    signatures: Record<string, any>;
  };
};

function loadQuantumSecureDefault() {
  if (typeof window === 'undefined') return false;
  const raw = window.sessionStorage.getItem(QS_STORAGE_KEY);
  return raw === 'true';
}

export function usePolicyEvaluation() {
  const [quantumSecure, setQuantumSecureState] = useState(loadQuantumSecureDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(QS_STORAGE_KEY, quantumSecure ? 'true' : 'false');
    }
  }, [quantumSecure]);

  const headers = useMemo(() => {
    return quantumSecure ? { 'X-PQC': 'on' } : { 'X-PQC': 'off' };
  }, [quantumSecure]);

  const evaluate = useCallback(async (payload: EvaluationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/policy/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const json = (await res.json()) as EvaluationResult;
      setResult(json);
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const setQuantumSecure = useCallback((value: boolean) => {
    setQuantumSecureState(value);
  }, []);

  return {
    quantumSecure,
    setQuantumSecure,
    evaluate,
    loading,
    error,
    result
  };
}
