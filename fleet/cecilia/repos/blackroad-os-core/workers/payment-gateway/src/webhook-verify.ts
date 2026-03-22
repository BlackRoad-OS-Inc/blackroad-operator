/**
 * Stripe Webhook Signature Verification for Cloudflare Workers
 *
 * Uses Web Crypto API (crypto.subtle) for HMAC-SHA256 verification.
 * Includes replay attack protection with configurable tolerance.
 */

const DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Parse the Stripe-Signature header into its components.
 * Format: t=<timestamp>,v1=<sig1>,v1=<sig2>,...
 */
function parseSignatureHeader(header: string): { timestamp: number; signatures: string[] } {
  const parts = header.split(',');
  let timestamp = 0;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=', 2);
    if (key === 't') {
      timestamp = parseInt(value, 10);
    } else if (key === 'v1') {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

/**
 * Compute the expected HMAC-SHA256 signature for a Stripe webhook.
 */
async function computeSignature(payload: string, timestamp: number, secret: string): Promise<string> {
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  return hexEncode(signature);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export interface VerifyResult {
  valid: boolean;
  error?: string;
  timestamp?: number;
}

/**
 * Verify a Stripe webhook signature.
 *
 * @param payload    Raw request body string
 * @param sigHeader  Value of the Stripe-Signature header
 * @param secret     Webhook endpoint secret (whsec_...)
 * @param tolerance  Max age in seconds (default 300 = 5 min)
 */
export async function verifyWebhookSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  tolerance: number = DEFAULT_TOLERANCE_SECONDS,
): Promise<VerifyResult> {
  if (!sigHeader) {
    return { valid: false, error: 'Missing Stripe-Signature header' };
  }

  if (!secret) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  const { timestamp, signatures } = parseSignatureHeader(sigHeader);

  if (!timestamp || signatures.length === 0) {
    return { valid: false, error: 'Invalid signature header format' };
  }

  // Replay attack protection
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return {
      valid: false,
      error: `Timestamp outside tolerance (${tolerance}s). Event age: ${Math.abs(now - timestamp)}s`,
      timestamp,
    };
  }

  const expectedSig = await computeSignature(payload, timestamp, secret);

  // Check if any of the provided v1 signatures match
  const matched = signatures.some((sig) => secureCompare(sig, expectedSig));

  if (!matched) {
    return { valid: false, error: 'Signature mismatch', timestamp };
  }

  return { valid: true, timestamp };
}
