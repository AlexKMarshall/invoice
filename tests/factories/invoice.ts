import { faker } from '@faker-js/faker'
import type { PartialDeep, SetRequired } from 'type-fest'

import type { InvoiceToCreate } from '~/models/invoice.server'

export function makeInvoice(
  overrides: SetRequired<PartialDeep<InvoiceToCreate>, 'userId'>,
): InvoiceToCreate {
  const billFromStreet = faker.location.streetAddress()
  const billFromCity = faker.location.city()
  const billFromPostCode = faker.location.zipCode()
  const billFromCountry = faker.location.country()
  const clientName = faker.person.fullName()
  const clientEmail = faker.internet.email()
  const billToStreet = faker.location.streetAddress()
  const billToCity = faker.location.city()
  const billToPostCode = faker.location.zipCode()
  const billToCountry = faker.location.country()
  const invoiceDate = faker.date.past().toDateString()
  const paymentTermId = faker.helpers.arrayElement([
    'net-1',
    'net-7',
    'net-14',
    'net-30',
  ])
  const projectDescription = faker.company.buzzPhrase()
  const status = faker.helpers.arrayElement(['pending'] as const)

  return {
    billFromStreet,
    billFromCity,
    billFromPostCode,
    billFromCountry,
    clientName,
    clientEmail,
    billToStreet,
    billToCity,
    billToPostCode,
    billToCountry,
    invoiceDate,
    paymentTermId,
    projectDescription,
    status,
    ...overrides,
    items: (
      overrides.items ?? Array.from({ length: faker.number.int({ max: 10 }) })
    ).map(makeInvoiceItem),
  }
}

export function makeInvoiceItem(
  overrides?: PartialDeep<InvoiceToCreate['items'][number]>,
) {
  const name = faker.commerce.productName()
  const quantity = faker.number.int({ max: 100 })
  const price = faker.number.int({ max: 10_000 })

  return {
    name,
    quantity,
    price,
    ...overrides,
  }
}
