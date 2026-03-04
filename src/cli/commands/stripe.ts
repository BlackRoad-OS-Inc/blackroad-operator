// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import { GatewayClient } from '../../core/client.js'
import { logger } from '../../core/logger.js'
import { createSpinner } from '../../core/spinner.js'
import { formatTable } from '../../formatters/table.js'
import chalk from 'chalk'

const STRIPE_BASE = 'https://api.stripe.com/v1'

// Canonical pricing (must match br-stripe.sh and the worker)
const PRICING = {
  pro: { monthly: 2900, yearly: 29000 },
  enterprise: { monthly: 19900, yearly: 199000 },
} as const

function getStripeKey(): string {
  const key = process.env['STRIPE_SECRET_KEY']
  if (!key) {
    logger.error('STRIPE_SECRET_KEY not set.')
    logger.info('Set it: export STRIPE_SECRET_KEY=sk_live_...')
    process.exit(1)
  }
  return key
}

async function stripeGet<T>(path: string): Promise<T> {
  const key = getStripeKey()
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Stripe GET ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function stripePost<T>(path: string, body: Record<string, string>): Promise<T> {
  const key = getStripeKey()
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Stripe POST ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

function fmtCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ─── Stripe command group ────────────────────────────────────────────────────

export const stripeCommand = new Command('stripe').description('Stripe payment management')

// ── revenue ──────────────────────────────────────────────────────────────────

stripeCommand
  .command('revenue')
  .alias('rev')
  .description('Revenue dashboard — MRR, ARR, balance')
  .action(async () => {
    const spin = createSpinner('Fetching revenue data...')
    spin.start()

    try {
      const balance = await stripeGet<{
        available: { amount: number; currency: string }[]
        pending: { amount: number; currency: string }[]
      }>('/balance')

      const availUsd = balance.available.find((b) => b.currency === 'usd')?.amount ?? 0
      const pendUsd = balance.pending.find((b) => b.currency === 'usd')?.amount ?? 0

      const subs = await stripeGet<{
        data: { id: string; status: string; items: { data: { price: { unit_amount: number; recurring: { interval: string } } }[] } }[]
      }>('/subscriptions?status=active&limit=100')

      let mrr = 0
      for (const sub of subs.data) {
        for (const item of sub.items.data) {
          const amount = item.price.unit_amount
          const interval = item.price.recurring?.interval
          if (interval === 'year') {
            mrr += Math.round(amount / 12)
          } else {
            mrr += amount
          }
        }
      }

      spin.stop()

      console.log(chalk.magenta.bold('\n  BlackRoad Revenue Dashboard\n'))
      console.log(`  Available Balance:  ${chalk.green(fmtCents(availUsd))}`)
      console.log(`  Pending Balance:    ${chalk.yellow(fmtCents(pendUsd))}`)
      console.log(`  Active Subs:        ${chalk.cyan(String(subs.data.length))}`)
      console.log(`  MRR:                ${chalk.magenta.bold(fmtCents(mrr))}`)
      console.log(`  ARR:                ${chalk.magenta.bold(fmtCents(mrr * 12))}`)
      console.log()
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── customers ────────────────────────────────────────────────────────────────

stripeCommand
  .command('customers')
  .description('List recent customers')
  .option('--search <email>', 'Search by email')
  .action(async (opts: { search?: string }) => {
    const spin = createSpinner('Fetching customers...')
    spin.start()

    try {
      let customers: { id: string; email: string; name: string }[]

      if (opts.search) {
        const res = await stripeGet<{ data: typeof customers }>(
          `/customers/search?query=email:'${opts.search}'`,
        )
        customers = res.data
      } else {
        const res = await stripeGet<{ data: typeof customers }>('/customers?limit=20')
        customers = res.data
      }

      spin.stop()

      if (customers.length === 0) {
        logger.warn('No customers found.')
        return
      }

      const rows = customers.map((c) => [c.id, c.email ?? '—', c.name ?? '—'])
      console.log()
      console.log(formatTable(['Customer ID', 'Email', 'Name'], rows))
      console.log()
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── subscriptions ────────────────────────────────────────────────────────────

stripeCommand
  .command('subscriptions')
  .alias('subs')
  .description('List active subscriptions')
  .action(async () => {
    const spin = createSpinner('Fetching subscriptions...')
    spin.start()

    try {
      const res = await stripeGet<{
        data: {
          id: string
          customer: string
          status: string
          cancel_at_period_end: boolean
          items: { data: { price: { unit_amount: number; recurring: { interval: string } } }[] }
        }[]
      }>('/subscriptions?status=active&limit=50')

      spin.stop()

      if (res.data.length === 0) {
        logger.warn('No active subscriptions.')
        return
      }

      const rows = res.data.map((s) => {
        const amount = s.items.data[0]?.price?.unit_amount ?? 0
        const interval = s.items.data[0]?.price?.recurring?.interval ?? '—'
        const status = s.cancel_at_period_end ? 'canceling' : s.status
        return [s.id, s.customer, fmtCents(amount), interval, status]
      })

      console.log()
      console.log(formatTable(['Subscription', 'Customer', 'Amount', 'Interval', 'Status'], rows))
      console.log()
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── products ─────────────────────────────────────────────────────────────────

stripeCommand
  .command('products')
  .description('List products and prices')
  .action(async () => {
    const spin = createSpinner('Fetching products...')
    spin.start()

    try {
      const res = await stripeGet<{
        data: { id: string; name: string; active: boolean; description: string }[]
      }>('/products?active=true&limit=20')

      spin.stop()

      if (res.data.length === 0) {
        logger.warn('No products found.')
        return
      }

      const rows = res.data.map((p) => [
        p.id,
        p.name,
        p.active ? chalk.green('active') : chalk.gray('inactive'),
        p.description ?? '—',
      ])

      console.log()
      console.log(formatTable(['Product ID', 'Name', 'Status', 'Description'], rows))
      console.log()
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── setup ────────────────────────────────────────────────────────────────────

stripeCommand
  .command('setup')
  .description('Create canonical BlackRoad OS products and prices in Stripe')
  .action(async () => {
    const spin = createSpinner('Creating BlackRoad OS pricing...')
    spin.start()

    try {
      // Pro product
      const proProd = await stripePost<{ id: string }>('/products', {
        name: 'BlackRoad OS Pro',
        description: '100 AI Agents, 10K tasks/mo, priority support',
        'metadata[tier_id]': 'pro',
      })

      const proMonthly = await stripePost<{ id: string }>('/prices', {
        product: proProd.id,
        unit_amount: String(PRICING.pro.monthly),
        currency: 'usd',
        'recurring[interval]': 'month',
        'metadata[tier_id]': 'pro',
      })

      const proYearly = await stripePost<{ id: string }>('/prices', {
        product: proProd.id,
        unit_amount: String(PRICING.pro.yearly),
        currency: 'usd',
        'recurring[interval]': 'year',
        'metadata[tier_id]': 'pro',
      })

      // Enterprise product
      const entProd = await stripePost<{ id: string }>('/products', {
        name: 'BlackRoad OS Enterprise',
        description: 'Unlimited agents, SSO, SLA, dedicated support',
        'metadata[tier_id]': 'enterprise',
      })

      const entMonthly = await stripePost<{ id: string }>('/prices', {
        product: entProd.id,
        unit_amount: String(PRICING.enterprise.monthly),
        currency: 'usd',
        'recurring[interval]': 'month',
        'metadata[tier_id]': 'enterprise',
      })

      const entYearly = await stripePost<{ id: string }>('/prices', {
        product: entProd.id,
        unit_amount: String(PRICING.enterprise.yearly),
        currency: 'usd',
        'recurring[interval]': 'year',
        'metadata[tier_id]': 'enterprise',
      })

      spin.stop()

      console.log(chalk.green.bold('\n  Products and prices created:\n'))
      console.log(`  Pro Product:          ${proProd.id}`)
      console.log(`    Monthly ($29):      ${proMonthly.id}`)
      console.log(`    Yearly ($290):      ${proYearly.id}`)
      console.log(`  Enterprise Product:   ${entProd.id}`)
      console.log(`    Monthly ($199):     ${entMonthly.id}`)
      console.log(`    Yearly ($1,990):    ${entYearly.id}`)
      console.log()
      console.log(chalk.yellow('  Set these as worker secrets:'))
      console.log(`    wrangler secret put STRIPE_PRICE_PRO_MONTHLY   # ${proMonthly.id}`)
      console.log(`    wrangler secret put STRIPE_PRICE_PRO_YEARLY    # ${proYearly.id}`)
      console.log(`    wrangler secret put STRIPE_PRICE_ENT_MONTHLY   # ${entMonthly.id}`)
      console.log(`    wrangler secret put STRIPE_PRICE_ENT_YEARLY    # ${entYearly.id}`)
      console.log()
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── checkout ─────────────────────────────────────────────────────────────────

stripeCommand
  .command('checkout')
  .description('Create a checkout session via the payment worker')
  .requiredOption('--tier <tier>', 'Plan tier (pro, enterprise)')
  .requiredOption('--period <period>', 'Billing period (monthly, yearly)')
  .option('--email <email>', 'Customer email')
  .option('--worker-url <url>', 'Payment worker URL', 'https://blackroad-stripe.blackroad.workers.dev')
  .action(async (opts: { tier: string; period: string; email?: string; workerUrl: string }) => {
    const spin = createSpinner('Creating checkout session...')
    spin.start()

    try {
      const body: Record<string, string> = { tier: opts.tier, period: opts.period }
      if (opts.email) body.customer_email = opts.email

      const res = await fetch(`${opts.workerUrl}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = (await res.json()) as { ok: boolean; checkout_url?: string; error?: string }
      spin.stop()

      if (data.ok && data.checkout_url) {
        logger.success('Checkout session created')
        console.log(`\n  ${chalk.cyan(data.checkout_url)}\n`)
      } else {
        logger.error(data.error ?? 'Failed to create checkout session')
      }
    } catch (err) {
      spin.stop()
      logger.error((err as Error).message)
    }
  })

// ── health ───────────────────────────────────────────────────────────────────

stripeCommand
  .command('health')
  .description('Check Stripe worker health')
  .option('--worker-url <url>', 'Payment worker URL', 'https://blackroad-stripe.blackroad.workers.dev')
  .action(async (opts: { workerUrl: string }) => {
    try {
      const res = await fetch(`${opts.workerUrl}/health`)
      const data = (await res.json()) as Record<string, unknown>
      logger.success('Stripe worker is online')
      console.log()
      for (const [key, value] of Object.entries(data)) {
        if (key === 'ok') continue
        console.log(`  ${chalk.gray(key)}: ${value}`)
      }
      console.log()
    } catch {
      logger.error('Stripe worker is unreachable.')
    }
  })
