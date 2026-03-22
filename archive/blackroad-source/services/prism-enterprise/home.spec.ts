import { test, expect } from "@playwright/test";

test("home renders landing hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Welcome to Blackroad/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter Portal/i })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Focused features for builders/i })
  ).toBeVisible();
});

test("status page fetches /api/health.json", async ({ page }) => {
  await page.goto("/status.html");
  await expect(page.getByRole("heading", { name: /^Status$/i })).toBeVisible();
  await expect(page.getByText(/Error fetching status/i)).toBeVisible();
});

test("portal chat interface renders", async ({ page }) => {
  await page.goto("/portal.html#/chat");
  await expect(page.getByRole("heading", { name: /Creator Ops Portal/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Chat$/ })).toBeVisible();
  await expect(page.getByPlaceholder("Type…")).toBeVisible();
});
