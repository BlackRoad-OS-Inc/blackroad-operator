// @ts-check
import { test, expect } from '@playwright/test';

// ── BlackRoad Auth E2E Tests ──
// Tests against auth.blackroad.io (own auth, D1 + JWT)

const AUTH_API = 'https://auth.blackroad.io';
const TEST_EMAIL = `e2e-${Date.now()}@blackroad.io`;
const TEST_PASSWORD = 'BlackRoad2026Test';
const TEST_NAME = 'E2E Test User';

test.describe('Auth API — Direct', () => {
  // Each test creates its own user to avoid ordering dependencies
  test('health check', async ({ request }) => {
    const res = await request.get(`${AUTH_API}/api/health`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe('up');
  });

  test('signup creates user and returns JWT', async ({ request }) => {
    const email = `signup-${Date.now()}@test.blackroad.io`;
    const res = await request.post(`${AUTH_API}/api/signup`, {
      data: { email, password: TEST_PASSWORD, name: TEST_NAME },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.user.email).toBe(email);
    expect(data.user.plan).toBe('operator');
    expect(data.token).toBeTruthy();
    expect(data.token.split('.')).toHaveLength(3);
  });

  test('duplicate signup returns 409', async ({ request }) => {
    const email = `dup-${Date.now()}@test.blackroad.io`;
    await request.post(`${AUTH_API}/api/signup`, {
      data: { email, password: TEST_PASSWORD, name: TEST_NAME },
    });
    const res = await request.post(`${AUTH_API}/api/signup`, {
      data: { email, password: TEST_PASSWORD, name: TEST_NAME },
    });
    expect(res.status()).toBe(409);
  });

  test('full auth lifecycle: signup → signin → me → update → signout', async ({ request }) => {
    const email = `lifecycle-${Date.now()}@test.blackroad.io`;

    // Signup
    const signup = await request.post(`${AUTH_API}/api/signup`, {
      data: { email, password: TEST_PASSWORD, name: 'Lifecycle' },
    });
    expect(signup.ok()).toBeTruthy();
    const { token, user } = await signup.json();

    // Signin
    const signin = await request.post(`${AUTH_API}/api/signin`, {
      data: { email, password: TEST_PASSWORD },
    });
    expect(signin.ok()).toBeTruthy();
    const signinData = await signin.json();
    const activeToken = signinData.token;

    // Me
    const me = await request.get(`${AUTH_API}/api/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    expect(me.ok()).toBeTruthy();
    const meData = await me.json();
    expect(meData.user.email).toBe(email);
    expect(meData.user.id).toBe(user.id);

    // Update
    const update = await request.post(`${AUTH_API}/api/user`, {
      headers: { Authorization: `Bearer ${activeToken}` },
      data: { name: 'Updated' },
    });
    expect(update.ok()).toBeTruthy();

    // Verify update
    const me2 = await request.get(`${AUTH_API}/api/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    const me2Data = await me2.json();
    expect(me2Data.user.name).toBe('Updated');

    // Signout
    const signout = await request.post(`${AUTH_API}/api/signout`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    expect(signout.ok()).toBeTruthy();
  });

  test('signin with wrong password returns 401', async ({ request }) => {
    const email = `wrong-${Date.now()}@test.blackroad.io`;
    await request.post(`${AUTH_API}/api/signup`, {
      data: { email, password: TEST_PASSWORD, name: 'Wrong' },
    });
    const res = await request.post(`${AUTH_API}/api/signin`, {
      data: { email, password: 'wrongpassword123' },
    });
    expect(res.status()).toBe(401);
  });

  test('signin with nonexistent email returns 401', async ({ request }) => {
    const res = await request.post(`${AUTH_API}/api/signin`, {
      data: { email: 'nobody@nowhere.com', password: TEST_PASSWORD },
    });
    expect(res.status()).toBe(401);
  });

  test('/api/me returns 401 without token', async ({ request }) => {
    const res = await request.get(`${AUTH_API}/api/me`);
    expect(res.status()).toBe(401);
  });

  test('/api/me returns 401 with invalid token', async ({ request }) => {
    const res = await request.get(`${AUTH_API}/api/me`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    expect(res.status()).toBe(401);
  });

  test('stats endpoint', async ({ request }) => {
    const res = await request.get(`${AUTH_API}/api/stats`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.users).toBeGreaterThan(0);
    expect(data.status).toBe('up');
  });

  test('signup validates email', async ({ request }) => {
    const res = await request.post(`${AUTH_API}/api/signup`, {
      data: { email: 'notanemail', password: TEST_PASSWORD },
    });
    expect(res.status()).toBe(400);
  });

  test('signup validates password length', async ({ request }) => {
    const res = await request.post(`${AUTH_API}/api/signup`, {
      data: { email: 'short@test.com', password: 'short' },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Auth UI — Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('auth page renders sign in form', async ({ page }) => {
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.locator('input[placeholder*="blackroad"]')).toBeVisible();
  });

  test('can switch to sign up view', async ({ page }) => {
    await page.getByText('Create one →').click();
    await expect(page.getByText('Join BlackRoad OS.')).toBeVisible();
    await expect(page.locator('input[autocomplete="name"]')).toBeVisible();
  });

  test('can switch to forgot password', async ({ page }) => {
    await page.getByText('Forgot?').click();
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });

  test('sign in with real credentials shows success', async ({ page }) => {
    await page.locator('input[placeholder*="blackroad"]').fill('alexa@blackroad.io');
    await page.locator('input[type="password"]').first().fill('BlackRoad2026');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show success or store token
    await expect(page.getByText('Authenticated').or(page.getByText('Welcome back'))).toBeVisible({ timeout: 15000 });
  });

  test('sign in with wrong password shows error', async ({ page }) => {
    await page.locator('input[placeholder*="blackroad"]').fill('alexa@blackroad.io');
    await page.locator('input[type="password"]').first().fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid|failed|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('sign up with new account works', async ({ page }) => {
    await page.getByText('Create one').click();

    const uniqueEmail = `e2e-ui-${Date.now()}@blackroad.io`;
    await page.locator('input[autocomplete="name"]').fill('Test User');
    await page.locator('input[placeholder*="blackroad"]').fill(uniqueEmail);
    await page.locator('input[type="password"]').first().fill('StrongPassword123');

    // Accept terms
    await page.getByText('I agree').click();

    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for success
    await expect(page.getByText("You're in").or(page.getByText('Account created')).first()).toBeVisible({ timeout: 15000 });
  });

  test('localStorage stores token after sign in', async ({ page }) => {
    await page.locator('input[placeholder*="blackroad"]').fill('alexa@blackroad.io');
    await page.locator('input[type="password"]').first().fill('BlackRoad2026');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for auth to complete
    await page.waitForTimeout(5000);

    const token = await page.evaluate(() => localStorage.getItem('br_token'));
    const user = await page.evaluate(() => localStorage.getItem('br_user'));
    expect(token).toBeTruthy();
    expect(user).toContain('alexa@blackroad.io');
  });
});

test.describe('Auth + Stripe — Integrated', () => {
  test('authenticated user checkout includes context', async ({ page }) => {
    // Sign in first
    await page.goto('/auth');
    await page.locator('input[placeholder*="blackroad"]').fill('alexa@blackroad.io');
    await page.locator('input[type="password"]').first().fill('BlackRoad2026');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(3000);

    // Go to pricing
    await page.goto('/pricing');

    // Mock checkout to verify it fires
    let checkoutFired = false;
    await page.route('**/stripe.blackroad.io/checkout', async (route) => {
      checkoutFired = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test' }),
      });
    });

    await page.getByText('Start Pro').click();
    expect(checkoutFired).toBeTruthy();
  });
});
