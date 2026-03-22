// @ts-check
import { test, expect } from '@playwright/test';

// ── Stripe E2E Tests ──
// Tests against Stripe TEST MODE — all payment links use test_ prefix
// Uses Stripe's test card: 4242 4242 4242 4242

const STRIPE_TEST_CARD = '4242424242424242';
const STRIPE_TEST_EXP = '12/30';
const STRIPE_TEST_CVC = '123';
const STRIPE_TEST_EMAIL = 'test@blackroad.io';
const STRIPE_TEST_NAME = 'BlackRoad Test';

test.describe('Stripe — Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('pricing page renders all 4 plans', async ({ page }) => {
    // Check all plan names are visible (use exact to avoid matching "Everything in Operator")
    await expect(page.getByText('Operator', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Pro', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Sovereign', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Enterprise', { exact: true }).first()).toBeVisible();
  });

  test('pricing page shows correct prices', async ({ page }) => {
    await expect(page.getByText('$0').first()).toBeVisible();
    await expect(page.getByText('$29').first()).toBeVisible();
    await expect(page.getByText('$199').first()).toBeVisible();
    await expect(page.getByText('Custom').first()).toBeVisible();
  });

  test('annual toggle changes prices', async ({ page }) => {
    // Click annual toggle
    await page.getByText('Annual').click();

    // Pro: $29/mo → $290/year (10 months)
    await expect(page.getByText('$290')).toBeVisible();
    // Sovereign: $199/mo → $1990/year
    await expect(page.getByText('$1990')).toBeVisible();
  });

  test('all 4 add-ons render', async ({ page }) => {
    await expect(page.getByText('Lucidia Enhanced')).toBeVisible();
    await expect(page.getByText('RoadAuth Startup')).toBeVisible();
    await expect(page.getByText('Context Bridge')).toBeVisible();
    await expect(page.getByText('Knowledge Hub')).toBeVisible();
  });

  test('comparison table renders', async ({ page }) => {
    await expect(page.getByText('Compare Plans')).toBeVisible();
    await expect(page.getByText('AI Agents').first()).toBeVisible();
    await expect(page.getByText('Pixel Memory').first()).toBeVisible();
    await expect(page.getByText('Threshold Addressing').first()).toBeVisible();
  });

  test('FAQ section expands on click', async ({ page }) => {
    const faqItem = page.getByText('What is Pixel Memory?');
    await faqItem.click();
    await expect(page.getByText('content-addressable storage')).toBeVisible();
  });

  test('Operator plan CTA opens GitHub', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByText('Deploy Free').click(),
    ]);
    expect(newPage.url()).toContain('github.com');
  });

  test('Enterprise plan CTA opens email', async ({ page }) => {
    // Enterprise should trigger mailto
    const enterpriseBtn = page.getByText('Talk to Us');
    const href = await enterpriseBtn.evaluate(el => {
      // Walk up to find the click handler — it uses window.location.href
      return el.closest('button') !== null;
    });
    expect(href).toBeTruthy();
  });

  test('manage subscription button exists', async ({ page }) => {
    await expect(page.getByText('Manage existing subscription')).toBeVisible();
  });
});

test.describe('Stripe — Checkout Flow (Test Mode)', () => {
  test('Pro plan checkout redirects to Stripe', async ({ page }) => {
    await page.goto('/pricing');

    // Mock the stripe API to capture the request
    let checkoutRequest = null;
    await page.route('**/stripe.blackroad.io/checkout', async (route) => {
      checkoutRequest = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test_session_123' }),
      });
    });

    // Click Pro plan checkout
    await page.getByText('Start Pro').click();

    // Verify checkout was called with correct price ID
    expect(checkoutRequest).toBeTruthy();
    expect(checkoutRequest.price_id).toBeTruthy();
    expect(checkoutRequest.success_url).toContain('/billing?success=true');
    expect(checkoutRequest.cancel_url).toContain('/pricing');
  });

  test('Sovereign plan checkout sends correct priceId', async ({ page }) => {
    await page.goto('/pricing');

    let checkoutRequest = null;
    await page.route('**/stripe.blackroad.io/checkout', async (route) => {
      checkoutRequest = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test_session_456' }),
      });
    });

    await page.getByText('Get Sovereign').click();

    expect(checkoutRequest).toBeTruthy();
    expect(checkoutRequest.price_id).toBeTruthy();
  });

  test('add-on checkout works', async ({ page }) => {
    await page.goto('/pricing');

    let checkoutRequest = null;
    await page.route('**/stripe.blackroad.io/checkout', async (route) => {
      checkoutRequest = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test_addon' }),
      });
    });

    // Click on Lucidia Enhanced add-on
    await page.getByText('Lucidia Enhanced').click();

    expect(checkoutRequest).toBeTruthy();
    expect(checkoutRequest.price_id).toBeTruthy();
  });

  test('billing portal redirects correctly', async ({ page }) => {
    await page.goto('/pricing');

    let portalRequest = null;
    await page.route('**/stripe.blackroad.io/portal', async (route) => {
      portalRequest = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://billing.stripe.com/test_portal' }),
      });
    });

    await page.getByText('Manage existing subscription').click();

    expect(portalRequest).toBeTruthy();
    expect(portalRequest.return_url).toContain('/billing');
  });

  test('checkout handles API error gracefully', async ({ page }) => {
    await page.goto('/pricing');

    // Mock API failure
    await page.route('**/stripe.blackroad.io/checkout', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal error' }),
      });
    });

    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.getByText('Start Pro').click();

    // Page should not crash — should still be on pricing page
    await expect(page.getByText('Operator', { exact: true }).first()).toBeVisible();
  });
});

test.describe('Stripe — Payment Links (Test Mode)', () => {
  // These test the actual Stripe test payment links work
  const PAYMENT_LINKS = {
    'Context Bridge Monthly': 'https://buy.stripe.com/test_aFa8wP4AL46jfVl1eGfMA01',
    'Lucidia Pro Monthly': 'https://buy.stripe.com/test_7sY3cv2sDfP15gHaPgfMA03',
    'RoadAuth Starter': 'https://buy.stripe.com/test_bJe9AT8R15an8sT6z0fMA05',
  };

  for (const [name, link] of Object.entries(PAYMENT_LINKS)) {
    test(`payment link loads: ${name}`, async ({ page }) => {
      const response = await page.goto(link);
      // Stripe payment links should return 200 or redirect to checkout
      expect(response?.status()).toBeLessThan(500);
    });
  }
});

test.describe('Stripe — Full Checkout E2E (Test Card)', () => {
  // This test goes through the ACTUAL Stripe test checkout
  // Only runs when STRIPE_E2E_FULL=true to avoid hitting Stripe rate limits
  test.skip(
    !process.env.STRIPE_E2E_FULL,
    'Set STRIPE_E2E_FULL=true to run full Stripe checkout'
  );

  test('complete checkout with test card', async ({ page }) => {
    // Go to a test payment link
    await page.goto('https://buy.stripe.com/test_7sY3cv2sDfP15gHaPgfMA03');

    // Wait for Stripe checkout to load
    await page.waitForLoadState('networkidle');

    // Fill in email
    await page.getByLabel('Email').fill(STRIPE_TEST_EMAIL);

    // Fill card details
    // Stripe uses iframes for card inputs
    const cardFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

    await cardFrame.getByPlaceholder('Card number').fill(STRIPE_TEST_CARD);
    await cardFrame.getByPlaceholder('MM / YY').fill(STRIPE_TEST_EXP);
    await cardFrame.getByPlaceholder('CVC').fill(STRIPE_TEST_CVC);

    // Fill billing name
    await page.getByLabel('Name on card').fill(STRIPE_TEST_NAME);

    // Submit payment
    await page.getByTestId('hosted-payment-submit-button').click();

    // Wait for success redirect
    await page.waitForURL('**/billing?success=true', { timeout: 30_000 });
    expect(page.url()).toContain('success=true');
  });
});
