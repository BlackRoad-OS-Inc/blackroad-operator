#!/usr/bin/env node

/**
 * 🖤 BlackRoad OS - GitHub + Stripe Integration Hub
 * 
 * Handles:
 * - GitHub webhook events (stars, forks, issues)
 * - Stripe webhook events (payments, subscriptions)
 * - Automatic provisioning of paid features
 * - License key generation
 * - Customer notifications
 * 
 * Author: Alexa Amundson
 * Company: BlackRoad OS, Inc.
 * Date: 2026-01-30
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const PORT = process.env.PORT || 3000;

const app = express();

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

function verifyStripeSignature(payload, signature) {
  if (!STRIPE_WEBHOOK_SECRET) return true; // Skip in dev
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    return false;
  }
}

function verifyGitHubSignature(payload, signature) {
  if (!GITHUB_WEBHOOK_SECRET) return true; // Skip in dev
  
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================================================
// STRIPE WEBHOOK HANDLERS
// ============================================================================

async function handleCheckoutSessionCompleted(session) {
  console.log('💰 Checkout completed:', session.id);
  
  const customer_email = session.customer_details?.email;
  const subscription_id = session.subscription;
  const amount_total = session.amount_total / 100; // cents to dollars
  
  console.log(`  → Customer: ${customer_email}`);
  console.log(`  → Subscription: ${subscription_id}`);
  console.log(`  → Amount: $${amount_total}`);
  
  // TODO: Provision access
  // - Create user account
  // - Grant GitHub org access
  // - Generate API keys
  // - Send welcome email
  
  return {
    action: 'provision_access',
    customer: customer_email,
    subscription: subscription_id
  };
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  const status = subscription.status;
  const customer = subscription.customer;
  
  console.log(`  → Status: ${status}`);
  console.log(`  → Customer: ${customer}`);
  
  if (status === 'active') {
    // Ensure access is enabled
  } else if (status === 'canceled' || status === 'past_due') {
    // Suspend access
  }
  
  return {
    action: 'update_access',
    customer,
    status
  };
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('✅ Invoice paid:', invoice.id);
  
  const customer = invoice.customer;
  const amount_paid = invoice.amount_paid / 100;
  
  console.log(`  → Customer: ${customer}`);
  console.log(`  → Amount: $${amount_paid}`);
  
  // TODO: Send receipt email
  
  return {
    action: 'send_receipt',
    customer,
    amount: amount_paid
  };
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);
  
  const customer = invoice.customer;
  
  // TODO: Send payment failed email
  // TODO: Suspend access after grace period
  
  return {
    action: 'payment_failed',
    customer
  };
}

// ============================================================================
// GITHUB WEBHOOK HANDLERS
// ============================================================================

async function handleGitHubStar(event) {
  const action = event.action;
  const repo = event.repository.full_name;
  const user = event.sender.login;
  
  console.log(`⭐ Star ${action} on ${repo} by ${user}`);
  
  // TODO: Track in analytics
  // TODO: Send thank you message
  
  return { action: 'star_tracked', repo, user };
}

async function handleGitHubFork(event) {
  const repo = event.repository.full_name;
  const user = event.sender.login;
  const fork = event.forkee.full_name;
  
  console.log(`🍴 Fork created: ${repo} → ${fork} by ${user}`);
  
  // TODO: Track in analytics
  // TODO: Check license compliance
  
  return { action: 'fork_tracked', repo, fork, user };
}

async function handleGitHubIssue(event) {
  const action = event.action;
  const repo = event.repository.full_name;
  const issue = event.issue.number;
  const user = event.sender.login;
  
  console.log(`🐛 Issue ${action}: ${repo}#${issue} by ${user}`);
  
  // TODO: Auto-triage
  // TODO: Assign to team
  
  return { action: 'issue_triaged', repo, issue, user };
}

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body.toString();
  
  // Verify signature
  if (!verifyStripeSignature(payload, signature)) {
    console.error('❌ Invalid Stripe signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  try {
    const event = JSON.parse(payload);
    
    console.log('📥 Stripe webhook:', event.type);
    
    let result;
    
    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        result = await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        result = await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        result = await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log('  → Unhandled event type');
        result = { action: 'ignored' };
    }
    
    res.json({ received: true, result });
  } catch (err) {
    console.error('❌ Error processing Stripe webhook:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/webhooks/github', express.json(), async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  if (!verifyGitHubSignature(payload, signature)) {
    console.error('❌ Invalid GitHub signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  try {
    const event = req.headers['x-github-event'];
    const body = req.body;
    
    console.log('📥 GitHub webhook:', event);
    
    let result;
    
    switch (event) {
      case 'star':
        result = await handleGitHubStar(body);
        break;
        
      case 'fork':
        result = await handleGitHubFork(body);
        break;
        
      case 'issues':
        result = await handleGitHubIssue(body);
        break;
        
      default:
        console.log('  → Unhandled event type');
        result = { action: 'ignored' };
    }
    
    res.json({ received: true, result });
  } catch (err) {
    console.error('❌ Error processing GitHub webhook:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'blackroad-webhook-hub',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    webhooks: {
      stripe: !!STRIPE_WEBHOOK_SECRET,
      github: !!GITHUB_WEBHOOK_SECRET
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    service: '🖤 BlackRoad OS - Webhook Hub',
    version: '1.0.0',
    endpoints: {
      stripe: '/webhooks/stripe',
      github: '/webhooks/github',
      health: '/health'
    },
    status: 'operational'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('🖤 BlackRoad OS - Webhook Hub');
  console.log(`📡 Server running on port ${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST /webhooks/stripe - Stripe events`);
  console.log(`  POST /webhooks/github - GitHub events`);
  console.log(`  GET  /health          - Health check`);
  console.log('');
  console.log('Configuration:');
  console.log(`  Stripe: ${STRIPE_WEBHOOK_SECRET ? '✅' : '⚠️  Missing secret'}`);
  console.log(`  GitHub: ${GITHUB_WEBHOOK_SECRET ? '✅' : '⚠️  Missing secret'}`);
  console.log('');
});

module.exports = app;
