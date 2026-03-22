#!/usr/bin/env node
// Auto-pin CIDs announced on Truth Garden pubsub.
// Env: TRUTH_TOPIC (default truth.garden/v1/announce), IPFS_API (default http://127.0.0.1:5001)
//      ALLOW_DIDS (comma-separated did:key list; if unset -> allow all)
//      TRUTH_PIN_CONCURRENCY (default 2) - controls concurrent pin operations
const { create } = require('ipfs-http-client');
const canonicalize = require('json-canonicalize');
const crypto = require('crypto');
const { TextDecoder } = require('util');

const TOPIC = process.env.TRUTH_TOPIC || 'truth.garden/v1/announce';
const API = process.env.IPFS_API || 'http://127.0.0.1:5001';
const ALLOW = (process.env.ALLOW_DIDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const PIN_CONCURRENCY = Number(process.env.TRUTH_PIN_CONCURRENCY || 2) || 1;
const ipfs = create({ url: API });
const decoder = new TextDecoder();
const DID_PREFIX = 'did:key:';
const didCache = new Map();

function createQueue(limit) {
  let active = 0;
  const pending = [];
  const run = () => {
    if (active >= limit) return;
    const next = pending.shift();
    if (!next) return;
    active++;
    Promise.resolve()
      .then(next.fn)
      .then(next.resolve, next.reject)
      .finally(() => {
        active--;
        run();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      pending.push({ fn, resolve, reject });
      run();
    });
}

const schedulePin = createQueue(PIN_CONCURRENCY);

function canonicalAnnouncement(o) {
  if (!o?.cid || !o?.did || !o?.ts) return null;
  return { cid: o.cid, did: o.did, type: o.type || 'Truth', ts: o.ts };
}

function getPublicKeyForDid(did) {
  if (!did || !did.startsWith(DID_PREFIX)) return null;
  if (didCache.has(did)) return didCache.get(did);
  try {
    const key = crypto.createPublicKey({
      key: Buffer.from(did.slice(DID_PREFIX.length), 'base64'),
      format: 'der',
      type: 'spki',
    });
    didCache.set(did, key);
    return key;
  } catch {
    didCache.set(did, null);
    return null;
  }
}

function verifyAnnouncement(o) {
  try {
    const payload = canonicalAnnouncement(o);
    if (!payload || !o?.sig) return false;
    const pub = getPublicKeyForDid(o.did);
    if (!pub) return false;
    return crypto.verify(
      null,
      Buffer.from(canonicalize(payload)),
      pub,
      Buffer.from(o.sig, 'base64')
    );
  } catch {
    return false;
  }
}

(async () => {
  console.log('[subpin] connecting', API, 'topic', TOPIC, 'allow', ALLOW.length ? ALLOW : 'ALL');
  await ipfs.pubsub.subscribe(TOPIC, async (msg) => {
    try {
      const text = decoder.decode(msg.data);
      const o = JSON.parse(text);
      if (!o?.cid) return;
      if (!verifyAnnouncement(o)) {
        console.warn('[subpin] ignore unverified cid', o.cid, o.did || '?');
        return;
      }
      if (ALLOW.length && (!o.did || !ALLOW.includes(o.did))) return;
      console.log('[subpin] pin', o.cid, o.did || '?');
      schedulePin(() =>
        ipfs.pin.add(o.cid).catch((err) => {
          console.error('[subpin] pin FAILED', o.cid, o.did || '?', err?.message || err);
          throw err;
        })
      ).catch(() => {});
    } catch (e) {
      /* ignore */
    }
  });
})();
