import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
// import { loginPage } from "tests/playwright-utils";

test("user can create invoice", async ({ page }) => {
  // TODO: fix this
  // await loginPage({ page });

  const clientName = faker.person.fullName();

  await page.goto("/join");

  await page
    .getByRole("textbox", { name: /email/i })
    .fill(faker.internet.email());
  await page
    .getByRole("textbox", { name: /password/i })
    .fill(faker.internet.password());
  await page.getByRole("button").click();

  await page.goto("/invoices");

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();

  await page.getByRole("link", { name: /new invoice/i }).click();

  await page.getByRole("textbox", { name: "Client's Name" }).fill(clientName);
  await page.getByRole("button", { name: /save & send/i }).click();
  await expect(page.getByText(clientName)).toBeVisible();
});
