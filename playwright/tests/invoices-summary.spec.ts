import { test, expect } from "@playwright/test";

test("has heading", async ({ page }) => {
  await page.goto("/invoices");

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();

  await expect(page.getByText(/john smith/i)).toBeVisible();
});
