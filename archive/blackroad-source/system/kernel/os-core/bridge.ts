/**
 * TypeScript-Python Bridge Service
 * ==================================
 *
 * Connects TypeScript core library (types, desktop shell, truth engine)
 * with Python runtime (agent spawner, LLM integration, packs).
 *
 * This service provides:
 * - REST API endpoints for agent operations
 * - WebSocket connections for real-time updates
 * - Type-safe wrappers around Python orchestrator
 * - Truth engine integration
 * - Desktop shell event bridge
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

// Types from core library
import type {
  AgentManifest,
  AgentStatus,
  RuntimeType,
  TruthState,
  VerificationJob,
  TextSnapshot,
} from '../index';

// Gateway & Stripe integrations
import {
  validateConverterKey,
  validateOperator,
  VendorGatewayClient,
  PERMITTED_OPERATORS,
  type VendorId,
  type VendorRequest,
} from '../integrations/vendor-gateway';
import { createStripeClient } from '../integrations/stripe';

// ============================================================================
// Configuration
// ============================================================================

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:10100';
const BRIDGE_PORT = parseInt(process.env.PORT_API_GATEWAY || '8000', 10);

// ============================================================================
// Python Orchestrator Client
// ============================================================================

class OrchestratorClient extends EventEmitter {
  private wsConnection: WebSocket | null = null;
  private reconnectInterval = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private baseUrl: string) {
    super();
    this.connectWebSocket();
  }

  /**
   * Connect to orchestrator WebSocket for real-time updates
   */
  private connectWebSocket() {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('✅ Connected to orchestrator WebSocket');
        this.emit('connected');

        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data.toString());

          switch (message.type) {
            case 'breath_update':
              this.emit('breath', message);
              break;
            case 'status_update':
              this.emit('status', message);
              break;
            default:
              this.emit('message', message);
          }
        } catch (error) {
          console.error('Failed to parse WS message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('⚠ Disconnected from orchestrator WebSocket');
        this.emit('disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('🔄 Reconnecting to orchestrator...');
        this.connectWebSocket();
      }, this.reconnectInterval);
    }
  }

  /**
   * Get infrastructure status
   */
  async getStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) {
      throw new Error(`Status request failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Spawn a new agent
   */
  async spawnAgent(request: {
    role: string;
    capabilities: string[];
    runtime_type: string;
    pack?: string;
  }): Promise<{ agent_id: string }> {
    const response = await fetch(`${this.baseUrl}/agents/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Spawn request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// Bridge Application
// ============================================================================

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Global orchestrator client
let orchestratorClient: OrchestratorClient;

// ============================================================================
// Converter API Key Middleware
// Gating middleware — all /api/* routes (except /api/payments/webhook)
// require a valid Converter API key and an authorized operator.
// ============================================================================

app.use('/api/*', async (c, next) => {
  // Stripe webhook must bypass key auth so Stripe can post without a key
  if (c.req.path === '/api/payments/webhook') {
    await next();
    return;
  }

  const converterKey = c.req.header('X-BlackRoad-Converter-Key');
  const operator = c.req.header('X-BlackRoad-Operator');

  if (!validateConverterKey(converterKey)) {
    return c.json(
      {
        error: 'Unauthorized',
        message:
          'A valid Converter API key is required. ' +
          'Obtain BLACKROAD_CONVERTER_API_KEY to access BlackRoad OS.',
      },
      401
    );
  }

  if (operator && !validateOperator(operator)) {
    return c.json(
      {
        error: 'Forbidden',
        message: `Operator '${operator}' is not permitted. Only ${PERMITTED_OPERATORS.join(', ')} may access this gateway.`,
      },
      403
    );
  }

  await next();
});

// ============================================================================
// REST API Routes
// ============================================================================

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    service: 'BlackRoad OS Bridge',
    description: 'TypeScript-Python bridge service',
    version: '0.1.0',
    endpoints: {
      status: '/api/status',
      agents: '/api/agents/*',
      truth: '/api/truth/*',
      health: '/health',
    },
  });
});

/**
 * Health check
 */
app.get('/health', async (c) => {
  const orchestratorHealthy = await orchestratorClient.healthCheck();

  return c.json({
    status: orchestratorHealthy ? 'healthy' : 'degraded',
    services: {
      bridge: 'healthy',
      orchestrator: orchestratorHealthy ? 'healthy' : 'down',
    },
  });
});

/**
 * Get infrastructure status
 */
app.get('/api/status', async (c) => {
  try {
    const status = await orchestratorClient.getStatus();
    return c.json(status);
  } catch (error) {
    return c.json({ error: String(error) }, 503);
  }
});

/**
 * Spawn a new agent
 */
app.post('/api/agents/spawn', async (c) => {
  try {
    const body = await c.req.json();

    // Validate request
    if (!body.role || !body.capabilities || !body.runtime_type) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const result = await orchestratorClient.spawnAgent(body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * List active agents
 */
app.get('/api/agents', async (c) => {
  try {
    const status = await orchestratorClient.getStatus();
    return c.json({
      active_agents: status.active_agents,
      total_spawned: status.total_spawned,
      capacity: 30000,
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Truth Engine - Submit text for verification
 */
app.post('/api/truth/submit', async (c) => {
  try {
    const body = await c.req.json<TextSnapshot>();

    // This would integrate with the Python truth engine
    // For now, return a placeholder response

    return c.json({
      job_id: `job-${Date.now()}`,
      status: 'queued',
      snapshot_id: body.id,
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Truth Engine - Get verification job status
 */
app.get('/api/truth/jobs/:jobId', async (c) => {
  const jobId = c.req.param('jobId');

  // This would query the truth engine for job status
  return c.json({
    job_id: jobId,
    status: 'in_progress',
    message: 'Truth engine integration in progress',
  });
});

/**
 * Desktop Shell - Register app
 */
app.post('/api/desktop/apps', async (c) => {
  try {
    const appManifest = await c.req.json();

    // Store app manifest in registry
    // This integrates with the desktop shell system

    return c.json({
      success: true,
      app_id: appManifest.id,
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Desktop Shell - Get registered apps
 */
app.get('/api/desktop/apps', (c) => {
  // Return registered desktop apps
  return c.json({
    apps: [],
    message: 'Desktop shell integration in progress',
  });
});

// ============================================================================
// Vendor Gateway Routes
// All AI/vendor calls are proxied through BlackRoad infrastructure.
// Direct calls to OpenAI / Anthropic / GitHub APIs are not made here.
// ============================================================================

/**
 * Proxy a vendor API call through the BlackRoad gateway.
 *
 * POST /api/gateway/:vendor/*
 * Headers: X-BlackRoad-Converter-Key, X-BlackRoad-Operator (required)
 */
app.all('/api/gateway/:vendor/*', async (c) => {
  const converterApiKey = process.env.BLACKROAD_CONVERTER_API_KEY;
  if (!converterApiKey) {
    return c.json({ error: 'Gateway not configured: BLACKROAD_CONVERTER_API_KEY missing' }, 503);
  }

  const vendor = c.req.param('vendor') as VendorId;
  const rawOperator = c.req.header('X-BlackRoad-Operator') ?? 'blackboxprogramming';
  const operator = validateOperator(rawOperator) ? rawOperator : 'blackboxprogramming';
  const path = '/' + c.req.path.split(`/api/gateway/${vendor}`)[1]?.replace(/^\//, '');

  try {
    const gw = new VendorGatewayClient({
      converterApiKey,
      operator,
      gatewayBaseUrl: process.env.BLACKROAD_GATEWAY_URL,
      tailscaleHost: process.env.BLACKROAD_TAILSCALE_HOST,
    });

    let body: unknown;
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      body = await c.req.json().catch(() => undefined);
    }

    const method = c.req.method as VendorRequest['method'];
    const result = await gw.call({ vendor, path, method, body });
    const statusCode = result.status >= 100 && result.status <= 599 ? result.status : 502;
    return c.json(result, statusCode as Parameters<typeof c.json>[1]);
  } catch (error) {
    return c.json({ error: String(error) }, 502);
  }
});

/**
 * Gateway health check
 */
app.get('/api/gateway/health', async (c) => {
  const converterApiKey = process.env.BLACKROAD_CONVERTER_API_KEY;
  if (!converterApiKey) {
    return c.json({
      gateway: 'not_configured',
      message: 'Set BLACKROAD_CONVERTER_API_KEY to enable the vendor gateway',
    }, 503);
  }

  const gw = new VendorGatewayClient({
    converterApiKey,
    operator: 'blackboxprogramming',
    gatewayBaseUrl: process.env.BLACKROAD_GATEWAY_URL,
    tailscaleHost: process.env.BLACKROAD_TAILSCALE_HOST,
  });

  const status = await gw.health();
  return c.json(status, status.gateway === 'healthy' ? 200 : 503);
});

// ============================================================================
// Stripe Routes
// ============================================================================

/**
 * Create Stripe payment intent
 * POST /api/payments/intents
 */
app.post('/api/payments/intents', async (c) => {
  try {
    const stripe = createStripeClient();
    const body = await c.req.json<{ amount: number; currency?: string; customerId?: string; metadata?: Record<string, string> }>();

    if (!body.amount || body.amount <= 0) {
      return c.json({ error: 'amount is required and must be positive (in cents)' }, 400);
    }

    const intent = await stripe.createPaymentIntent({
      amount: body.amount,
      currency: body.currency ?? 'usd',
      customerId: body.customerId,
      metadata: body.metadata,
    });

    return c.json(intent, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Get Stripe payment intent
 * GET /api/payments/intents/:id
 */
app.get('/api/payments/intents/:id', async (c) => {
  try {
    const stripe = createStripeClient();
    const intent = await stripe.getPaymentIntent(c.req.param('id'));
    return c.json(intent);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Create or get Stripe customer
 * POST /api/payments/customers
 */
app.post('/api/payments/customers', async (c) => {
  try {
    const stripe = createStripeClient();
    const body = await c.req.json<{ email: string; name?: string; metadata?: Record<string, string> }>();

    if (!body.email) {
      return c.json({ error: 'email is required' }, 400);
    }

    // Return existing customer if one exists
    const existing = await stripe.getCustomerByEmail(body.email);
    if (existing) return c.json(existing);

    const customer = await stripe.createCustomer(body);
    return c.json(customer, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * List Stripe products and prices
 * GET /api/payments/products
 */
app.get('/api/payments/products', async (c) => {
  try {
    const stripe = createStripeClient();
    const products = await stripe.listProducts();
    const prices = await stripe.listPrices();
    return c.json({ products, prices });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Create Stripe subscription
 * POST /api/payments/subscriptions
 */
app.post('/api/payments/subscriptions', async (c) => {
  try {
    const stripe = createStripeClient();
    const body = await c.req.json<{ customerId: string; priceId: string; trialPeriodDays?: number }>();

    if (!body.customerId || !body.priceId) {
      return c.json({ error: 'customerId and priceId are required' }, 400);
    }

    const subscription = await stripe.createSubscription(body);
    return c.json(subscription, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * Stripe webhook handler
 * POST /api/payments/webhook
 * Note: This route is intentionally outside the Converter key middleware
 * so Stripe can POST without needing a key.
 */
app.post('/api/payments/webhook', async (c) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeSecret || !webhookSecret) {
      return c.json({ error: 'Stripe not configured' }, 503);
    }

    const rawBody = await c.req.text();
    const signature = c.req.header('stripe-signature') ?? '';

    const { StripeClient } = await import('../integrations/stripe');
    const stripe = new StripeClient({ secretKey: stripeSecret, webhookSecret });
    const event = stripe.verifyWebhook(rawBody, signature);

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded:', event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('📋 Subscription update:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('❌ Subscription cancelled:', event.data.object);
        break;
      default:
        console.log('Stripe event:', event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    return c.json({ error: String(error) }, 400);
  }
});

// ============================================================================
// Server-Sent Events (SSE) for real-time updates
// ============================================================================

/**
 * SSE endpoint for breath updates
 */
app.get('/api/events/breath', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection message
      sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

      // Subscribe to breath updates
      const breathHandler = (data: any) => {
        sendEvent(data);
      };

      orchestratorClient.on('breath', breathHandler);

      // Cleanup on close
      return () => {
        orchestratorClient.off('breath', breathHandler);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

/**
 * SSE endpoint for status updates
 */
app.get('/api/events/status', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      sendEvent({ type: 'connected', timestamp: new Date().toISOString() });

      const statusHandler = (data: any) => {
        sendEvent(data);
      };

      orchestratorClient.on('status', statusHandler);

      return () => {
        orchestratorClient.off('status', statusHandler);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

// ============================================================================
// Server Startup
// ============================================================================

async function startBridge() {
  console.log('🌉 Starting BlackRoad OS Bridge Service...');

  // Initialize orchestrator client
  orchestratorClient = new OrchestratorClient(ORCHESTRATOR_URL);

  // Wait for initial connection
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('⚠ Orchestrator not immediately available, continuing anyway...');
      resolve();
    }, 5000);

    orchestratorClient.once('connected', () => {
      clearTimeout(timeout);
      console.log('✅ Connected to orchestrator');
      resolve();
    });
  });

  // Start HTTP server
  console.log(`🚀 Bridge service listening on http://localhost:${BRIDGE_PORT}`);

  serve({
    fetch: app.fetch,
    port: BRIDGE_PORT,
  });
}

// Start the bridge if this is the main module
if (require.main === module) {
  startBridge().catch((error) => {
    console.error('❌ Failed to start bridge:', error);
    process.exit(1);
  });
}

export { app, OrchestratorClient };
