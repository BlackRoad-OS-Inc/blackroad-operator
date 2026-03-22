import { Request, Response, NextFunction } from 'express';
import { createPublicKey } from 'crypto';
import jwt from 'jsonwebtoken';

const CLERK_ISSUER = process.env.CLERK_ISSUER_URL || '';
const CLERK_JWKS_URL = CLERK_ISSUER ? `${CLERK_ISSUER}/.well-known/jwks.json` : '';

interface JwkEntry { kid?: string; kty: string; n?: string; e?: string; x?: string; y?: string; crv?: string; use?: string; alg?: string; }
interface JwksCache { keys: JwkEntry[]; fetchedAt: number; }

let jwksCache: JwksCache | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchJwks(): Promise<JwkEntry[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) return jwksCache.keys;
  const res = await fetch(CLERK_JWKS_URL);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const data = await res.json() as { keys: JwkEntry[] };
  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

function jwkToPem(jwk: JwkEntry): string {
  return createPublicKey({ key: jwk as Parameters<typeof createPublicKey>[0]['key'], format: 'jwk' }).export({ type: 'spki', format: 'pem' }) as string;
}

/**
 * Validates a Clerk JWT from the Authorization header (Bearer <token>).
 * Attaches `req.clerkUser` when valid.
 * Passes through without error when CLERK_ISSUER_URL is not configured
 * (allows gradual rollout / local dev without Clerk).
 */
export function clerkAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!CLERK_JWKS_URL) return next(); // Clerk not configured — skip

    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return next();
    const token = auth.slice(7);

    try {
      // Parse JWT header to find the correct signing key (kid)
      const parts = token.split('.');
      if (parts.length !== 3) return res.status(401).json({ error: 'invalid_clerk_token' });

      let header: { kid?: string; alg?: string };
      try {
        header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      } catch {
        return res.status(401).json({ error: 'invalid_clerk_token' });
      }

      const keys = await fetchJwks();
      // When kid is present, match exactly. Without kid, fall back to first key.
      const signingKey = header.kid
        ? keys.find(k => k.kid === header.kid)
        : keys[0];
      if (!signingKey) return res.status(401).json({ error: 'clerk_key_not_found' });

      const pem = jwkToPem(signingKey);
      const payload = jwt.verify(token, pem, { issuer: CLERK_ISSUER, algorithms: ['RS256', 'ES256'] });
      (req as any).clerkUser = payload;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_MODE === 'true') {
        console.warn('[clerk] token verification failed:', err instanceof Error ? err.message : err);
      }
      return res.status(401).json({ error: 'invalid_clerk_token' });
    }
    next();
  };
}

/**
 * Requires a valid Clerk session. Use after clerkAuth().
 */
export function requireClerkAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).clerkUser) return res.status(401).json({ error: 'clerk_auth_required' });
    next();
  };
}
