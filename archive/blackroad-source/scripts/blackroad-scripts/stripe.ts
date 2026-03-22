import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  })
}

export const stripe = getStripe()

export async function createStripeCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
}) {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      ...params.metadata,
      created_via: 'blackroad_api',
    },
  })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  })
}

export async function createPortalSession(params: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })
}
