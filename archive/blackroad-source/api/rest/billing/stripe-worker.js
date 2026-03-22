// BlackRoad Stripe Worker — checkout, portal, prices, webhooks, admin

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

async function stripeRequest(env, method, path, body = null) {
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const options = { method, headers };
  if (body) {
    options.body = new URLSearchParams(body).toString();
  }
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error: ${res.status}`);
  }
  return data;
}

// ─── Checkout ─────────────────────────────────────────────────────────
async function handleCheckout(request, env) {
  const body = await request.json();
  const { price_id, success_url, cancel_url, customer_email, metadata = {} } = body;

  if (!price_id) {
    return Response.json({ error: 'price_id is required' }, { status: 400 });
  }

  const origin = request.headers.get('Origin') || '*';
  const successUrl = success_url || `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = cancel_url || `${origin}/pricing`;

  const params = {
    mode: 'subscription',
    'line_items[0][price]': price_id,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'automatic_tax[enabled]': 'true',
    'subscription_data[metadata][source]': 'blackroad-os',
    ...Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [`metadata[${k}]`, v])
    ),
  };

  if (customer_email) {
    params.customer_email = customer_email;
  }

  const session = await stripeRequest(env, 'POST', '/checkout/sessions', params);
  return Response.json({ url: session.url, session_id: session.id });
}

// ─── Billing Portal ───────────────────────────────────────────────────
async function handlePortal(request, env) {
  const { customer_id, return_url } = await request.json();
  if (!customer_id) {
    return Response.json({ error: 'customer_id is required' }, { status: 400 });
  }
  const origin = request.headers.get('Origin') || '*';
  const session = await stripeRequest(env, 'POST', '/billing_portal/sessions', {
    customer: customer_id,
    return_url: return_url || `${origin}/account`,
  });
  return Response.json({ url: session.url });
}

// ─── Prices ───────────────────────────────────────────────────────────
async function handlePrices(env) {
  const prices = await stripeRequest(env, 'GET', '/prices?active=true&expand[]=data.product&limit=100');
  const formatted = prices.data
    .filter((p) => p.product && !p.product.deleted)
    .map((p) => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval,
      interval_count: p.recurring?.interval_count,
      product: {
        id: p.product.id,
        name: p.product.name,
        description: p.product.description,
        metadata: p.product.metadata,
      },
    }))
    .sort((a, b) => (a.amount || 0) - (b.amount || 0));
  return Response.json({ prices: formatted, count: formatted.length });
}

// ─── Products (list all) ─────────────────────────────────────────────
async function handleProducts(env) {
  const products = await stripeRequest(env, 'GET', '/products?active=true&limit=100');
  const formatted = products.data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    metadata: p.metadata,
    images: p.images,
    default_price: p.default_price,
    created: p.created,
  }));
  return Response.json({ products: formatted, count: formatted.length });
}

// ─── Webhook ──────────────────────────────────────────────────────────
async function handleWebhook(request, env) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  if (env.STRIPE_WEBHOOK_SECRET) {
    try {
      await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Forward to Slack hub
  const slackRelay = fetch('https://blackroad-slack.amundsonalexa.workers.dev/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  }).catch(() => {});

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log(`✓ Checkout completed: ${session.id} | customer: ${session.customer}`);
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      console.log(`✓ Subscription ${event.type}: ${sub.id} | status: ${sub.status}`);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log(`✓ Subscription cancelled: ${sub.id}`);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`✗ Payment failed: ${invoice.id} | customer: ${invoice.customer}`);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`✓ Payment succeeded: ${invoice.id}`);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }
  await slackRelay;
  return Response.json({ received: true });
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader) throw new Error('Missing stripe-signature header');

  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signatures = Object.entries(parts)
    .filter(([k]) => k === 'v1')
    .map(([, v]) => v);

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid stripe-signature format');
  }

  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > tolerance) {
    throw new Error('Timestamp outside tolerance window');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (!signatures.includes(computed)) {
    throw new Error('Signature mismatch');
  }
}


// ─── Router ───────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, ...SECURITY_HEADERS } });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return Response.json(
        { error: 'Stripe not configured' },
        { status: 503, headers: { ...cors, ...SECURITY_HEADERS } }
      );
    }

    let response;
    try {
      switch (true) {
        case url.pathname === '/health':
          response = Response.json({
            status: 'ok',
            worker: 'blackroad-stripe',
            version: '2.0.0',
            time: new Date().toISOString(),
          });
          break;

        case request.method === 'POST' && url.pathname === '/checkout':
          response = await handleCheckout(request, env);
          break;

        case request.method === 'POST' && url.pathname === '/portal':
          response = await handlePortal(request, env);
          break;

        case request.method === 'POST' && url.pathname === '/webhook':
          return await handleWebhook(request, env);

        case request.method === 'GET' && url.pathname === '/prices':
          response = await handlePrices(env);
          break;

        case request.method === 'GET' && url.pathname === '/products':
          response = await handleProducts(env);
          break;

        default:
          response = Response.json(
            { error: 'Not found', routes: ['/health', '/checkout', '/portal', '/webhook', '/prices', '/products'] },
            { status: 404 }
          );
      }
    } catch (err) {
      console.error('Worker error:', err);
      response = Response.json({ error: err.message }, { status: 500 });
    }

    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries({ ...cors, ...SECURITY_HEADERS })) {
      headers.set(k, v);
    }
    return new Response(response.body, { status: response.status, headers });
  },
};
