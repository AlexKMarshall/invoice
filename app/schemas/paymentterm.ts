import * as z from 'zod'

import type { CompleteInvoice } from './index'
import { RelatedInvoiceModel } from './index'

export const PaymentTermModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  days: z.number().int(),
})

export interface CompletePaymentTerm extends z.infer<typeof PaymentTermModel> {
  invoices: CompleteInvoice[]
}

/**
 * RelatedPaymentTermModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPaymentTermModel: z.ZodSchema<CompletePaymentTerm> = z.lazy(
  () =>
    PaymentTermModel.extend({
      invoices: RelatedInvoiceModel.array(),
    }),
)
