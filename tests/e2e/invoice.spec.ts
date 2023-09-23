import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'
import { format } from 'date-fns'
import { makeInvoice } from 'tests/factories/invoice'

import { expect, test } from '../playwright-utils'

function getLatestInvoiceItem(page: Page) {
  return page
    .getByRole('group')
    .filter({ has: page.getByRole('textbox', { name: /item name/i }) })
    .last()
}

test('user can create invoice', async ({ page, isJsEnabled, login }) => {
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
  const projectDescription = faker.commerce.productDescription()

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
  // TODO: extract to an abstraction
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isJsEnabled) {
    await page
      .getByLabel(/payment terms/i)
      .selectOption({ label: 'Net 30 Days' })
  } else {
    await page.getByLabel(/payment terms/i).click()
    await page.getByRole('option', { name: /net 30 days/i }).click()
  }
  await page
    .getByRole('textbox', { name: /project description/i })
    .fill(projectDescription)

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
  // await expect(page.getByText(`Due ${expectedDueDate}`)).toBeVisible()

  // View invoice detail
  const invoiceItem = await page
    .getByRole('listitem')
    .filter({ has: page.getByText(clientName) })
  if (isJsEnabled) {
    // If JS is enabled the whole item should be clickable
    await invoiceItem.getByText(clientName).click()
  } else {
    // Otherwise only the link will be clickable
    await invoiceItem.getByRole('link').click()
  }

  await expect(page.getByText(projectDescription)).toBeVisible()
})

test('user can filter invoices', async ({
  page,
  login,
  existingInvoices,
  isJsEnabled,
}) => {
  const user = await login()
  const [draftInvoice, pendingInvoice, paidInvoice] = await existingInvoices(
    makeInvoice({ userId: user.id, status: 'draft' }),
    makeInvoice({ userId: user.id, status: 'pending' }),
    makeInvoice({ userId: user.id, status: 'paid' }),
  )

  await page.goto('/invoices')

  await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible()

  await expect(page.getByText(draftInvoice.clientName)).toBeVisible()
  await expect(page.getByText(pendingInvoice.clientName)).toBeVisible()
  await expect(page.getByText(paidInvoice.clientName)).toBeVisible()

  // Filter only draft invoices
  // TODO: create abstraction
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isJsEnabled) {
    // Is there a better accessible role for a disclosure summary?
    await page.getByText(/filter/i).click()
    await page.getByRole('checkbox', { name: /draft/i }).check()
    await page.getByRole('button', { name: /apply/i }).click()
  } else {
    await page.getByRole('button', { name: /filter/i }).click()
    await page.getByRole('checkbox', { name: /draft/i }).check()
    // close the popover
    await page.getByRole('heading', { name: /invoices/i }).click()
  }

  await expect(page.getByText(draftInvoice.clientName)).toBeVisible()
  await expect(page.getByText(pendingInvoice.clientName)).toBeHidden()
  await expect(page.getByText(paidInvoice.clientName)).toBeHidden()

  // Filter draft and pending invoices
  // TODO: create abstraction
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isJsEnabled) {
    // Is there a better accessible role for a disclosure summary?
    await page.getByText(/filter/i).click()
    await page.getByRole('checkbox', { name: /pending/i }).check()
    await page.getByRole('button', { name: /apply/i }).click()
  } else {
    await page.getByRole('button', { name: /filter/i }).click()
    await page.getByRole('checkbox', { name: /pending/i }).check()
    // close the popover
    await page.getByRole('heading', { name: /invoices/i }).click()
  }

  await expect(page.getByText(draftInvoice.clientName)).toBeVisible()
  await expect(page.getByText(pendingInvoice.clientName)).toBeVisible()
  await expect(page.getByText(paidInvoice.clientName)).toBeHidden()

  // Filter draft, pending and paid invoices
  // TODO: create abstraction
  // eslint-disable-next-line playwright/no-conditional-in-test
  if (isJsEnabled) {
    // Is there a better accessible role for a disclosure summary?
    await page.getByText(/filter/i).click()
    await page.getByRole('checkbox', { name: /paid/i }).check()
    await page.getByRole('button', { name: /apply/i }).click()
  } else {
    await page.getByRole('button', { name: /filter/i }).click()
    await page.getByRole('checkbox', { name: /paid/i }).check()
    // close the popover
    await page.getByRole('heading', { name: /invoices/i }).click()
  }
})

test('mark invoice as paid', async ({ page, login, existingInvoices }) => {
  const user = await login()
  const [draftInvoice, pendingInvoice, paidInvoice] = await existingInvoices(
    makeInvoice({ userId: user.id, status: 'draft' }),
    makeInvoice({ userId: user.id, status: 'pending' }),
    makeInvoice({ userId: user.id, status: 'paid' }),
  )

  await page.goto(`/invoices/${pendingInvoice.fid}`)

  await expect(page.getByText(pendingInvoice.clientName)).toBeVisible()
  await expect(page.getByText(/pending/i)).toBeVisible()

  await page.getByRole('button', { name: /mark as paid/i }).click()

  await expect(page.getByText(/pending/i)).toBeHidden()
  await expect(page.getByText(/paid/i)).toBeVisible()

  // action not available on draft or paid invoices
  await page.goto(`/invoices/${draftInvoice.fid}`)
  await expect(page.getByRole('button', { name: /mark as paid/i })).toBeHidden()

  await page.goto(`/invoices/${paidInvoice.fid}`)
  await expect(page.getByRole('button', { name: /mark as paid/i })).toBeHidden()
})
