import fs from 'fs';
import { randomUUID } from 'crypto';
import express from 'express';

const PORT = process.env.PORT || 4010;
const PRIMARY_URL = process.env.PRIMARY_URL || 'http://llm.prism.svc.cluster.local:8000/v1/chat';
const FALLBACK_URL = process.env.FALLBACK_URL || 'http://ollama-bridge.prism.svc.cluster.local:4010/api/chat';
const PRIMARY_TOKEN = process.env.PRIMARY_TOKEN;
const FALLBACK_TOKEN = process.env.FALLBACK_TOKEN;
const HEALTH_ENDPOINT = process.env.HEALTH_ENDPOINT || 'http://llm-healthwatch.prism.svc.cluster.local:8080/healthz';
const HEALTH_INTERVAL_MS = Number(process.env.HEALTH_INTERVAL_MS ?? 15000);
const HALF_OPEN_RATIO = Number(process.env.HALF_OPEN_RATIO ?? 0.2);
const HALF_OPEN_SUCCESS_THRESHOLD = Number(process.env.HALF_OPEN_SUCCESS_THRESHOLD ?? 5);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS ?? 15000);
const INCIDENT_LOG_PATH = process.env.INCIDENT_LOG_PATH || '/var/log/llm-incidents.jsonl';

const app = express();
app.use(express.json({ limit: '1mb' }));

const STATE = {
  status: 'closed',
  openedAt: null,
  incidentId: null,
  consecutivePrimarySuccesses: 0,
};

function appendIncident(entry) {
  const line = `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`;
  try {
    fs.appendFileSync(INCIDENT_LOG_PATH, line, { encoding: 'utf8' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[llm-gateway] failed to append incident log', err);
  }
}

async function refreshHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(HEALTH_ENDPOINT, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      handleHealthState('red', { reason: `http_${response.status}` });
      return;
    }
    const body = await response.json();
    handleHealthState(body.state, body);
  } catch (error) {
    handleHealthState('red', { reason: 'health_fetch_failed', error: String(error?.message || error) });
  }
}

function handleHealthState(newState, body = {}) {
  const previous = STATE.status;
  if (newState === 'red') {
    if (previous !== 'open') {
      STATE.status = 'open';
      STATE.openedAt = Date.now();
      STATE.consecutivePrimarySuccesses = 0;
      STATE.incidentId = randomUUID();
      appendIncident({
        incident_id: STATE.incidentId,
        event: 'opened',
        reason: body.reason ?? 'red',
        metrics: body.metrics ?? null,
      });
    }
    return;
  }
  if (newState === 'amber') {
    if (previous === 'open') {
      STATE.status = 'half-open';
      STATE.consecutivePrimarySuccesses = 0;
      appendIncident({
        incident_id: STATE.incidentId,
        event: 'half_open',
        reason: body.reason ?? 'amber',
        metrics: body.metrics ?? null,
      });
    }
    return;
  }
  if (newState === 'green' && previous !== 'closed') {
    appendIncident({
      incident_id: STATE.incidentId,
      event: 'closed',
      duration_ms: STATE.openedAt ? Date.now() - STATE.openedAt : null,
      metrics: body.metrics ?? null,
    });
    STATE.status = 'closed';
    STATE.openedAt = null;
    STATE.incidentId = null;
    STATE.consecutivePrimarySuccesses = 0;
  }
}

async function forwardRequest(targetUrl, token, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function chooseTarget() {
  if (STATE.status === 'open') return { url: FALLBACK_URL, token: FALLBACK_TOKEN, label: 'fallback' };
  if (STATE.status === 'half-open') {
    if (Math.random() < HALF_OPEN_RATIO) {
      return { url: PRIMARY_URL, token: PRIMARY_TOKEN, label: 'primary' };
    }
    return { url: FALLBACK_URL, token: FALLBACK_TOKEN, label: 'fallback' };
  }
  return { url: PRIMARY_URL, token: PRIMARY_TOKEN, label: 'primary' };
}

async function handlePrimaryResult(ok) {
  if (STATE.status === 'half-open' || STATE.status === 'open') {
    if (ok) {
      STATE.consecutivePrimarySuccesses += 1;
      if (STATE.consecutivePrimarySuccesses >= HALF_OPEN_SUCCESS_THRESHOLD) {
        handleHealthState('green', { reason: 'half_open_recovery' });
      }
    } else {
      STATE.consecutivePrimarySuccesses = 0;
      STATE.status = 'open';
      if (!STATE.incidentId) {
        STATE.incidentId = randomUUID();
      }
      appendIncident({
        incident_id: STATE.incidentId,
        event: 'reopened',
        reason: 'half_open_failure',
      });
    }
  } else if (!ok) {
    handleHealthState('red', { reason: 'primary_request_failed' });
  }
}

app.post('/v1/chat', async (req, res) => {
  const target = chooseTarget();
  try {
    const response = await forwardRequest(target.url, target.token, req.body ?? {});
    const text = await response.text();
    const ok = response.ok;
    if (target.label === 'primary') {
      await handlePrimaryResult(ok);
    }
    const headers = Object.fromEntries(response.headers.entries());
    if (headers['content-type']) {
      res.set('Content-Type', headers['content-type']);
    }
    res.status(response.status).send(text);
  } catch (error) {
    if (target.label === 'primary') {
      await handlePrimaryResult(false);
      try {
        const fallbackResponse = await forwardRequest(FALLBACK_URL, FALLBACK_TOKEN, req.body ?? {});
        res.status(fallbackResponse.status).send(await fallbackResponse.text());
        return;
      } catch (fallbackError) {
        res.status(503).json({ error: 'llm_unavailable', detail: String(fallbackError?.message || fallbackError) });
        return;
      }
    }
    res.status(503).json({ error: 'llm_unavailable', detail: String(error?.message || error) });
  }
});

app.get('/healthz', (_req, res) => {
  res.json({
    status: STATE.status,
    opened_at: STATE.openedAt ? new Date(STATE.openedAt).toISOString() : null,
    half_open_ratio: STATE.status === 'half-open' ? HALF_OPEN_RATIO : 0,
    incident_id: STATE.incidentId,
  });
});

refreshHealth();
setInterval(refreshHealth, HEALTH_INTERVAL_MS).unref();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[llm-gateway] listening on :${PORT}`);
});
