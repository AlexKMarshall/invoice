import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("create invoice", async ({ page }) => {
  const clientName = faker.person.fullName();

  await page.goto("/invoices");

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();

  await page.getByRole("link", { name: /new invoice/i }).click();

  await page.getByRole("textbox", { name: "Client's Name" }).fill(clientName);
  await page.getByRole("button", { name: /save & send/i }).click();
  await expect(page.getByText(clientName)).toBeVisible();
});
