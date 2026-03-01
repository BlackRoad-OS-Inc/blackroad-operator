/**
 * roadbridge — Roadchain witness module
 *
 * Every transfer (success or failure) is appended to the roadchain ledger
 * as an immutable, hash-chained entry. This provides full auditability
 * of all roadbridge operations.
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

/**
 * @typedef {Object} WitnessEntry
 * @property {string} id - Unique entry ID
 * @property {string} prevHash - Hash of previous entry (chain link)
 * @property {string} hash - SHA-256 hash of this entry
 * @property {number} timestamp - Unix epoch ms
 * @property {string} eventType - Original event type
 * @property {string} artifactType - Classified artifact type
 * @property {string} direction - 'github_to_drive' | 'drive_to_github'
 * @property {string} source - Source identifier (repo, Drive file ID)
 * @property {string} destination - Destination identifier (Drive path, GitHub PR)
 * @property {string} payloadHash - SHA-256 of the event payload
 * @property {'success'|'failure'|'retry'} status
 * @property {string|null} error - Error message if failed
 */

/**
 * Create and store a witness entry in the roadchain ledger.
 * @param {object} kvNamespace - Cloudflare KV binding (ROADCHAIN_LEDGER)
 * @param {object} params
 * @param {string} params.eventType
 * @param {string} params.artifactType
 * @param {string} params.direction
 * @param {string} params.source
 * @param {string} params.destination
 * @param {string} params.payloadHash
 * @param {'success'|'failure'|'retry'} params.status
 * @param {string|null} [params.error]
 * @returns {Promise<WitnessEntry>}
 */
export async function witness(kvNamespace, params) {
  const prevHash = await getLatestHash(kvNamespace);
  const timestamp = Date.now();
  const id = `rb-${timestamp}-${randomHex(4)}`;

  const entry = {
    id,
    prevHash,
    timestamp,
    eventType: params.eventType,
    artifactType: params.artifactType,
    direction: params.direction,
    source: params.source,
    destination: params.destination,
    payloadHash: params.payloadHash,
    status: params.status,
    error: params.error || null,
  };

  entry.hash = await hashEntry(entry);

  // Store the entry by ID
  await kvNamespace.put(`entry:${id}`, JSON.stringify(entry), {
    expirationTtl: 31536000, // 1 year retention
  });

  // Update the latest hash pointer
  await kvNamespace.put('latest_hash', entry.hash);

  // Update the counter
  const countStr = await kvNamespace.get('entry_count');
  const count = (parseInt(countStr, 10) || 0) + 1;
  await kvNamespace.put('entry_count', String(count));

  // Append to the daily index for efficient queries
  const dateKey = `index:${new Date(timestamp).toISOString().split('T')[0]}`;
  const existing = await kvNamespace.get(dateKey);
  const ids = existing ? JSON.parse(existing) : [];
  ids.push(id);
  await kvNamespace.put(dateKey, JSON.stringify(ids), {
    expirationTtl: 31536000,
  });

  return entry;
}

/**
 * Retrieve a witness entry by ID.
 * @param {object} kvNamespace
 * @param {string} id
 * @returns {Promise<WitnessEntry|null>}
 */
export async function getEntry(kvNamespace, id) {
  const raw = await kvNamespace.get(`entry:${id}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Retrieve all witness entries for a given date.
 * @param {object} kvNamespace
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<WitnessEntry[]>}
 */
export async function getEntriesByDate(kvNamespace, date) {
  const indexRaw = await kvNamespace.get(`index:${date}`);
  if (!indexRaw) return [];

  const ids = JSON.parse(indexRaw);
  const entries = [];
  for (const id of ids) {
    const entry = await getEntry(kvNamespace, id);
    if (entry) entries.push(entry);
  }
  return entries;
}

/**
 * Get the total count of witnessed entries.
 * @param {object} kvNamespace
 * @returns {Promise<number>}
 */
export async function getEntryCount(kvNamespace) {
  const countStr = await kvNamespace.get('entry_count');
  return parseInt(countStr, 10) || 0;
}

/**
 * Verify the integrity of a witness entry by recomputing its hash.
 * @param {WitnessEntry} entry
 * @returns {Promise<boolean>}
 */
export async function verifyEntry(entry) {
  const storedHash = entry.hash;
  const recomputed = await hashEntry({ ...entry, hash: undefined });
  return storedHash === recomputed;
}

/**
 * Compute the SHA-256 hash of a payload string.
 * @param {string} payload
 * @returns {Promise<string>}
 */
export async function hashPayload(payload) {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// --- Internal helpers ---

async function getLatestHash(kvNamespace) {
  const hash = await kvNamespace.get('latest_hash');
  return hash || '0000000000000000000000000000000000000000000000000000000000000000';
}

async function hashEntry(entry) {
  const canonical = JSON.stringify({
    prevHash: entry.prevHash,
    timestamp: entry.timestamp,
    eventType: entry.eventType,
    artifactType: entry.artifactType,
    direction: entry.direction,
    source: entry.source,
    destination: entry.destination,
    payloadHash: entry.payloadHash,
    status: entry.status,
    error: entry.error,
  });
  return hashPayload(canonical);
}

function randomHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
