import React, { useEffect, useState } from 'react';
import KeyTable from './components/KeyTable';
import WebhookTable from './components/WebhookTable';
import Audit from './pages/Audit';
import Ops from './pages/ops';

const showOps = import.meta.env.MODE !== 'production';

export default function App(): JSX.Element {
  const [keys, setKeys] = useState<any[]>([]);
  const [hooks, setHooks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [keysResp, hooksResp] = await Promise.all([
          fetch('/api/admin/keys/list'),
          fetch('/api/admin/webhooks/list')
        ]);
        const keysJson = await keysResp.json();
        const hooksJson = await hooksResp.json();
        setKeys(keysJson.keys || []);
        setHooks(hooksJson);
      } catch (err) {
        console.error('failed to load backoffice data', err);
      }
    };
    load();
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>BlackRoad Backoffice</h1>
      <nav style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
        <a href="#audit" onClick={(event) => {
          event.preventDefault();
          document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          Audit
        </a>
        {showOps && (
          <a href="#ops" onClick={(event) => {
            event.preventDefault();
            document.getElementById('ops')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Ops
          </a>
        )}
      </nav>
      <h2>API Keys</h2>
      <KeyTable rows={keys} />
      <h2>Webhooks</h2>
      <WebhookTable rows={hooks} />
      <section id="audit" style={{ marginTop: 24 }}>
        <Audit />
      </section>
      {showOps && (
        <section id="ops" style={{ marginTop: 24 }}>
          <Ops />
        </section>
      )}
    </div>
  );
}
