/**
 * Vendor Gateway Tests
 *
 * Tests for the BlackRoad OS Vendor API Gateway — the OATH layer that
 * routes all AI/vendor calls through BlackRoad infrastructure and enforces
 * access via Converter API keys and permitted operators.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  VendorGatewayClient,
  validateConverterKey,
  validateOperator,
  PERMITTED_OPERATORS,
  GatewayAuthError,
  UnauthorizedOperatorError,
  createVendorGateway,
} from '../src/integrations/vendor-gateway';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_KEY = 'br-test-converter-key-abc123';

function makeClient(overrides: Partial<ConstructorParameters<typeof VendorGatewayClient>[0]> = {}) {
  return new VendorGatewayClient({
    converterApiKey: VALID_KEY,
    operator: 'blackboxprogramming',
    gatewayBaseUrl: 'http://localhost:10200',
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// PERMITTED_OPERATORS
// ---------------------------------------------------------------------------

describe('PERMITTED_OPERATORS', () => {
  test('contains blackboxprogramming', () => {
    expect(PERMITTED_OPERATORS).toContain('blackboxprogramming');
  });

  test('contains lucidia', () => {
    expect(PERMITTED_OPERATORS).toContain('lucidia');
  });

  test('does not contain openai or anthropic', () => {
    expect(PERMITTED_OPERATORS).not.toContain('openai');
    expect(PERMITTED_OPERATORS).not.toContain('anthropic');
    expect(PERMITTED_OPERATORS).not.toContain('github');
  });
});

// ---------------------------------------------------------------------------
// validateConverterKey
// ---------------------------------------------------------------------------

describe('validateConverterKey', () => {
  beforeEach(() => {
    process.env.BLACKROAD_CONVERTER_API_KEY = VALID_KEY;
  });

  afterEach(() => {
    delete process.env.BLACKROAD_CONVERTER_API_KEY;
  });

  test('returns true for matching key', () => {
    expect(validateConverterKey(VALID_KEY)).toBe(true);
  });

  test('returns false for wrong key', () => {
    expect(validateConverterKey('wrong-key')).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(validateConverterKey(undefined)).toBe(false);
  });

  test('returns false for null', () => {
    expect(validateConverterKey(null)).toBe(false);
  });

  test('returns false when env var not set', () => {
    delete process.env.BLACKROAD_CONVERTER_API_KEY;
    expect(validateConverterKey(VALID_KEY)).toBe(false);
  });

  test('is case-sensitive', () => {
    expect(validateConverterKey(VALID_KEY.toUpperCase())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateOperator
// ---------------------------------------------------------------------------

describe('validateOperator', () => {
  test('accepts blackboxprogramming', () => {
    expect(validateOperator('blackboxprogramming')).toBe(true);
  });

  test('accepts lucidia', () => {
    expect(validateOperator('lucidia')).toBe(true);
  });

  test('rejects openai', () => {
    expect(validateOperator('openai')).toBe(false);
  });

  test('rejects anthropic', () => {
    expect(validateOperator('anthropic')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(validateOperator('')).toBe(false);
  });

  test('rejects undefined', () => {
    expect(validateOperator(undefined)).toBe(false);
  });

  test('rejects null', () => {
    expect(validateOperator(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VendorGatewayClient constructor
// ---------------------------------------------------------------------------

describe('VendorGatewayClient constructor', () => {
  test('creates client with valid config', () => {
    const client = makeClient();
    expect(client).toBeInstanceOf(VendorGatewayClient);
    expect(client.getOperator()).toBe('blackboxprogramming');
  });

  test('defaults operator to blackboxprogramming', () => {
    const client = new VendorGatewayClient({
      converterApiKey: VALID_KEY,
      gatewayBaseUrl: 'http://localhost:10200',
    });
    expect(client.getOperator()).toBe('blackboxprogramming');
  });

  test('accepts lucidia as operator', () => {
    const client = makeClient({ operator: 'lucidia' });
    expect(client.getOperator()).toBe('lucidia');
  });

  test('throws GatewayAuthError when converterApiKey is empty', () => {
    expect(() => new VendorGatewayClient({
      converterApiKey: '',
      gatewayBaseUrl: 'http://localhost:10200',
    })).toThrow(GatewayAuthError);
  });

  test('throws UnauthorizedOperatorError for disallowed operator', () => {
    expect(() => makeClient({ operator: 'openai' as unknown as 'blackboxprogramming' })).toThrow(UnauthorizedOperatorError);
  });

  test('isTailscaleActive returns false when no tailscale host', () => {
    const client = makeClient();
    expect(client.isTailscaleActive()).toBe(false);
  });

  test('isTailscaleActive returns true when tailscale host set', () => {
    const client = makeClient({ tailscaleHost: '100.66.235.47' });
    expect(client.isTailscaleActive()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createVendorGateway factory
// ---------------------------------------------------------------------------

describe('createVendorGateway', () => {
  afterEach(() => {
    delete process.env.BLACKROAD_CONVERTER_API_KEY;
    delete process.env.BLACKROAD_OPERATOR;
    delete process.env.BLACKROAD_GATEWAY_URL;
  });

  test('throws when BLACKROAD_CONVERTER_API_KEY not set', () => {
    delete process.env.BLACKROAD_CONVERTER_API_KEY;
    expect(() => createVendorGateway()).toThrow(GatewayAuthError);
  });

  test('creates client from env vars', () => {
    process.env.BLACKROAD_CONVERTER_API_KEY = VALID_KEY;
    process.env.BLACKROAD_OPERATOR = 'lucidia';
    const client = createVendorGateway();
    expect(client).toBeInstanceOf(VendorGatewayClient);
    expect(client.getOperator()).toBe('lucidia');
  });

  test('defaults operator to blackboxprogramming', () => {
    process.env.BLACKROAD_CONVERTER_API_KEY = VALID_KEY;
    const client = createVendorGateway();
    expect(client.getOperator()).toBe('blackboxprogramming');
  });
});

// ---------------------------------------------------------------------------
// VendorGatewayClient.call (network mocked)
// ---------------------------------------------------------------------------

describe('VendorGatewayClient.call', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test('calls the gateway URL with correct vendor path', async () => {
    const client = makeClient();
    await client.call({ vendor: 'blackboxprogramming', path: '/v1/chat', method: 'POST', body: { message: 'hi' } });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/vendor/blackboxprogramming/v1/chat');
    expect(init.method).toBe('POST');
    expect((init.headers as any)['X-BlackRoad-Converter-Key']).toBe(VALID_KEY);
    expect((init.headers as any)['X-BlackRoad-Operator']).toBe('blackboxprogramming');
  });

  test('returns a well-formed VendorResponse', async () => {
    const client = makeClient();
    const res = await client.call({ vendor: 'blackboxprogramming', path: '/v1/models' });

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.vendor).toBe('blackboxprogramming');
    expect(res.operator).toBe('blackboxprogramming');
    expect(res.routedVia).toBe('gateway');
    expect(res.data).toEqual({ result: 'ok' });
    expect(typeof res.timestamp).toBe('string');
  });

  test('uses tailscale routing when tailscaleHost is set', async () => {
    const client = makeClient({ tailscaleHost: '100.66.235.47' });
    const res = await client.call({ vendor: 'lucidia', path: '/health' });

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('100.66.235.47');
    expect(res.routedVia).toBe('tailscale');
  });
});

// ---------------------------------------------------------------------------
// VendorGatewayClient.health (network mocked)
// ---------------------------------------------------------------------------

describe('VendorGatewayClient.health', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CLOUDFLARE_API_TOKEN;
  });

  test('returns healthy status when gateway responds 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const client = makeClient();
    const status = await client.health();
    expect(status.gateway).toBe('healthy');
    expect(status.operator).toBe('blackboxprogramming');
  });

  test('returns degraded status when gateway responds non-200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('err', { status: 503 }));
    const client = makeClient();
    const status = await client.health();
    expect(status.gateway).toBe('degraded');
  });

  test('returns down status when gateway throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    const client = makeClient();
    const status = await client.health();
    expect(status.gateway).toBe('down');
  });

  test('reflects cloudflare token presence', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    process.env.CLOUDFLARE_API_TOKEN = 'cf-token-xyz';
    const client = makeClient();
    const status = await client.health();
    expect(status.cloudflare).toBe(true);
  });

  test('reports tailscale false when no host configured', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const client = makeClient();
    const status = await client.health();
    expect(status.tailscale).toBe(false);
  });
});
