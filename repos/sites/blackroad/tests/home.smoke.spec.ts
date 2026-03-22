import { test, expect } from "@playwright/test";

test.describe("home smoke", () => {
  test("shows desktop launchers and opens API agent", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Welcome to Blackroad/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Enter Portal/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore Roadview/i })).toBeVisible();
  });
});
