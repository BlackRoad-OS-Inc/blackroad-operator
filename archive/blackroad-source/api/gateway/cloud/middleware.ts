/**
 * BlackRoad Cloud Gateway — Middleware utilities
 */

export interface RequestContext {
  agentId?: string;
  sessionId?: string;
  requestId: string;
  startTime: number;
}

/** Generate a random request ID */
export function newRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Rate limiting using KV store */
export async function rateLimit(
  request: Request,
  kv: KVNamespace,
  maxRequests = 60,
  windowSeconds = 60,
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = `rate:${ip}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;

  const current = parseInt((await kv.get(key)) || '0');

  if (current >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: maxRequests - current - 1 };
}

/** CORS headers */
export function corsHeaders(origin: string, allowed: string[]): HeadersInit {
  const isAllowed = allowed.includes('*') || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Agent-ID',
    'Access-Control-Max-Age': '86400',
  };
}

/** Parse Bearer token from Authorization header */
export function parseBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/** Standard error response */
export function errorResponse(
  message: string,
  status = 400,
  requestId?: string,
): Response {
  return Response.json(
    { error: message, request_id: requestId },
    { status, headers: { 'X-Request-ID': requestId || '' } },
  );
}

/** Standard success response */
export function okResponse(data: unknown, requestId?: string): Response {
  return Response.json(
    { data, request_id: requestId },
    { headers: { 'X-Request-ID': requestId || '' } },
  );
}

/** Log a request to KV (for analytics) */
export async function logRequest(
  ctx: RequestContext,
  method: string,
  path: string,
  status: number,
  kv: KVNamespace,
): Promise<void> {
  const entry = {
    request_id: ctx.requestId,
    method,
    path,
    status,
    duration_ms: Date.now() - ctx.startTime,
    agent_id: ctx.agentId,
    session_id: ctx.sessionId,
    timestamp: new Date().toISOString(),
  };

  // Store in KV with 24h TTL for analytics
  await kv.put(`log:${ctx.requestId}`, JSON.stringify(entry), {
    expirationTtl: 86400,
  });
}
