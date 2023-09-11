import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginPage } from "tests/playwright-utils";

test("user can create invoice", async ({ page }) => {
  await loginPage({ page });

  const clientName = faker.person.fullName();

  await page.goto("/invoices");

  // Expect a title "to contain" a substring.
  await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible();

  await page.getByRole("link", { name: /new invoice/i }).click();

  const billFromFieldset = await page.getByRole("group", {
    name: /bill from/i,
  });
  await billFromFieldset
    .getByRole("textbox", { name: /street address/i })
    .fill(faker.location.streetAddress());
  await billFromFieldset
    .getByRole("textbox", { name: /city/i })
    .fill(faker.location.city());
  await billFromFieldset
    .getByRole("textbox", { name: /post code/i })
    .fill(faker.location.zipCode());
  await billFromFieldset
    .getByRole("textbox", { name: /country/i })
    .fill(faker.location.country());

  const billToFieldset = await page.getByRole("group", {
    name: /bill to/i,
  });
  await billToFieldset
    .getByRole("textbox", { name: "Client's Name" })
    .fill(clientName);
  await billToFieldset
    .getByRole("textbox", { name: "Client's Email" })
    .fill(faker.internet.email());
  await billToFieldset
    .getByRole("textbox", { name: /street address/i })
    .fill(faker.location.streetAddress());
  await billToFieldset
    .getByRole("textbox", { name: /city/i })
    .fill(faker.location.city());
  await billToFieldset
    .getByRole("textbox", { name: /post code/i })
    .fill(faker.location.zipCode());
  await billToFieldset
    .getByRole("textbox", { name: /country/i })
    .fill(faker.location.country());
  await page
    .getByRole("textbox", { name: /invoice date/i })
    .fill(faker.date.past().toDateString());
  await page.getByRole("textbox", { name: /payment terms/i }).fill("30");
  await page
    .getByRole("textbox", { name: /project description/i })
    .fill(faker.lorem.sentence());

  await page.getByRole("button", { name: /save & send/i }).click();

  await expect(page.getByText(clientName)).toBeVisible();
});