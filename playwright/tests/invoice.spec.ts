import { test, expect } from "@playwright/test";

test("create invoice", async ({ page }) => {
  await page.goto("/invoices");

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();

  await page.getByRole("link", { name: /new invoice/i }).click();

  await page
    .getByRole("textbox", { name: /client's name/i })
    .fill("Test Client");
  await page.getByRole("button", { name: /save & send/i }).click();
  await expect(page.getByText(/test client/i)).toBeVisible();
});
