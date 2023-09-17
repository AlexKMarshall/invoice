import * as z from "zod";

import type {
  CompleteInvoiceItem,
  CompletePaymentTerm,
  CompleteUser,
} from "./index";
import {
  RelatedInvoiceItemModel,
  RelatedPaymentTermModel,
  RelatedUserModel,
} from "./index";

export const InvoiceModel = z.object({
  id: z.string(),
  fid: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  billFromStreet: z.string(),
  billFromCity: z.string(),
  billFromPostCode: z.string(),
  billFromCountry: z.string(),
  clientName: z.string(),
  clientEmail: z.string(),
  billToStreet: z.string(),
  billToCity: z.string(),
  billToPostCode: z.string(),
  billToCountry: z.string(),
  invoiceDate: z.string(),
  paymentTermId: z.string(),
  projectDescription: z.string(),
  status: z.enum(["draft", "pending", "paid"]),
});

export interface CompleteInvoice extends z.infer<typeof InvoiceModel> {
  user: CompleteUser;
  paymentTerm: CompletePaymentTerm;
  items: CompleteInvoiceItem[];
}

/**
 * RelatedInvoiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedInvoiceModel: z.ZodSchema<CompleteInvoice> = z.lazy(() =>
  InvoiceModel.extend({
    user: RelatedUserModel,
    paymentTerm: RelatedPaymentTermModel,
    items: RelatedInvoiceItemModel.array(),
  }),
);
