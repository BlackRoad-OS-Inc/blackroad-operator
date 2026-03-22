/* <!-- FILE: /apps/web/app/api/ai/stream/route.ts --> */

export const runtime = 'edge';

const buckets = new Map<string, { count: number; reset: number }>();
const LIMIT = 60;
const WINDOW_MS = 60_000;

const HEALTH_ENDPOINT = process.env.LLM_HEALTH_URL ?? '';
const PRIMARY_PROVIDER_ID = process.env.PRIMARY_LLM_ID ?? 'openai-primary';
const FALLBACK_PROVIDER_ID = process.env.FALLBACK_LLM_ID ?? 'azure-fallback';

interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  authHeader: string;
}

interface ProviderHealthPayload {
  state?: string;
  fallback_ratio?: number;
}

interface ProviderSelection {
  config: ProviderConfig;
  usedFallback: boolean;
  canAttemptFallback: boolean;
  reason: string;
  health: ProviderHealthPayload | null;
}

const providerStateCache = new Map<string, { expires: number; payload: ProviderHealthPayload | null }>();

const primaryProvider: ProviderConfig = {
  id: PRIMARY_PROVIDER_ID,
  name: process.env.PRIMARY_LLM_PROVIDER ?? 'openai',
  baseUrl: process.env.PRIMARY_LLM_BASE_URL ?? 'https://api.openai.com/v1/responses',
  model: process.env.PRIMARY_LLM_MODEL ?? 'gpt-4o-mini',
  apiKey: process.env.PRIMARY_LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
  authHeader: process.env.PRIMARY_LLM_AUTH_HEADER ?? 'Authorization',
};

const fallbackProvider: ProviderConfig = {
  id: FALLBACK_PROVIDER_ID,
  name: process.env.FALLBACK_LLM_PROVIDER ?? 'azure-openai',
  baseUrl:
    process.env.FALLBACK_LLM_BASE_URL ??
    process.env.FALLBACK_CANARY_URL ??
    process.env.PRIMARY_LLM_BASE_URL ??
    'https://api.openai.com/v1/responses',
  model:
    process.env.FALLBACK_LLM_MODEL ??
    process.env.FALLBACK_MODEL ??
    process.env.PRIMARY_LLM_MODEL ??
    'gpt-4o-mini',
  apiKey: process.env.FALLBACK_LLM_API_KEY ?? process.env.FALLBACK_API_KEY ?? '',
  authHeader:
    process.env.FALLBACK_LLM_AUTH_HEADER ??
    process.env.PRIMARY_LLM_AUTH_HEADER ??
    'Authorization',
};

export function rateLimit(key: string, limit: number = LIMIT) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (bucket && now < bucket.reset) {
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  }
  buckets.set(key, { count: 1, reset: now + WINDOW_MS });
  return true;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  tools?: unknown[];
  system?: string;
}

async function fetchProviderHealth(providerId: string): Promise<ProviderHealthPayload | null> {
  if (!HEALTH_ENDPOINT) return null;
  const cached = providerStateCache.get(providerId);
  const now = Date.now();
  if (cached && cached.expires > now) {
    return cached.payload;
  }
  try {
    const response = await fetch(`${HEALTH_ENDPOINT.replace(/\/$/, '')}/providers/${providerId}`, {
      cache: 'no-store',
    });
    const payload = (await response.json().catch(() => null)) as ProviderHealthPayload | null;
    providerStateCache.set(providerId, { expires: now + 30_000, payload });
    return payload;
  } catch (error) {
    providerStateCache.set(providerId, { expires: now + 30_000, payload: null });
    return null;
  }
}

function buildAuthHeader(headerName: string, token: string): string {
  if (!token) return '';
  if (headerName.toLowerCase() === 'authorization' && !token.toLowerCase().startsWith('bearer ')) {
    return `Bearer ${token}`;
  }
  return token;
}

async function callProvider(
  provider: ProviderConfig,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (provider.apiKey) {
    const value = buildAuthHeader(provider.authHeader, provider.apiKey);
    if (value) {
      headers[provider.authHeader] = value;
    }
  }
  headers['X-Prism-Upstream'] = provider.id;
  const payload = { ...body, model: provider.model, stream: true };
  return fetch(provider.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
    cache: 'no-store',
  });
}

function fallbackAvailable(): boolean {
  return Boolean(fallbackProvider.apiKey && fallbackProvider.baseUrl);
}

async function chooseProvider(): Promise<ProviderSelection> {
  const availableFallback = fallbackAvailable();
  const health = await fetchProviderHealth(primaryProvider.id);
  if (!health) {
    return {
      config: primaryProvider,
      usedFallback: false,
      canAttemptFallback: availableFallback,
      reason: 'health_unavailable',
      health: null,
    };
  }
  const state = health.state ?? 'unknown';
  if (state === 'red') {
    if (availableFallback) {
      return {
        config: fallbackProvider,
        usedFallback: true,
        canAttemptFallback: false,
        reason: 'health_red',
        health,
      };
    }
    return {
      config: primaryProvider,
      usedFallback: false,
      canAttemptFallback: false,
      reason: 'health_red_no_fallback',
      health,
    };
  }
  const ratio = typeof health.fallback_ratio === 'number' ? Math.min(Math.max(health.fallback_ratio, 0), 1) : 0;
  if (ratio > 0 && availableFallback) {
    if (Math.random() < ratio) {
      return {
        config: fallbackProvider,
        usedFallback: true,
        canAttemptFallback: false,
        reason: 'half_open',
        health,
      };
    }
  }
  return {
    config: primaryProvider,
    usedFallback: false,
    canAttemptFallback: availableFallback,
    reason: state,
    health,
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!rateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'rate_limit_exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid_json' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages, tools, system } = body || {};
  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: 'messages_required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = {
    messages,
    tools,
    system,
  };

  const selection = await chooseProvider();
  const controller = new AbortController();
  let activeProvider = selection.config;
  let activeController = controller;
  let upstream = await callProvider(activeProvider, payload, controller.signal);

  if ((!upstream.ok || !upstream.body) && selection.canAttemptFallback) {
    const fallbackController = new AbortController();
    const fallbackResponse = await callProvider(fallbackProvider, payload, fallbackController.signal);
    if (fallbackResponse.ok && fallbackResponse.body) {
      activeProvider = fallbackProvider;
      activeController = fallbackController;
      upstream = fallbackResponse;
    } else {
      const errText = await fallbackResponse.text();
      return new Response(errText || fallbackResponse.statusText, {
        status: fallbackResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if ((!upstream.ok || !upstream.body) && selection.usedFallback) {
    const err = await upstream.text();
    return new Response(err || upstream.statusText, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!upstream.body) {
    return new Response(JSON.stringify({ error: 'upstream_stream_missing' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const reader = upstream.body!.getReader();
      const push = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          if (value) controller.enqueue(value);
          push();
        }).catch((err) => controller.error(err));
      };
      push();
    },
    cancel() {
      activeController.abort();
    },
  });

  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  responseHeaders.set('X-Upstream-Provider', activeProvider.id);
  responseHeaders.set('X-Upstream-Reason', selection.reason);
  if (selection.health?.state) {
    responseHeaders.set('X-Upstream-State', selection.health.state);
  }
  return new Response(stream, { headers: responseHeaders });
}

/* Example client usage:
fetch('/api/ai/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
}).then(async (res) => {
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value));
  }
});
*/

