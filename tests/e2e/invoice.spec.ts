import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'
import { add, format } from 'date-fns'

import { expect, test } from '../playwright-utils'

function getLatestInvoiceItem(page: Page) {
  return page
    .getByRole('group')
    .filter({ has: page.getByRole('textbox', { name: /item name/i }) })
    .last()
}

test('user can create invoice', async ({ page, isOffline, login }) => {
  await login()

  const clientName = faker.person.fullName()
  const quantity1 = faker.number.int({ min: 1, max: 100 })
  const price1 = faker.number.int({ min: 1, max: 100 })
  const quantity2 = faker.number.int({ min: 1, max: 100 })
  const price2 = faker.number.int({ min: 1, max: 100 })
  const expectedTotal = new Intl.NumberFormat('en-GB').format(
    quantity1 * price1 + quantity2 * price2,
  )
  const invoiceDate = faker.date.past()
  const expectedDueDate = format(add(invoiceDate, { days: 30 }), 'dd MMM yyyy')

  await page.goto('/invoices')

  await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible()

  await page.getByRole('link', { name: /new invoice/i }).click()

  const billFromFieldset = page.getByRole('group', {
    name: /bill from/i,
  })
  await billFromFieldset
    .getByRole('textbox', { name: /street address/i })
    .fill(faker.location.streetAddress())
  await billFromFieldset
    .getByRole('textbox', { name: /city/i })
    .fill(faker.location.city())
  await billFromFieldset
    .getByRole('textbox', { name: /post code/i })
    .fill(faker.location.zipCode())
  await billFromFieldset
    .getByRole('textbox', { name: /country/i })
    .fill(faker.location.country())

  const billToFieldset = page.getByRole('group', {
    name: /bill to/i,
  })
  await billToFieldset
    .getByRole('textbox', { name: "Client's Name" })
    .fill(clientName)
  await billToFieldset
    .getByRole('textbox', { name: "Client's Email" })
    .fill(faker.internet.email())
  await billToFieldset
    .getByRole('textbox', { name: /street address/i })
    .fill(faker.location.streetAddress())
  await billToFieldset
    .getByRole('textbox', { name: /city/i })
    .fill(faker.location.city())
  await billToFieldset
    .getByRole('textbox', { name: /post code/i })
    .fill(faker.location.zipCode())
  await billToFieldset
    .getByRole('textbox', { name: /country/i })
    .fill(faker.location.country())
  await page
    .getByRole('textbox', { name: /invoice date/i })
    .fill(format(invoiceDate, 'y-MM-dd'))
  // Todo extract to an abstraction
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isOffline) {
    await page
      .getByLabel(/payment terms/i)
      .selectOption({ label: 'Net 30 Days' })
  } else {
    await page.getByLabel(/payment terms/i).click()
    await page.getByRole('option', { name: /net 30 days/i }).click()
  }
  await page
    .getByRole('textbox', { name: /project description/i })
    .fill(faker.lorem.sentence())

  const firstInvoiceItemFieldset = await getLatestInvoiceItem(page)

  await firstInvoiceItemFieldset
    .getByRole('textbox', { name: /item name/i })
    .fill(faker.commerce.productName())
  await firstInvoiceItemFieldset
    .getByRole('textbox', { name: /qty/i })
    .fill(String(quantity1))
  await firstInvoiceItemFieldset
    .getByRole('textbox', { name: /price/i })
    .fill(String(price1))

  await page.getByRole('button', { name: /add item/i }).click()

  // wait for there to be two invoice items
  await expect(
    page.getByRole('group').filter({
      has: page.getByRole('textbox', { name: /item name/i }),
    }),
  ).toHaveCount(2)

  const secondInvoiceItemFieldset = await getLatestInvoiceItem(page)

  await secondInvoiceItemFieldset
    .getByRole('textbox', { name: /item name/i })
    .fill(faker.commerce.productName())
  await secondInvoiceItemFieldset
    .getByRole('textbox', { name: /qty/i })
    .fill(String(quantity2))
  await secondInvoiceItemFieldset
    .getByRole('textbox', { name: /price/i })
    .fill(String(price2))

  await page.getByRole('button', { name: /save & send/i }).click()

  await expect(page.getByText(clientName)).toBeVisible()
  await expect(page.getByText(String(expectedTotal))).toBeVisible()
  await expect(page.getByText(`Due ${expectedDueDate}`)).toBeVisible()
})
