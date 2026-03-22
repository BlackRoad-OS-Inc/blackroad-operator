# Tutorial 08: Webhooks and Events

## Overview

React to real-world events: GitHub pushes, Stripe payments, sensor readings, etc.

## Receive a Webhook

```typescript
import { createWebhookServer } from "@blackroad/sdk/webhooks";

const server = createWebhookServer({
  port: 4000,
});

// Listen for GitHub push events
server.on("github.push", async (payload) => {
  const { repo, commits, pusher } = payload;
  console.log(`${pusher.name} pushed ${commits.length} commits to ${repo.name}`);
  
  // Auto-deploy on push to main
  if (payload.ref === "refs/heads/main") {
    await client.assignTask({
      type: "deploy",
      description: `Deploy ${repo.name} — ${commits[0].message}`,
      agent: "ALICE",
      metadata: { repo: repo.name, sha: commits[0].id },
    });
  }
});

// Listen for Stripe payment
server.on("stripe.payment_intent.succeeded", async (payload) => {
  const { amount, currency, customer } = payload;
  await client.remember({
    key: `payment:${customer}`,
    value: { amount, currency, ts: Date.now() },
    type: "fact",
  });
  console.log(`Payment received: ${amount / 100} ${currency.toUpperCase()}`);
});

server.start();
console.log("Webhook server listening on :4000");
```

## Publish Events (Outgoing)

```typescript
import { EventBus } from "@blackroad/sdk/events";

const bus = new EventBus({ url: process.env.BLACKROAD_GATEWAY_URL! });

// Publish an event
await bus.publish("agent.task.completed", {
  task_id: "t-001",
  agent: "ALICE",
  result: "Deployment successful",
  duration_ms: 4200,
});

// Subscribe to events
bus.subscribe("agent.task.*", (event) => {
  console.log(`Task event: ${event.type}`, event.data);
});
```

## Retry Logic

```typescript
// Webhooks auto-retry on failure
server.on("stripe.payment_intent.succeeded", async (payload) => {
  // If this throws, the webhook will retry with exponential backoff
  await processPayment(payload);
}, {
  maxRetries: 3,
  backoffMs: 1000,
  timeout: 30_000,
});
```

## Webhook Dashboard

```bash
br webhooks list          # All registered endpoints
br webhooks logs          # Recent delivery history
br webhooks replay <id>   # Replay a delivery
br webhooks test github   # Send a test GitHub event
```

## Next: [Tutorial 09 - Production Patterns](09-production.md)
