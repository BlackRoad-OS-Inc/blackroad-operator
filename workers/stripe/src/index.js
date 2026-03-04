/**
 * BlackRoad Stripe Payment Gateway Worker
 *
 * Production payment processing for BlackRoad OS subscriptions.
 * Handles checkout sessions, webhooks, customer portal, and Pi forwarding.
 *
 * Endpoints:
 *   POST /checkout          — create a Stripe Checkout session
 *   POST /webhooks/stripe   — receive and verify Stripe webhook events
 *   POST /portal            — create a customer billing portal session
 *   GET  /prices            — list active prices
 *   GET  /health            — health check
 *
 * Env secrets:
 *   STRIPE_SECRET_KEY       — sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET   — whsec_...
 *   STRIPE_PRICE_PRO_MONTHLY
 *   STRIPE_PRICE_PRO_YEARLY
 *   STRIPE_PRICE_ENT_MONTHLY
 *   STRIPE_PRICE_ENT_YEARLY
 *
 * KV binding:
 *   STRIPE_EVENTS           — idempotency store for processed webhook events
 */

// ─── Stripe API client ───────────────────────────────────────────────────────

async function stripeRequest(env, method, path, body) {
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const opts = { method, headers };
  if (body) {
    opts.body = typeof body === 'string' ? body : new URLSearchParams(body).toString();
  }
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${method} ${path}: ${data.error?.message || res.statusText}`);
  }
  return data;
}

// ─── Webhook signature verification ──────────────────────────────────────────

async function verifyWebhookSignature(payload, sigHeader, secret) {
  const parts = {};
  for (const item of sigHeader.split(',')) {
    const [key, value] = item.split('=');
    if (key === 't') parts.t = value;
    if (key === 'v1' && !parts.v1) parts.v1 = value;
  }

  if (!parts.t || !parts.v1) return false;

  const signedPayload = `${parts.t}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (expected.length !== parts.v1.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  }

  // Reject if timestamp is older than 5 minutes
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(parts.t, 10)) > tolerance) return false;

  return mismatch === 0;
}

// ─── Forward event to Pi infrastructure ──────────────────────────────────────

async function forwardToPi(env, event) {
  const piEndpoint = env.PI_WEBHOOK_ENDPOINT;
  if (!piEndpoint) return { forwarded: false, reason: 'no PI_WEBHOOK_ENDPOINT configured' };

  try {
    const res = await fetch(piEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return { forwarded: true, status: res.status };
  } catch (err) {
    // Non-blocking — log but don't fail the webhook
    return { forwarded: false, reason: err.message };
  }
}

// ─── Response helpers ────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Stripe-Signature',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── Canonical pricing map ───────────────────────────────────────────────────

function getPriceMap(env) {
  return {
    pro_monthly: env.STRIPE_PRICE_PRO_MONTHLY,
    pro_yearly: env.STRIPE_PRICE_PRO_YEARLY,
    enterprise_monthly: env.STRIPE_PRICE_ENT_MONTHLY,
    enterprise_yearly: env.STRIPE_PRICE_ENT_YEARLY,
  };
}

// ─── Route: POST /checkout ───────────────────────────────────────────────────

async function handleCheckout(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const { tier, period, customer_email } = body;
  if (!tier || !period) {
    return json({ error: 'tier and period required (e.g. tier=pro, period=monthly)' }, 400);
  }

  const priceKey = `${tier}_${period}`;
  const priceMap = getPriceMap(env);
  const priceId = priceMap[priceKey];

  if (!priceId) {
    return json({ error: `unknown plan: ${priceKey}`, available: Object.keys(priceMap) }, 400);
  }

  const params = {
    'mode': 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'success_url': env.SUCCESS_URL || 'https://pay.blackroad.io/success?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url': env.CANCEL_URL || 'https://pay.blackroad.io/cancel',
    'metadata[tier]': tier,
    'metadata[period]': period,
    'metadata[source]': 'blackroad-operator',
  };

  if (customer_email) {
    params['customer_email'] = customer_email;
  }

  const session = await stripeRequest(env, 'POST', '/checkout/sessions', params);

  return json({
    ok: true,
    checkout_url: session.url,
    session_id: session.id,
  });
}

// ─── Route: POST /webhooks/stripe ────────────────────────────────────────────

async function handleWebhook(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 500);
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'webhook secret not configured' }, 500);

  const payload = await request.text();
  const sigHeader = request.headers.get('Stripe-Signature');

  if (!sigHeader) return json({ error: 'missing Stripe-Signature header' }, 400);

  const valid = await verifyWebhookSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: 'invalid signature' }, 401);

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: 'invalid JSON payload' }, 400);
  }

  // Idempotency check
  if (env.STRIPE_EVENTS) {
    const existing = await env.STRIPE_EVENTS.get(event.id);
    if (existing) {
      return json({ ok: true, status: 'already_processed', event_id: event.id });
    }
  }

  // Process event
  let result;
  switch (event.type) {
    case 'checkout.session.completed':
      result = await onCheckoutCompleted(env, event.data.object);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      result = await onSubscriptionChange(env, event.data.object);
      break;
    case 'customer.subscription.deleted':
      result = await onSubscriptionCanceled(env, event.data.object);
      break;
    case 'invoice.payment_succeeded':
      result = await onInvoicePaid(env, event.data.object);
      break;
    case 'invoice.payment_failed':
      result = await onInvoiceFailed(env, event.data.object);
      break;
    default:
      result = { action: 'ignored', type: event.type };
  }

  // Store as processed
  if (env.STRIPE_EVENTS) {
    await env.STRIPE_EVENTS.put(event.id, JSON.stringify({
      type: event.type,
      processed_at: new Date().toISOString(),
      result,
    }), { expirationTtl: 2592000 }); // 30 days
  }

  // Forward to Pi infrastructure (non-blocking)
  const piResult = await forwardToPi(env, event);

  return json({
    ok: true,
    event_id: event.id,
    type: event.type,
    result,
    pi: piResult,
  });
}

// ─── Webhook event handlers ─────────────────────────────────────────────────

async function onCheckoutCompleted(env, session) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const email = session.customer_email || session.customer_details?.email;
  const tier = session.metadata?.tier;

  return {
    action: 'checkout_completed',
    customer: customerId,
    subscription: subscriptionId,
    email,
    tier,
  };
}

async function onSubscriptionChange(env, subscription) {
  return {
    action: 'subscription_updated',
    subscription_id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_end: subscription.current_period_end,
  };
}

async function onSubscriptionCanceled(env, subscription) {
  return {
    action: 'subscription_canceled',
    subscription_id: subscription.id,
    customer: subscription.customer,
    canceled_at: subscription.canceled_at,
  };
}

async function onInvoicePaid(env, invoice) {
  return {
    action: 'invoice_paid',
    invoice_id: invoice.id,
    customer: invoice.customer,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
  };
}

async function onInvoiceFailed(env, invoice) {
  return {
    action: 'invoice_failed',
    invoice_id: invoice.id,
    customer: invoice.customer,
    amount_due: invoice.amount_due,
    attempt_count: invoice.attempt_count,
    next_payment_attempt: invoice.next_payment_attempt,
  };
}

// ─── Route: POST /portal ─────────────────────────────────────────────────────

async function handlePortal(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Stripe not configured' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  const { customer_id } = body;
  if (!customer_id) return json({ error: 'customer_id required' }, 400);

  const session = await stripeRequest(env, 'POST', '/billing_portal/sessions', {
    customer: customer_id,
    return_url: env.PORTAL_RETURN_URL || 'https://pay.blackroad.io/',
  });

  return json({ ok: true, portal_url: session.url });
}

// ─── Route: GET /prices ──────────────────────────────────────────────────────

async function handlePrices(request, env) {
  const priceMap = getPriceMap(env);
  const configured = Object.values(priceMap).filter(Boolean).length;

  const prices = {
    pro: {
      monthly: { price_id: priceMap.pro_monthly || null, amount: 2900, currency: 'usd' },
      yearly: { price_id: priceMap.pro_yearly || null, amount: 29000, currency: 'usd' },
    },
    enterprise: {
      monthly: { price_id: priceMap.enterprise_monthly || null, amount: 19900, currency: 'usd' },
      yearly: { price_id: priceMap.enterprise_yearly || null, amount: 199000, currency: 'usd' },
    },
  };

  return json({
    ok: true,
    configured: `${configured}/4`,
    prices,
  });
}

// ─── Route: GET /health ──────────────────────────────────────────────────────

async function handleHealth(request, env) {
  const configured = !!env.STRIPE_SECRET_KEY;
  const webhookConfigured = !!env.STRIPE_WEBHOOK_SECRET;
  const priceMap = getPriceMap(env);
  const pricesConfigured = Object.values(priceMap).filter(Boolean).length;

  return json({
    ok: true,
    service: 'blackroad-stripe',
    stripe_configured: configured,
    webhook_configured: webhookConfigured,
    prices_configured: `${pricesConfigured}/4`,
    pi_endpoint: env.PI_WEBHOOK_ENDPOINT || null,
    ts: new Date().toISOString(),
  });
}

// ─── Main fetch handler ─────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    try {
      if (method === 'POST' && path === '/checkout') return await handleCheckout(request, env);
      if (method === 'POST' && path === '/webhooks/stripe') return await handleWebhook(request, env);
      if (method === 'POST' && path === '/portal') return await handlePortal(request, env);
      if (method === 'GET' && path === '/prices') return await handlePrices(request, env);
      if (method === 'GET' && path === '/health') return await handleHealth(request, env);

      return json({ error: `not found: ${method} ${path}`, endpoints: [
        'POST /checkout',
        'POST /webhooks/stripe',
        'POST /portal',
        'GET  /prices',
        'GET  /health',
      ]}, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
