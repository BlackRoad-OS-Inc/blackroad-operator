/**
 * 🚀 NEXT.JS API ROUTES FOR CLERK + STRIPE INTEGRATION
 *
 * Save these files in your Next.js project:
 * - pages/api/webhooks/clerk.js
 * - pages/api/webhooks/stripe.js
 */

// ============================================================
// FILE: pages/api/webhooks/clerk.js
// ============================================================

import { handleClerkWebhook } from '@/lib/clerk-stripe-integration';

export const config = {
  api: {
    bodyParser: false, // Clerk needs raw body for verification
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await getRawBody(req);
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };

    await handleClerkWebhook(payload, headers);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

// ============================================================
// FILE: pages/api/webhooks/stripe.js
// ============================================================

import { handleStripeWebhook } from '@/lib/clerk-stripe-integration';

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body for signature verification
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    await handleStripeWebhook(payload, signature);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

// ============================================================
// FILE: lib/clerk-api.js (Helper to update Clerk users)
// ============================================================

import { clerkClient } from '@clerk/nextjs/server';

/**
 * Update Clerk user metadata with Stripe info
 */
export async function updateClerkUserWithStripeInfo(userId, stripeData) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        stripe_customer_id: stripeData.customerId,
        stripe_subscription_id: stripeData.subscriptionId,
        stripe_subscription_status: stripeData.status,
        stripe_plan: stripeData.plan,
      },
    });

    console.log(`✅ Updated Clerk user ${userId} with Stripe info`);
  } catch (error) {
    console.error(`❌ Failed to update Clerk user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get Clerk user by Stripe customer ID
 */
export async function getClerkUserByStripeCustomerId(customerId) {
  try {
    const users = await clerkClient.users.getUserList({
      limit: 1,
      query: customerId, // Search in metadata
    });

    return users[0] || null;
  } catch (error) {
    console.error('Failed to find Clerk user:', error);
    return null;
  }
}

// ============================================================
// FILE: lib/stripe-helpers.js
// ============================================================

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create or retrieve Stripe customer for Clerk user
 */
export async function getOrCreateStripeCustomer(clerkUser) {
  const { id, emailAddresses, firstName, lastName, publicMetadata } = clerkUser;

  // Check if customer already exists
  if (publicMetadata?.stripe_customer_id) {
    try {
      const customer = await stripe.customers.retrieve(
        publicMetadata.stripe_customer_id
      );
      return customer;
    } catch (error) {
      console.warn('Stripe customer not found, creating new one');
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: emailAddresses[0].emailAddress,
    name: `${firstName} ${lastName}`.trim(),
    metadata: {
      clerk_user_id: id,
    },
  });

  // Update Clerk user with Stripe customer ID
  await clerkClient.users.updateUserMetadata(id, {
    publicMetadata: {
      stripe_customer_id: customer.id,
    },
  });

  return customer;
}

/**
 * Create checkout session for user
 */
export async function createCheckoutSession(clerkUser, priceId, successUrl, cancelUrl) {
  const customer = await getOrCreateStripeCustomer(clerkUser);

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      clerk_user_id: clerkUser.id,
    },
  });

  return session;
}

/**
 * Create customer portal session
 */
export async function createPortalSession(clerkUser, returnUrl) {
  const customer = await getOrCreateStripeCustomer(clerkUser);

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: returnUrl,
  });

  return session;
}

export { stripe };
