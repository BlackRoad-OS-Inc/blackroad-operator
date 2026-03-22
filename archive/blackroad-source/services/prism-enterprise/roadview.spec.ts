import { expect, test } from "@playwright/test";

test("team dropdown filters items", async ({ page }) => {
  await page.goto("/portal.html#/roadview");
  await expect(page.getByRole("heading", { name: /RoadView/i })).toBeVisible();
  await page.getByRole("combobox", { name: "Team" }).selectOption("alpha");
  await expect(page.getByText("Quest Engine")).toBeVisible();
  await expect(page.getByText("City Skyline")).toBeHidden();
});
