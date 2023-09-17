import * as z from "zod";

import type { CompleteInvoice } from "./index";
import { RelatedInvoiceModel } from "./index";

export const InvoiceItemModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  quantity: z.number().int(),
  price: z.number().int(),
  invoiceId: z.string(),
});

export interface CompleteInvoiceItem extends z.infer<typeof InvoiceItemModel> {
  Invoice: CompleteInvoice;
}

/**
 * RelatedInvoiceItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedInvoiceItemModel: z.ZodSchema<CompleteInvoiceItem> = z.lazy(
  () =>
    InvoiceItemModel.extend({
      Invoice: RelatedInvoiceModel,
    }),
);
