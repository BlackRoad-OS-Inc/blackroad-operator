// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('ROAD Dashboard — smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/ROAD.*BlackRoad OS/i);
  });

  test('hero section displays ROAD heading and tagline', async ({ page }) => {
    const hero = page.locator('section.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toContainText('ROAD');
    await expect(hero).toContainText(/revenue-backed/i);
  });

  test('navigation links are present', async ({ page }) => {
    const nav = page.locator('nav');
    for (const href of ['#balance', '#economics', '#compute', '#mining', '#reserve', '#payments']) {
      await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });

  test('live balance section displays ROAD amount', async ({ page }) => {
    const balanceEl = page.locator('#balance-display');
    await expect(balanceEl).toBeVisible();
    await expect(balanceEl).toContainText('ROAD');
  });

  test('economics stats row renders key metrics', async ({ page }) => {
    const statsRow = page.locator('#economics .stats-row');
    await expect(statsRow).toBeVisible();
    // At least 4 stat items present
    await expect(statsRow.locator('.stat-item')).toHaveCount(6);
  });

  test('revenue stream section shows 5 active cards', async ({ page }) => {
    const badges = page.locator('.card .badge-green');
    // 5 active revenue streams + 1 verified reserve badge
    await expect(badges).toHaveCount(6);
  });

  test('proof of reserve section shows BTC address', async ({ page }) => {
    const reserveSection = page.locator('#reserve');
    await expect(reserveSection).toBeVisible();
    await expect(reserveSection.locator('.btc-address')).toContainText('bc1q');
  });

  test('payments section lists transactions', async ({ page }) => {
    const paymentList = page.locator('#payments .payment-list');
    await expect(paymentList).toBeVisible();
    await expect(paymentList.locator('.payment-item')).toHaveCount(5);
  });

  test('Get Access CTA button is present', async ({ page }) => {
    const cta = page.locator('#get-access');
    await expect(cta).toBeVisible();
    await expect(cta.locator('.btn-stripe')).toBeVisible();
  });

  test('footer contains copyright notice', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('BlackRoad OS');
    await expect(footer).toContainText('2026');
  });
});

test.describe('ROAD Dashboard — mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('page renders without horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('hero is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('section.hero h1')).toBeVisible();
  });
});
