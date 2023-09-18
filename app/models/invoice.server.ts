import type { Invoice, InvoiceItem, User } from '@prisma/client'
import { add, format } from 'date-fns'
import { z } from 'zod'

import { prisma } from '~/db.server'
import type { CompleteInvoice } from '~/schemas'
import { InvoiceItemModel, InvoiceModel, PaymentTermModel } from '~/schemas'

const currencySymbolMap = {
  GBP: '£',
} as const

/**
 * Splits an array into subarrays, where each subarray contains either a single matching element
 * or non-matching elements from the original array, effectively separating matches from non-matches.
 *
 * @template T
 * @param {T[]} arr - The array to split.
 * @param {(element: T) => boolean} predicate - The predicate function to determine matches.
 * @returns {T[][]} An array of subarrays representing portions of the original array,
 *                  with each subarray containing either a matching element or non-matching elements.
 */
function splitArray<T>(arr: T[], predicate: (element: T) => boolean): T[][] {
  const result: T[][] = []
  let startIndex = 0

  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      if (i > startIndex) {
        result.push(arr.slice(startIndex, i))
      }
      result.push([arr[i]])
      startIndex = i + 1
    }
  }

  if (startIndex < arr.length) {
    result.push(arr.slice(startIndex))
  }

  return result.filter((subarray) => subarray.length > 0)
}

function getCurrencyParts(
  amount: number,
  {
    currency,
    locale = 'en-GB',
  }: { currency: CompleteInvoice['currency']; locale?: string },
) {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(amount)

  return splitArray(parts, (part) => part.type === 'currency').map((parts) =>
    parts.map((part) => part.value).join(''),
  )
}

export async function getInvoiceListItems() {
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
      const currencySymbol = currencySymbolMap[currency]
      return {
        ...invoice,
        total,
        totalParts,
        dueDate,
        currencySymbol,
      }
    })
}

export function getPaymentTerms() {
  return prisma.paymentTerm.findMany({
    select: { id: true, name: true },
    orderBy: {
      days: 'asc',
    },
  })
}

export async function createInvoice({
  userId,
  items,
  paymentTermId,
  ...data
}: Pick<
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
}) {
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

export function generateFid({
  isFidUnique,
  maxIterations = 10,
}: {
  isFidUnique?: (fid: string) => Promise<boolean>
  maxIterations?: number
} = {}) {
  function generator() {
    // generate a 2 character string of random capital letters
    const prefix = Array.from({ length: 2 })
      .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65))
      .join('')
    // generate a 4 digit number
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    return prefix + suffix
  }

  let iterations = 0

  async function generateUniqueFid() {
    if (iterations >= maxIterations) {
      throw new Error(
        'Could not generate a unique fid. Max iterations reached.',
      )
    }
    iterations++

    const fid = generator()
    const isUnique = (await isFidUnique?.(fid)) ?? true
    if (isUnique) {
      return fid
    } else {
      return generateUniqueFid()
    }
  }

  return generateUniqueFid()
}
