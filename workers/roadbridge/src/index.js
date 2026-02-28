/**
 * roadbridge — BlackRoad-Native GitHub ↔ Drive Sync Engine
 *
 * Cloudflare Worker deployed at roadbridge.blackroad.io
 *
 * Layer 1: Event ingestion — receive webhooks, validate HMAC, enqueue
 * Layer 2: Classification — determine artifact type, route, transformation
 * Layer 3: Execution — transfer files, witness to roadchain
 *
 * Endpoints:
 *   POST /webhook/github       — GitHub webhook receiver
 *   POST /webhook/drive        — Drive push notification receiver
 *   GET  /status               — Health check + stats
 *   GET  /ledger               — Recent roadchain witness entries
 *   GET  /ledger/:date         — Witness entries for a specific date
 *   GET  /ledger/entry/:id     — Single witness entry by ID
 *   GET  /ledger/verify/:id    — Verify integrity of a witness entry
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

import { verifyGitHubSignature, verifyDriveChannelToken } from './hmac.js';
import { classifyGitHubEvent, classifyDriveEvent, shouldExecuteRoute } from './classifier.js';
import { executeRoute } from './executor.js';
import { witness, hashPayload, getEntry, getEntriesByDate, getEntryCount, verifyEntry } from './witness.js';

// ─── CORS ────────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Hub-Signature-256,X-GitHub-Event,X-GitHub-Delivery,X-Goog-Channel-ID,X-Goog-Channel-Token,X-Goog-Resource-State',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── GitHub webhook handler ──────────────────────────────────────────────────
async function handleGitHubWebhook(request, env) {
  const signature = request.headers.get('X-Hub-Signature-256');
  const eventType = request.headers.get('X-GitHub-Event');
  const deliveryId = request.headers.get('X-GitHub-Delivery');

  if (!signature || !eventType) {
    return json({ error: 'Missing signature or event type header' }, 400);
  }

  // Read body as text for HMAC verification
  const body = await request.text();

  // Layer 1: HMAC validation
  const secret = env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return json({ error: 'Webhook secret not configured' }, 500);
  }

  const valid = await verifyGitHubSignature(secret, body, signature);
  if (!valid) {
    return json({ error: 'Invalid webhook signature' }, 401);
  }

  // Parse payload
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  // Handle ping event (GitHub sends this on webhook registration)
  if (eventType === 'ping') {
    return json({
      ok: true,
      event: 'ping',
      zen: payload.zen,
      hook_id: payload.hook_id,
    });
  }

  // Layer 2: Classify the event
  const route = classifyGitHubEvent(eventType, payload);

  // Check if route should be executed
  if (!shouldExecuteRoute(route, null)) {
    return json({
      ok: true,
      event: eventType,
      delivery: deliveryId,
      artifactType: route.artifactType,
      action: 'skipped',
      reason: 'Route not configured for execution',
    });
  }

  // Layer 3: Execute the route
  const result = await executeRoute(env, route, payload, eventType);

  return json({
    ok: result.ok,
    event: eventType,
    delivery: deliveryId,
    artifactType: route.artifactType,
    direction: route.direction,
    transformation: route.transformation,
    classifier: route.classifierSource,
    detail: result.detail,
    witness: result.witnessEntry
      ? { id: result.witnessEntry.id, hash: result.witnessEntry.hash }
      : null,
  });
}

// ─── Drive push notification handler ─────────────────────────────────────────
async function handleDriveWebhook(request, env) {
  const channelId = request.headers.get('X-Goog-Channel-ID');
  const channelToken = request.headers.get('X-Goog-Channel-Token');
  const resourceState = request.headers.get('X-Goog-Resource-State');
  const resourceId = request.headers.get('X-Goog-Resource-ID');

  // Validate channel token
  const expectedToken = env.DRIVE_CHANNEL_TOKEN;
  if (!expectedToken) {
    return json({ error: 'Drive channel token not configured' }, 500);
  }

  if (!verifyDriveChannelToken(expectedToken, channelToken)) {
    return json({ error: 'Invalid channel token' }, 401);
  }

  // sync notification — just acknowledge
  if (resourceState === 'sync') {
    return json({ ok: true, event: 'sync', channelId });
  }

  // removal/trash notifications — acknowledge but do not process as modifications
  if (resourceState === 'remove' || resourceState === 'trash') {
    return json({
      ok: true,
      event: `drive.${resourceState}`,
      action: 'ignored',
      reason: 'resource removed or trashed',
      channelId,
      resourceId,
    });
  }
  // Map Drive resource state to our change type
  const changeType = resourceState === 'add' ? 'created' : 'modified';

  // Build minimal file metadata from headers
  const fileMetadata = {
    id: resourceId,
    mimeType: request.headers.get('X-Goog-Resource-URI')?.includes('document')
      ? 'application/vnd.google-apps.document'
      : 'unknown',
    name: '', // Will be enriched by executor
    parents: [],
  };

  // Try to get file metadata from request body (if present)
  try {
    const body = await request.json();
    if (body.name) fileMetadata.name = body.name;
    if (body.mimeType) fileMetadata.mimeType = body.mimeType;
    if (body.parents) fileMetadata.parents = body.parents;
    if (body.id) fileMetadata.id = body.id;
  } catch {
    // No body — use header-derived metadata
  }

  // Layer 2: Classify
  const route = classifyDriveEvent(changeType, fileMetadata);

  if (!shouldExecuteRoute(route, null)) {
    return json({
      ok: true,
      event: `drive.${changeType}`,
      artifactType: route.artifactType,
      action: 'skipped',
    });
  }

  // Layer 3: Execute
  const payload = { ...fileMetadata, resourceState, channelId, fileId: resourceId };
  const result = await executeRoute(env, route, payload, `drive.${changeType}`);

  return json({
    ok: result.ok,
    event: `drive.${changeType}`,
    artifactType: route.artifactType,
    direction: route.direction,
    detail: result.detail,
    witness: result.witnessEntry
      ? { id: result.witnessEntry.id, hash: result.witnessEntry.hash }
      : null,
  });
}

// ─── Status endpoint ─────────────────────────────────────────────────────────
async function handleStatus(env) {
  const entryCount = env.ROADCHAIN_LEDGER
    ? await getEntryCount(env.ROADCHAIN_LEDGER)
    : 0;

  return json({
    ok: true,
    service: 'roadbridge',
    version: '1.0.0',
    description: 'BlackRoad-Native GitHub ↔ Drive Sync Engine',
    layers: {
      ingestion: 'Cloudflare Worker (edge)',
      classifier: 'Rule-based (olympia LLM fallback)',
      executor: 'GitHub App + Drive WIF',
    },
    witness: {
      ledger: 'roadchain',
      entries: entryCount,
    },
    endpoints: [
      'POST /webhook/github',
      'POST /webhook/drive',
      'GET  /status',
      'GET  /ledger',
      'GET  /ledger/:date',
      'GET  /ledger/entry/:id',
      'GET  /ledger/verify/:id',
    ],
    configured: {
      github_webhook: !!env.GITHUB_WEBHOOK_SECRET,
      github_app: !!env.GITHUB_APP_ID,
      drive_channel: !!env.DRIVE_CHANNEL_TOKEN,
    },
    ts: new Date().toISOString(),
  });
}

// ─── Ledger endpoints ────────────────────────────────────────────────────────
async function handleLedger(env) {
  const today = new Date().toISOString().split('T')[0];
  const entries = env.ROADCHAIN_LEDGER
    ? await getEntriesByDate(env.ROADCHAIN_LEDGER, today)
    : [];

  return json({
    ok: true,
    date: today,
    count: entries.length,
    entries: entries.map(summarizeEntry),
  });
}

async function handleLedgerByDate(env, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  const entries = env.ROADCHAIN_LEDGER
    ? await getEntriesByDate(env.ROADCHAIN_LEDGER, date)
    : [];

  return json({
    ok: true,
    date,
    count: entries.length,
    entries: entries.map(summarizeEntry),
  });
}

async function handleLedgerEntry(env, id) {
  if (!env.ROADCHAIN_LEDGER) {
    return json({ error: 'Ledger not configured' }, 500);
  }

  const entry = await getEntry(env.ROADCHAIN_LEDGER, id);
  if (!entry) {
    return json({ error: `Entry not found: ${id}` }, 404);
  }

  return json({ ok: true, entry });
}

async function handleLedgerVerify(env, id) {
  if (!env.ROADCHAIN_LEDGER) {
    return json({ error: 'Ledger not configured' }, 500);
  }

  const entry = await getEntry(env.ROADCHAIN_LEDGER, id);
  if (!entry) {
    return json({ error: `Entry not found: ${id}` }, 404);
  }

  const valid = await verifyEntry(entry);
  return json({
    ok: true,
    id: entry.id,
    hash: entry.hash,
    prevHash: entry.prevHash,
    integrity: valid ? 'verified' : 'CORRUPTED',
    verified: valid,
  });
}

function summarizeEntry(entry) {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    eventType: entry.eventType,
    artifactType: entry.artifactType,
    direction: entry.direction,
    status: entry.status,
    hash: entry.hash?.slice(0, 12) + '...',
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Webhook endpoints
    if (method === 'POST' && path === '/webhook/github') {
      return handleGitHubWebhook(request, env);
    }
    if (method === 'POST' && path === '/webhook/drive') {
      return handleDriveWebhook(request, env);
    }

    // Status
    if (method === 'GET' && path === '/status') {
      return handleStatus(env);
    }

    // Ledger endpoints
    if (method === 'GET' && path === '/ledger') {
      return handleLedger(env);
    }

    // /ledger/entry/:id
    const entryMatch = path.match(/^\/ledger\/entry\/(.+)$/);
    if (method === 'GET' && entryMatch) {
      return handleLedgerEntry(env, entryMatch[1]);
    }

    // /ledger/verify/:id
    const verifyMatch = path.match(/^\/ledger\/verify\/(.+)$/);
    if (method === 'GET' && verifyMatch) {
      return handleLedgerVerify(env, verifyMatch[1]);
    }

    // /ledger/:date
    const dateMatch = path.match(/^\/ledger\/(\d{4}-\d{2}-\d{2})$/);
    if (method === 'GET' && dateMatch) {
      return handleLedgerByDate(env, dateMatch[1]);
    }

    // Not found
    return json(
      {
        error: `Not found: ${method} ${path}`,
        service: 'roadbridge',
        hint: 'Try GET /status for available endpoints',
      },
      404,
    );
  },
};
