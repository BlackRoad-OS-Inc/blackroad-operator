// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { describe, it, expect, vi, beforeEach } from 'vitest'

// E2E integration test for the full Stripe checkout → webhook → Pi forwarding flow.
// Uses mocked fetch to simulate Stripe API responses.

const worker = await import('../../workers/stripe/src/index.js')

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    STRIPE_SECRET_KEY: 'sk_test_e2e_key',
    STRIPE_WEBHOOK_SECRET: 'whsec_e2e_secret',
    STRIPE_PRICE_PRO_MONTHLY: 'price_pro_m_e2e',
    STRIPE_PRICE_PRO_YEARLY: 'price_pro_y_e2e',
    STRIPE_PRICE_ENT_MONTHLY: 'price_ent_m_e2e',
    STRIPE_PRICE_ENT_YEARLY: 'price_ent_y_e2e',
    PI_WEBHOOK_ENDPOINT: 'http://192.168.4.64:8080/webhooks/stripe',
    SUCCESS_URL: 'https://pay.blackroad.io/success',
    CANCEL_URL: 'https://pay.blackroad.io/cancel',
    PORTAL_RETURN_URL: 'https://pay.blackroad.io/',
    STRIPE_EVENTS: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  }
}

describe('Stripe E2E Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('full checkout → webhook → Pi forward flow', async () => {
    // Step 1: Create checkout session
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    // Mock Stripe checkout session creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'cs_e2e_session_001',
        url: 'https://checkout.stripe.com/c/pay/cs_e2e_session_001',
      }),
    })

    const env = makeEnv()
    const checkoutReq = new Request('https://blackroad-stripe.workers.dev/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'pro',
        period: 'monthly',
        customer_email: 'e2e@blackroad.io',
      }),
    })

    const checkoutRes = await worker.default.fetch(checkoutReq, env)
    const checkoutData = await checkoutRes.json()

    expect(checkoutData.ok).toBe(true)
    expect(checkoutData.checkout_url).toBe('https://checkout.stripe.com/c/pay/cs_e2e_session_001')
    expect(checkoutData.session_id).toBe('cs_e2e_session_001')

    // Verify Stripe was called with correct params
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [stripeUrl, stripeOpts] = mockFetch.mock.calls[0]
    expect(stripeUrl).toBe('https://api.stripe.com/v1/checkout/sessions')
    expect(stripeOpts.method).toBe('POST')
    expect(stripeOpts.headers.Authorization).toBe('Bearer sk_test_e2e_key')

    // Parse the body to verify price ID was sent
    const bodyParams = new URLSearchParams(stripeOpts.body)
    expect(bodyParams.get('line_items[0][price]')).toBe('price_pro_m_e2e')
    expect(bodyParams.get('customer_email')).toBe('e2e@blackroad.io')
    expect(bodyParams.get('metadata[tier]')).toBe('pro')

    vi.unstubAllGlobals()
  })

  it('webhook processes checkout.session.completed and forwards to Pi', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    // Mock Pi forwarding response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    })

    const webhookPayload = JSON.stringify({
      id: 'evt_e2e_checkout_completed',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_e2e_session_001',
          customer: 'cus_e2e_001',
          subscription: 'sub_e2e_001',
          customer_email: 'e2e@blackroad.io',
          customer_details: { email: 'e2e@blackroad.io' },
          metadata: { tier: 'pro', period: 'monthly', source: 'blackroad-operator' },
        },
      },
    })

    // Generate a valid HMAC signature
    const secret = 'whsec_e2e_secret'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signedPayload = `${timestamp}.${webhookPayload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const sigHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const sigHeader = `t=${timestamp},v1=${sigHex}`

    const env = makeEnv()
    const webhookReq = new Request('https://blackroad-stripe.workers.dev/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': sigHeader,
      },
      body: webhookPayload,
    })

    const webhookRes = await worker.default.fetch(webhookReq, env)
    const webhookData = await webhookRes.json()

    expect(webhookRes.status).toBe(200)
    expect(webhookData.ok).toBe(true)
    expect(webhookData.event_id).toBe('evt_e2e_checkout_completed')
    expect(webhookData.type).toBe('checkout.session.completed')
    expect(webhookData.result.action).toBe('checkout_completed')
    expect(webhookData.result.customer).toBe('cus_e2e_001')
    expect(webhookData.result.subscription).toBe('sub_e2e_001')
    expect(webhookData.result.email).toBe('e2e@blackroad.io')
    expect(webhookData.result.tier).toBe('pro')

    // Verify Pi forwarding was called
    expect(webhookData.pi.forwarded).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [piUrl, piOpts] = mockFetch.mock.calls[0]
    expect(piUrl).toBe('http://192.168.4.64:8080/webhooks/stripe')
    expect(piOpts.method).toBe('POST')

    // Verify event was stored in KV for idempotency
    expect(env.STRIPE_EVENTS.put).toHaveBeenCalledWith(
      'evt_e2e_checkout_completed',
      expect.stringContaining('checkout.session.completed'),
      expect.objectContaining({ expirationTtl: 2592000 }),
    )

    vi.unstubAllGlobals()
  })

  it('webhook handles invoice.payment_failed and forwards to Pi', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })

    const webhookPayload = JSON.stringify({
      id: 'evt_e2e_invoice_failed',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_e2e_failed',
          customer: 'cus_e2e_001',
          amount_due: 2900,
          attempt_count: 2,
          next_payment_attempt: 1709500000,
        },
      },
    })

    const secret = 'whsec_e2e_secret'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signedPayload = `${timestamp}.${webhookPayload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const sigHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const env = makeEnv()
    const req = new Request('https://blackroad-stripe.workers.dev/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${sigHex}`,
      },
      body: webhookPayload,
    })

    const res = await worker.default.fetch(req, env)
    const data = await res.json()

    expect(data.ok).toBe(true)
    expect(data.result.action).toBe('invoice_failed')
    expect(data.result.customer).toBe('cus_e2e_001')
    expect(data.result.amount_due).toBe(2900)
    expect(data.result.attempt_count).toBe(2)

    vi.unstubAllGlobals()
  })

  it('webhook deduplicates already-processed events', async () => {
    const env = makeEnv({
      STRIPE_EVENTS: {
        get: vi.fn().mockResolvedValue('{"processed_at":"2026-03-04T00:00:00Z"}'),
        put: vi.fn(),
      },
    })

    const webhookPayload = JSON.stringify({
      id: 'evt_already_processed',
      type: 'checkout.session.completed',
      data: { object: {} },
    })

    const secret = 'whsec_e2e_secret'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signedPayload = `${timestamp}.${webhookPayload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const sigHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const req = new Request('https://blackroad-stripe.workers.dev/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${sigHex}`,
      },
      body: webhookPayload,
    })

    const res = await worker.default.fetch(req, env)
    const data = await res.json()

    expect(data.ok).toBe(true)
    expect(data.status).toBe('already_processed')
    expect(data.event_id).toBe('evt_already_processed')

    // Should NOT have called put (no re-processing)
    expect(env.STRIPE_EVENTS.put).not.toHaveBeenCalled()
  })

  it('prices endpoint returns all 4 configured tiers', async () => {
    const env = makeEnv()
    const req = new Request('https://blackroad-stripe.workers.dev/prices', { method: 'GET' })
    const res = await worker.default.fetch(req, env)
    const data = await res.json()

    expect(data.ok).toBe(true)
    expect(data.configured).toBe('4/4')

    // Pro: $29/mo, $290/yr
    expect(data.prices.pro.monthly.price_id).toBe('price_pro_m_e2e')
    expect(data.prices.pro.monthly.amount).toBe(2900)
    expect(data.prices.pro.yearly.price_id).toBe('price_pro_y_e2e')
    expect(data.prices.pro.yearly.amount).toBe(29000)

    // Enterprise: $199/mo, $1990/yr
    expect(data.prices.enterprise.monthly.price_id).toBe('price_ent_m_e2e')
    expect(data.prices.enterprise.monthly.amount).toBe(19900)
    expect(data.prices.enterprise.yearly.price_id).toBe('price_ent_y_e2e')
    expect(data.prices.enterprise.yearly.amount).toBe(199000)
  })

  it('portal creates billing session for existing customer', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://billing.stripe.com/p/session/e2e_portal' }),
    })

    const env = makeEnv()
    const req = new Request('https://blackroad-stripe.workers.dev/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: 'cus_e2e_001' }),
    })

    const res = await worker.default.fetch(req, env)
    const data = await res.json()

    expect(data.ok).toBe(true)
    expect(data.portal_url).toBe('https://billing.stripe.com/p/session/e2e_portal')

    // Verify correct Stripe API call
    const [stripeUrl, stripeOpts] = mockFetch.mock.calls[0]
    expect(stripeUrl).toBe('https://api.stripe.com/v1/billing_portal/sessions')
    const bodyParams = new URLSearchParams(stripeOpts.body)
    expect(bodyParams.get('customer')).toBe('cus_e2e_001')
    expect(bodyParams.get('return_url')).toBe('https://pay.blackroad.io/')

    vi.unstubAllGlobals()
  })
})
