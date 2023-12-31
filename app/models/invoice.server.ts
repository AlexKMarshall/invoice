import type { Invoice, InvoiceItem, User } from '@prisma/client'
import { add, format } from 'date-fns'
import { z } from 'zod'

import { prisma } from '~/db.server'
import { InvoiceItemModel, InvoiceModel, PaymentTermModel } from '~/schemas'
import { getCurrencyParts } from '~/utils/currency'
import { generateFid } from '~/utils/misc'

export async function getInvoiceListItems({
  where: filter,
}: { where?: { status?: Array<Invoice['status']> } } = {}) {
  const rawInvoices = await prisma.invoice.findMany({
    select: {
      id: true,
      fid: true,
      clientName: true,
      invoiceDate: true,
      status: true,
      currency: true,
      items: {
        select: {
          price: true,
          quantity: true,
        },
      },
      paymentTerm: {
        select: {
          days: true,
        },
      },
    },
    where: {
      status: {
        in: filter?.status,
      },
    },
  })

  return z
    .array(
      InvoiceModel.pick({
        id: true,
        fid: true,
        clientName: true,
        invoiceDate: true,
        status: true,
        currency: true,
      }).extend({
        items: z.array(InvoiceItemModel.pick({ price: true, quantity: true })),
        paymentTerm: PaymentTermModel.pick({ days: true }),
      }),
    )
    .parse(rawInvoices)
    .map(({ items, invoiceDate, paymentTerm, currency, ...invoice }) => {
      const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      )
      const totalParts = getCurrencyParts(total, { currency })
      const dueDate = format(
        add(new Date(invoiceDate), { days: paymentTerm.days }),
        'dd MMM yyyy',
      )
      return {
        ...invoice,
        total,
        totalParts,
        dueDate,
      }
    })
}

export async function getInvoiceDetail({
  where,
}: {
  where: { id: Invoice['id'] } | { fid: Invoice['fid'] }
}) {
  const rawInvoice = await prisma.invoice.findUnique({
    where,
    select: {
      id: true,
      fid: true,
      projectDescription: true,
      billFromStreet: true,
      billFromCity: true,
      billFromPostCode: true,
      billFromCountry: true,
      invoiceDate: true,
      clientName: true,
      clientEmail: true,
      billToStreet: true,
      billToCity: true,
      billToPostCode: true,
      billToCountry: true,
      currency: true,
      status: true,
      paymentTerm: {
        select: {
          days: true,
        },
      },
      items: {
        select: {
          name: true,
          price: true,
          quantity: true,
          id: true,
        },
      },
    },
  })

  if (!rawInvoice) {
    throw new InvoiceNotFoundError()
  }

  return InvoiceModel.pick({
    id: true,
    fid: true,
    projectDescription: true,
    billFromStreet: true,
    billFromCity: true,
    billFromPostCode: true,
    billFromCountry: true,
    invoiceDate: true,
    clientName: true,
    clientEmail: true,
    billToStreet: true,
    billToCity: true,
    billToPostCode: true,
    billToCountry: true,
    currency: true,
    status: true,
  })
    .extend({
      paymentTerm: PaymentTermModel.pick({ days: true }),
      items: z.array(
        InvoiceItemModel.pick({
          name: true,
          price: true,
          quantity: true,
          id: true,
        }),
      ),
    })
    .transform(({ paymentTerm, items, ...invoice }) => {
      const amountDue = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      )
      return {
        ...invoice,
        dueDate: format(
          add(new Date(invoice.invoiceDate), { days: paymentTerm.days }),
          'dd MMM yyyy',
        ),
        items: items.map(({ price, ...item }) => ({
          ...item,
          priceParts: getCurrencyParts(price, { currency: invoice.currency }),
          totalParts: getCurrencyParts(price * item.quantity, {
            currency: invoice.currency,
          }),
        })),
        amountDueParts: getCurrencyParts(amountDue, {
          currency: invoice.currency,
        }),
      }
    })
    .parse(rawInvoice)
}

export function getPaymentTerms() {
  return prisma.paymentTerm.findMany({
    select: { id: true, name: true },
    orderBy: {
      days: 'asc',
    },
  })
}

export type InvoiceToCreate = Pick<
  Invoice,
  | 'billFromStreet'
  | 'billFromCity'
  | 'billFromPostCode'
  | 'billFromCountry'
  | 'clientName'
  | 'clientEmail'
  | 'billToStreet'
  | 'billToCity'
  | 'billToPostCode'
  | 'billToCountry'
  | 'invoiceDate'
  | 'paymentTermId'
  | 'projectDescription'
> & { userId: User['id'] } & {
  items: Array<Pick<InvoiceItem, 'name' | 'quantity' | 'price'>>
  status: 'pending'
}

export async function createInvoice({
  userId,
  items,
  paymentTermId,
  ...data
}: InvoiceToCreate) {
  const fid = await generateFid({
    isFidUnique: async (fid) => {
      const count = await prisma.invoice.count({ where: { fid } })
      return count === 0
    },
  })
  return prisma.invoice.create({
    data: {
      ...data,
      fid,
      user: {
        connect: {
          id: userId,
        },
      },
      items: {
        create: items,
      },
      paymentTerm: {
        connect: {
          id: paymentTermId,
        },
      },
    },
  })
}

export class InvoiceNotFoundError extends Error {
  constructor() {
    super('Invoice not found')
  }
}

export class InvoiceNotPendingError extends Error {
  constructor() {
    super('Invoice is not pending')
  }
}

export async function markAsPaid({
  where,
}: {
  where: { id: Invoice['id'] } | { fid: Invoice['fid'] }
}) {
  const invoice = InvoiceModel.pick({
    status: true,
  }).parse(await prisma.invoice.findUnique({ where }))

  if (!invoice) {
    throw new InvoiceNotFoundError()
  }

  if (invoice.status !== 'pending') {
    throw new InvoiceNotPendingError()
  }

  return prisma.invoice.update({
    where,
    data: {
      status: 'paid',
    },
  })
}

export class DeleteNotAllowedError extends Error {
  constructor() {
    super('Invoice cannot be deleted')
  }
}

export async function deleteInvoice({
  where,
}: {
  where: { id: Invoice['id'] } | { fid: Invoice['fid'] }
}) {
  const invoice = InvoiceModel.pick({
    status: true,
  }).parse(await prisma.invoice.findUnique({ where }))

  if (!invoice) {
    throw new InvoiceNotFoundError()
  }

  if (invoice.status === 'paid') {
    throw new DeleteNotAllowedError()
  }

  return prisma.invoice.delete({ where })
}
