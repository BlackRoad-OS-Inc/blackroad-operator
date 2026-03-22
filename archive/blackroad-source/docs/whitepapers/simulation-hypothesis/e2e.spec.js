// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Evidence Explorer (index.html)', () => {
  test('loads and shows the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Simulation');
    await expect(page.locator('h1')).toContainText('Hypothesis');
  });

  test('shows 81 evidence items count', async ({ page }) => {
    await page.goto('/');
    const resultCount = page.locator('#result-count');
    await expect(resultCount).toContainText('81');
  });

  test('search box is present and functional', async ({ page }) => {
    await page.goto('/');
    const searchBox = page.locator('#search');
    await expect(searchBox).toBeVisible();
    await searchBox.fill('DNA');
    const resultCount = page.locator('#result-count');
    await expect(resultCount).not.toContainText('81 of 81');
  });

  test('filter buttons are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button.filter-btn')).toHaveCount(7);
  });

  test('grid renders evidence cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#grid .card');
    const cards = page.locator('#grid .card');
    await expect(cards).toHaveCount(81);
  });

  test('clicking a card opens modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#grid .card');
    await page.locator('#grid .card').first().click();
    const modal = page.locator('#modal');
    await expect(modal).toBeVisible();
  });

  test('modal can be closed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#grid .card');
    await page.locator('#grid .card').first().click();
    await page.locator('.modal-close').click();
    const modal = page.locator('#modal');
    await expect(modal).not.toBeVisible();
  });

  test('stats row shows correct figures', async ({ page }) => {
    await page.goto('/');
    const stats = page.locator('.stat-num');
    const texts = await stats.allTextContents();
    expect(texts).toContain('81');
  });

  test('page has valid title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Simulation Hypothesis/i);
  });
});

test.describe('VR / 3D App (vr.html)', () => {
  test('loads and shows the overlay heading', async ({ page }) => {
    await page.goto('/vr.html');
    await expect(page.locator('#overlay h1')).toContainText('SIMULATION HYPOTHESIS');
  });

  test('enter desktop button is present', async ({ page }) => {
    await page.goto('/vr.html');
    await expect(page.locator('#btn-desktop')).toBeVisible();
  });

  test('enter VR button is present', async ({ page }) => {
    await page.goto('/vr.html');
    await expect(page.locator('#btn-vr')).toBeVisible();
  });

  test('page has a valid title', async ({ page }) => {
    await page.goto('/vr.html');
    await expect(page).toHaveTitle(/.+/);
  });
});

test.describe('QR page (qr.html)', () => {
  test('loads without error', async ({ page }) => {
    const response = await page.goto('/qr.html');
    expect(response?.status()).toBe(200);
  });
});

test.describe('Manifest and assets', () => {
  test('manifest.json is accessible and valid', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    const json = JSON.parse(body ?? '{}');
    expect(json.name).toBeTruthy();
    expect(json.description).toBeTruthy();
  });

  test('icon.svg is accessible', async ({ page }) => {
    const response = await page.goto('/icon.svg');
    expect(response?.status()).toBe(200);
  });
});
