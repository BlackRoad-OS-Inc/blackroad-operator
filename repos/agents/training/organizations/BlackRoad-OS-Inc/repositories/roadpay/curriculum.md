# roadpay — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

BlackRoad's own billing system. D1 stores all subscription logic, plans, invoices, and metering. Stripe is used only as a card charger — BlackRoad owns the billing data. 4 plans (Starter free, Pro $29, Team $99, Enterprise custom) + 3 add-ons (Extra TOPS $19, Custom Models $49, Priority Inference $9). ~1046 lines of Worker code.

## Key Files

- `src/worker.js` — Complete Worker (~1046 lines): plan management, subscriptions, invoices, Stripe webhooks, usage metering, admin endpoints
- `wrangler.toml` — Worker config, D1 binding, Stripe secret
- `package.json` — Dependencies

## Architecture

```
User → RoadPay Worker → D1 (plans, subscriptions, invoices)
                           ↓
                    Stripe (card charging only)
                           ↓
                    Webhook → Worker → D1 update
```

## Learning Objectives

1. Understand the "own your billing" philosophy — D1 is the source of truth, not Stripe
2. Read the plan/subscription/invoice data model in D1
3. Trace a subscription lifecycle: signup → charge → webhook → activate
4. Understand Stripe webhook verification and handling
5. Know the admin endpoints for plan and subscription management

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and list all API routes
- [ ] Identify the D1 tables (plans, subscriptions, invoices, usage)
- [ ] Trace the Stripe webhook flow: what happens when a payment succeeds?

### Level 2: Contributor
- [ ] Add input validation to the subscription creation endpoint
- [ ] Add a new field to the invoice response
- [ ] Fix any error handling gaps in webhook processing

### Level 3: Builder
- [ ] Add usage metering (track API calls per subscription)
- [ ] Implement proration for mid-cycle plan changes
- [ ] Add a customer portal endpoint for self-service billing

### Level 4: Architect
- [ ] Design multi-currency support
- [ ] Propose an audit trail for all billing mutations
- [ ] Review the Stripe integration for security best practices
