/**
 * BlackRoad OS Vendor API Gateway
 *
 * © 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This module is the "OATH" layer for BlackRoad OS:
 * - All AI vendor API calls are proxied through BlackRoad infrastructure
 * - Only @blackboxprogramming and @lucidia operators are permitted
 * - Direct access to OpenAI / Anthropic / GitHub APIs is blocked at this layer
 * - Every request is identity-checked via a Converter API key
 *
 * Traffic model:
 *   Client → BlackRoad Gateway → Tailscale Mesh → Vendor API
 *   (No direct client-to-vendor path)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VendorId =
  | 'blackboxprogramming' // primary AI backend (required)
  | 'lucidia'             // secondary / edge backend
  | 'stripe'              // payment processing
  | 'cloudflare'          // CDN / tunnel
  | 'railway';            // deployment

/** Operators allowed to make vendor-routed calls */
export const PERMITTED_OPERATORS = ['blackboxprogramming', 'lucidia'] as const;
export type PermittedOperator = (typeof PERMITTED_OPERATORS)[number];

export interface VendorGatewayConfig {
  /**
   * Converter API key issued to the caller. Required for all access.
   * Set via BLACKROAD_CONVERTER_API_KEY environment variable.
   */
  converterApiKey: string;

  /**
   * Operator identity. Must be one of PERMITTED_OPERATORS.
   * Defaults to 'blackboxprogramming'.
   */
  operator?: PermittedOperator;

  /**
   * Base URL of the BlackRoad gateway / Tailscale proxy endpoint.
   * Traffic is routed here instead of hitting vendor APIs directly.
   * Defaults to BLACKROAD_GATEWAY_URL env var or http://localhost:10200
   */
  gatewayBaseUrl?: string;

  /**
   * Optional Tailscale mesh hostname for direct mesh routing.
   * When set, traffic is sent to this host instead of gatewayBaseUrl.
   */
  tailscaleHost?: string;
}

export interface VendorRequest {
  vendor: VendorId;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export interface VendorResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  vendor: VendorId;
  operator: PermittedOperator;
  routedVia: 'gateway' | 'tailscale';
  timestamp: string;
}

export interface GatewayHealthStatus {
  gateway: 'healthy' | 'degraded' | 'down';
  operator: PermittedOperator;
  tailscale: boolean;
  cloudflare: boolean;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class GatewayAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GatewayAuthError';
  }
}

export class UnauthorizedOperatorError extends Error {
  constructor(operator: string) {
    super(
      `Operator '${operator}' is not authorized. ` +
        `Only ${PERMITTED_OPERATORS.join(', ')} may route through BlackRoad Gateway.`
    );
    this.name = 'UnauthorizedOperatorError';
  }
}

export class GatewayUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GatewayUnavailableError';
  }
}

// ---------------------------------------------------------------------------
// VendorGatewayClient
// ---------------------------------------------------------------------------

/**
 * Routes all AI/vendor API calls through BlackRoad infrastructure.
 *
 * Usage:
 *   const gw = createVendorGateway();
 *   const res = await gw.call({ vendor: 'blackboxprogramming', path: '/v1/chat', method: 'POST', body: {...} });
 */
export class VendorGatewayClient {
  private readonly converterApiKey: string;
  private readonly operator: PermittedOperator;
  private readonly gatewayBaseUrl: string;
  private readonly tailscaleHost?: string;

  constructor(config: VendorGatewayConfig) {
    if (!config.converterApiKey) {
      throw new GatewayAuthError(
        'A Converter API key is required to access BlackRoad OS. ' +
          'Set BLACKROAD_CONVERTER_API_KEY or pass converterApiKey in config.'
      );
    }

    const operator = config.operator ?? 'blackboxprogramming';
    if (!(PERMITTED_OPERATORS as readonly string[]).includes(operator)) {
      throw new UnauthorizedOperatorError(operator);
    }

    this.converterApiKey = config.converterApiKey;
    this.operator = operator as PermittedOperator;
    this.gatewayBaseUrl =
      config.gatewayBaseUrl ||
      process.env.BLACKROAD_GATEWAY_URL ||
      'http://localhost:10200';
    this.tailscaleHost = config.tailscaleHost || process.env.BLACKROAD_TAILSCALE_HOST;
  }

  /**
   * Route a vendor API call through BlackRoad infrastructure.
   */
  async call<T = unknown>(req: VendorRequest): Promise<VendorResponse<T>> {
    const routedVia = this.tailscaleHost ? 'tailscale' : 'gateway';
    const baseUrl = this.tailscaleHost
      ? `http://${this.tailscaleHost}`
      : this.gatewayBaseUrl;

    const url = `${baseUrl}/vendor/${req.vendor}${req.path}`;

    const response = await fetch(url, {
      method: req.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-BlackRoad-Converter-Key': this.converterApiKey,
        'X-BlackRoad-Operator': this.operator,
        ...req.headers,
      },
      body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
    });

    let data: T;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = (await response.json()) as T;
    } else {
      data = (await response.text()) as unknown as T;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      vendor: req.vendor,
      operator: this.operator,
      routedVia,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health-check the BlackRoad gateway and mesh.
   */
  async health(): Promise<GatewayHealthStatus> {
    try {
      const url = `${this.gatewayBaseUrl}/health`;
      const response = await fetch(url, {
        headers: {
          'X-BlackRoad-Converter-Key': this.converterApiKey,
          'X-BlackRoad-Operator': this.operator,
        },
      });

      const gatewayOk = response.ok;

      return {
        gateway: gatewayOk ? 'healthy' : 'degraded',
        operator: this.operator,
        tailscale: !!this.tailscaleHost,
        cloudflare: !!process.env.CLOUDFLARE_API_TOKEN,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        gateway: 'down',
        operator: this.operator,
        tailscale: !!this.tailscaleHost,
        cloudflare: !!process.env.CLOUDFLARE_API_TOKEN,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /** Current operator identity */
  getOperator(): PermittedOperator {
    return this.operator;
  }

  /** Whether Tailscale mesh routing is active */
  isTailscaleActive(): boolean {
    return !!this.tailscaleHost;
  }
}

// ---------------------------------------------------------------------------
// Middleware helpers
// ---------------------------------------------------------------------------

/**
 * Validates an incoming Converter API key against the expected value.
 * Use this in API route middleware to gate contributor access.
 *
 * @returns true if valid, false otherwise
 */
export function validateConverterKey(
  providedKey: string | undefined | null
): boolean {
  const expected = process.env.BLACKROAD_CONVERTER_API_KEY;
  if (!expected) return false;
  if (!providedKey) return false;
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(providedKey, expected);
}

/**
 * Validates that the operator is one of the permitted operators.
 */
export function validateOperator(
  operator: string | undefined | null
): operator is PermittedOperator {
  if (!operator) return false;
  return (PERMITTED_OPERATORS as readonly string[]).includes(operator);
}

/**
 * Naive constant-time string comparison (suitable for API key validation).
 * Pads both strings to the longer length before XOR comparison to avoid
 * leaking length information via timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');
  let diff = a.length !== b.length ? 1 : 0;
  for (let i = 0; i < maxLen; i++) {
    diff |= aPadded.charCodeAt(i) ^ bPadded.charCodeAt(i);
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a VendorGatewayClient from environment variables.
 *
 * Required env vars:
 *   BLACKROAD_CONVERTER_API_KEY   — Converter API key (gates all access)
 *
 * Optional env vars:
 *   BLACKROAD_GATEWAY_URL         — Gateway base URL (default: http://localhost:10200)
 *   BLACKROAD_OPERATOR            — Operator identity (default: blackboxprogramming)
 *   BLACKROAD_TAILSCALE_HOST      — Tailscale hostname for mesh routing
 */
export function createVendorGateway(): VendorGatewayClient {
  const converterApiKey = process.env.BLACKROAD_CONVERTER_API_KEY;
  if (!converterApiKey) {
    throw new GatewayAuthError(
      'BLACKROAD_CONVERTER_API_KEY is not set. ' +
        'All contributors must obtain a Converter API key before accessing BlackRoad OS.'
    );
  }

  const operator = (process.env.BLACKROAD_OPERATOR as PermittedOperator | undefined) ?? 'blackboxprogramming';

  return new VendorGatewayClient({
    converterApiKey,
    operator,
    gatewayBaseUrl: process.env.BLACKROAD_GATEWAY_URL,
    tailscaleHost: process.env.BLACKROAD_TAILSCALE_HOST,
  });
}
