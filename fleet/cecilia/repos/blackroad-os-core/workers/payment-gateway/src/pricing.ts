/**
 * BlackRoad OS Canonical Pricing - Single Source of Truth
 *
 * All pricing pages, checkout flows, and billing logic MUST reference this file.
 * Stripe price IDs are read from Worker environment secrets at runtime.
 *
 * Confirmed tiers:
 *   Free       $0
 *   Pro        $29/mo   $290/yr
 *   Enterprise $199/mo  $1,990/yr
 *   Custom     contact sales
 */

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  agentLimit: number;
  trialDays: number;
  /** Env var name holding the real Stripe price ID */
  stripePriceEnvMonthly: string;
  /** Env var name holding the real Stripe price ID */
  stripePriceEnvYearly: string;
  cta: string;
  popular?: boolean;
}

export const PRICING: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '3 AI Agents',
      '100 tasks/month',
      'Community support',
      'Basic analytics',
      'Public API (rate-limited)',
    ],
    agentLimit: 3,
    trialDays: 0,
    stripePriceEnvMonthly: '',
    stripePriceEnvYearly: '',
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      '100 AI Agents',
      '10,000 tasks/month',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access (unlimited)',
      'Webhook notifications',
    ],
    agentLimit: 100,
    trialDays: 14,
    stripePriceEnvMonthly: 'STRIPE_PRICE_PRO_MONTHLY',
    stripePriceEnvYearly: 'STRIPE_PRICE_PRO_YEARLY',
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 199,
    priceYearly: 1990,
    features: [
      'Unlimited AI Agents',
      'Unlimited tasks',
      '24/7 phone + Slack support',
      'Custom analytics dashboards',
      'Dedicated account manager',
      'On-premise deployment option',
      'SLA guarantees (99.9%)',
      'SSO / SAML',
      'Audit logs',
    ],
    agentLimit: -1,
    trialDays: 14,
    stripePriceEnvMonthly: 'STRIPE_PRICE_ENT_MONTHLY',
    stripePriceEnvYearly: 'STRIPE_PRICE_ENT_YEARLY',
    cta: 'Start Free Trial',
  },
  {
    id: 'custom',
    name: 'Enterprise Custom',
    priceMonthly: -1,
    priceYearly: -1,
    features: [
      'Everything in Enterprise',
      'Custom agent limits',
      'White-label options',
      'Custom SLA',
      'Dedicated infrastructure',
      'Professional services',
      'Volume discounts',
    ],
    agentLimit: -1,
    trialDays: 0,
    stripePriceEnvMonthly: '',
    stripePriceEnvYearly: '',
    cta: 'Contact Sales',
  },
];

/** Lookup a tier by id */
export function getTier(id: string): PricingTier | undefined {
  return PRICING.find((t) => t.id === id);
}

/** Get the Stripe price ID for a tier from env, returns empty string if not set */
export function getStripePriceId(
  tier: PricingTier,
  period: 'monthly' | 'yearly',
  env: Record<string, string>,
): string {
  const key = period === 'yearly' ? tier.stripePriceEnvYearly : tier.stripePriceEnvMonthly;
  if (!key) return '';
  return (env as any)[key] || '';
}
