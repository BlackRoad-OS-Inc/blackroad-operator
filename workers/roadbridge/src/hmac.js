/**
 * roadbridge — HMAC-SHA256 utilities for webhook validation
 *
 * Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 */

/**
 * Verify a GitHub webhook HMAC-SHA256 signature.
 * @param {string} secret - Webhook secret (plain text)
 * @param {string} payload - Raw request body
 * @param {string} signature - Value of X-Hub-Signature-256 header (sha256=...)
 * @returns {Promise<boolean>}
 */
export async function verifyGitHubSignature(secret, payload, signature) {
  if (!signature || !signature.startsWith('sha256=')) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );

  const expected =
    'sha256=' +
    Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return timingSafeEqual(expected, signature);
}

/**
 * Verify a Drive push notification channel token.
 * @param {string} expected - Stored channel token
 * @param {string} received - Token from X-Goog-Channel-Token header
 * @returns {boolean}
 */
export function verifyDriveChannelToken(expected, received) {
  if (!expected || !received) return false;
  return timingSafeEqual(expected, received);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
