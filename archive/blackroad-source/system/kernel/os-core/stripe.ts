/**
 * BlackRoad OS Stripe Integration
 *
 * © 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL
 *
 * Production-ready Stripe types and client for BlackRoad OS payment processing.
 * Supports subscriptions, one-time payments, and webhook verification.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StripeConfig {
  secretKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export type StripeCurrency = 'usd' | 'eur' | 'gbp' | string;

export type StripePaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export type StripeSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  metadata: Record<string, string>;
  created: number; // Unix timestamp
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
}

export interface StripePrice {
  id: string;
  productId: string;
  currency: StripeCurrency;
  unitAmount: number | null; // In cents
  recurring: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
  } | null;
  active: boolean;
  nickname: string | null;
}

export interface StripePaymentIntent {
  id: string;
  amount: number; // In cents
  currency: StripeCurrency;
  status: StripePaymentStatus;
  clientSecret: string;
  customerId: string | null;
  metadata: Record<string, string>;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: StripeSubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  items: {
    id: string;
    priceId: string;
    quantity: number;
  }[];
  metadata: Record<string, string>;
  created: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
}

export interface CreatePaymentIntentOptions {
  amount: number; // In cents
  currency: StripeCurrency;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface CreateCustomerOptions {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionOptions {
  customerId: string;
  priceId: string;
  quantity?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class StripeClient {
  private readonly baseUrl = 'https://api.stripe.com/v1';
  private readonly headers: Record<string, string>;
  private readonly webhookSecret?: string;

  constructor(config: StripeConfig) {
    this.headers = {
      'Authorization': `Bearer ${config.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': config.apiVersion ?? '2023-10-16',
    };
    this.webhookSecret = config.webhookSecret;
  }

  private async request<T>(
    path: string,
    options?: {
      method?: string;
      body?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    let body: string | undefined;
    if (options?.body) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(options.body)) {
        if (v !== undefined) params.set(k, String(v));
      }
      body = params.toString();
    }

    const response = await fetch(url, {
      method: options?.method ?? 'GET',
      headers: this.headers,
      body,
    });

    const data = await response.json() as T;
    if (!response.ok) {
      const errData = data as { error?: { message?: string } };
      const msg = errData?.error?.message ?? response.statusText;
      throw new Error(`Stripe API error: ${response.status} - ${msg}`);
    }

    return data;
  }

  // -------------------------------------------------------------------------
  // Customers
  // -------------------------------------------------------------------------

  async createCustomer(options: CreateCustomerOptions): Promise<StripeCustomer> {
    const body: Record<string, string> = { email: options.email };
    if (options.name) body.name = options.name;
    if (options.metadata) {
      for (const [k, v] of Object.entries(options.metadata)) {
        body[`metadata[${k}]`] = v;
      }
    }

    const data = await this.request<any>('/customers', { method: 'POST', body });
    return this.mapCustomer(data);
  }

  async getCustomer(customerId: string): Promise<StripeCustomer> {
    const data = await this.request<any>(`/customers/${customerId}`);
    return this.mapCustomer(data);
  }

  async getCustomerByEmail(email: string): Promise<StripeCustomer | null> {
    const data = await this.request<any>(
      `/customers?email=${encodeURIComponent(email)}&limit=1`
    );
    if (!data.data?.length) return null;
    return this.mapCustomer(data.data[0]);
  }

  // -------------------------------------------------------------------------
  // Products & Prices
  // -------------------------------------------------------------------------

  async listProducts(): Promise<StripeProduct[]> {
    const data = await this.request<any>('/products?active=true&limit=100');
    return (data.data ?? []).map(this.mapProduct);
  }

  async listPrices(productId?: string): Promise<StripePrice[]> {
    const qs = productId ? `?product=${productId}&active=true` : '?active=true';
    const data = await this.request<any>(`/prices${qs}`);
    return (data.data ?? []).map(this.mapPrice);
  }

  // -------------------------------------------------------------------------
  // Payment Intents
  // -------------------------------------------------------------------------

  async createPaymentIntent(
    options: CreatePaymentIntentOptions
  ): Promise<StripePaymentIntent> {
    const body: Record<string, string | number> = {
      amount: options.amount,
      currency: options.currency,
    };
    if (options.customerId) body.customer = options.customerId;
    if (options.description) body.description = options.description;
    if (options.metadata) {
      for (const [k, v] of Object.entries(options.metadata)) {
        (body as any)[`metadata[${k}]`] = v;
      }
    }

    const data = await this.request<any>('/payment_intents', {
      method: 'POST',
      body: body as Record<string, string>,
    });
    return this.mapPaymentIntent(data);
  }

  async getPaymentIntent(id: string): Promise<StripePaymentIntent> {
    const data = await this.request<any>(`/payment_intents/${id}`);
    return this.mapPaymentIntent(data);
  }

  // -------------------------------------------------------------------------
  // Subscriptions
  // -------------------------------------------------------------------------

  async createSubscription(
    options: CreateSubscriptionOptions
  ): Promise<StripeSubscription> {
    const body: Record<string, string | number> = {
      customer: options.customerId,
      'items[0][price]': options.priceId,
    };
    if (options.quantity) body['items[0][quantity]'] = options.quantity;
    if (options.trialPeriodDays) body.trial_period_days = options.trialPeriodDays;
    if (options.metadata) {
      for (const [k, v] of Object.entries(options.metadata)) {
        (body as any)[`metadata[${k}]`] = v;
      }
    }

    const data = await this.request<any>('/subscriptions', {
      method: 'POST',
      body: body as Record<string, string>,
    });
    return this.mapSubscription(data);
  }

  async getSubscription(id: string): Promise<StripeSubscription> {
    const data = await this.request<any>(`/subscriptions/${id}`);
    return this.mapSubscription(data);
  }

  async cancelSubscription(id: string): Promise<StripeSubscription> {
    const data = await this.request<any>(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
    return this.mapSubscription(data);
  }

  // -------------------------------------------------------------------------
  // Webhooks
  // -------------------------------------------------------------------------

  /**
   * Verify a Stripe webhook signature and parse the event.
   * Pass the raw request body (string) and the Stripe-Signature header value.
   *
   * Uses Node's built-in `crypto` module for HMAC-SHA256 verification.
   */
  verifyWebhook(
    rawBody: string,
    signature: string
  ): StripeWebhookEvent {
    if (!this.webhookSecret) {
      throw new Error('webhookSecret is required for webhook verification');
    }

    // Parse the signature header (format: t=<ts>,v1=<hex>,v1=<hex>...)
    const parts: Record<string, string> = {};
    for (const part of signature.split(',')) {
      const idx = part.indexOf('=');
      if (idx !== -1) {
        const k = part.slice(0, idx);
        const v = part.slice(idx + 1);
        parts[k] = v;
      }
    }

    const timestamp = parts.t;
    const v1 = parts.v1;

    if (!timestamp || !v1) {
      throw new Error('Invalid Stripe webhook signature header');
    }

    // Validate timestamp freshness (5-minute tolerance)
    const tolerance = 300;
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > tolerance) {
      throw new Error('Stripe webhook timestamp too old (replay attack?)');
    }

    // Compute expected HMAC-SHA256 using Node crypto
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto') as typeof import('crypto');
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Constant-time comparison
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    const receivedBuf = Buffer.from(v1, 'hex');
    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new Error('Stripe webhook signature mismatch');
    }

    return JSON.parse(rawBody) as StripeWebhookEvent;
  }

  // -------------------------------------------------------------------------
  // Mappers
  // -------------------------------------------------------------------------

  private mapCustomer(d: any): StripeCustomer {
    return {
      id: d.id,
      email: d.email ?? null,
      name: d.name ?? null,
      metadata: d.metadata ?? {},
      created: d.created,
    };
  }

  private mapProduct(d: any): StripeProduct {
    return {
      id: d.id,
      name: d.name,
      description: d.description ?? null,
      active: d.active,
      metadata: d.metadata ?? {},
    };
  }

  private mapPrice(d: any): StripePrice {
    return {
      id: d.id,
      productId: d.product,
      currency: d.currency,
      unitAmount: d.unit_amount ?? null,
      recurring: d.recurring
        ? {
            interval: d.recurring.interval,
            intervalCount: d.recurring.interval_count,
          }
        : null,
      active: d.active,
      nickname: d.nickname ?? null,
    };
  }

  private mapPaymentIntent(d: any): StripePaymentIntent {
    return {
      id: d.id,
      amount: d.amount,
      currency: d.currency,
      status: d.status,
      clientSecret: d.client_secret,
      customerId: d.customer ?? null,
      metadata: d.metadata ?? {},
      created: d.created,
    };
  }

  private mapSubscription(d: any): StripeSubscription {
    return {
      id: d.id,
      customerId: d.customer,
      status: d.status,
      currentPeriodStart: d.current_period_start,
      currentPeriodEnd: d.current_period_end,
      cancelAtPeriodEnd: d.cancel_at_period_end,
      items: (d.items?.data ?? []).map((item: any) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity ?? 1,
      })),
      metadata: d.metadata ?? {},
      created: d.created,
    };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a StripeClient from environment variables.
 *
 * Required:
 *   STRIPE_SECRET_KEY        — Stripe secret key
 *
 * Optional:
 *   STRIPE_WEBHOOK_SECRET    — Webhook signing secret
 */
export function createStripeClient(): StripeClient {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  return new StripeClient({
    secretKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  });
}
