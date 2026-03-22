import { useCallback, useState, type ChangeEvent } from 'react';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',').pop() || '';
        resolve(base64);
      } else {
        reject(new Error('unexpected_result'));
      }
    };
    reader.readAsDataURL(file);
  });
}

type VerifyState = {
  valid: boolean;
  reasons: string[];
  hash: string;
  manifest: Record<string, unknown>;
} | null;

export default function BundleVerifyDialog() {
  const [bundleUrl, setBundleUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyState>(null);

  const onFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  }, []);

  const verify = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body: Record<string, unknown> = {};
      if (file) {
        body.bundleBase64 = await fileToBase64(file);
      } else if (bundleUrl) {
        body.bundleUrl = bundleUrl;
      } else {
        throw new Error('bundle required');
      }
      const res = await fetch('/api/attest/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error(`verify failed (${res.status})`);
      }
      const json = await res.json();
      setResult(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [file, bundleUrl]);

  return (
    <div className="bundle-verify">
      <h4>Verify Bundle</h4>
      <p className="hint">Upload a `.tgz` bundle or paste a URL to confirm its signature.</p>
      <div className="verify-inputs">
        <input type="file" accept="application/gzip" onChange={onFileChange} />
        <span>or</span>
        <input
          type="url"
          placeholder="https://example.com/bundle.tgz"
          value={bundleUrl}
          onChange={event => setBundleUrl(event.target.value)}
        />
      </div>
      <button onClick={verify} disabled={loading}>
        {loading ? 'Verifying…' : 'Verify bundle'}
      </button>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
          <div className="status">{result.valid ? '✔ Valid' : '✖ Invalid'}</div>
          <div className="hash">SHA-256: {result.hash}</div>
          {!result.valid && result.reasons?.length > 0 && (
            <ul>
              {result.reasons.map(reason => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
