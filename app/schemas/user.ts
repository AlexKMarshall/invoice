import * as z from "zod"

import type { CompleteInvoice, CompleteNote, CompletePassword, CompleteSession} from "./index";
import { RelatedInvoiceModel, RelatedNoteModel, RelatedPasswordModel, RelatedSessionModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  password?: CompletePassword | null
  notes: CompleteNote[]
  Invoice: CompleteInvoice[]
  Session: CompleteSession[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  password: RelatedPasswordModel.nullish(),
  notes: RelatedNoteModel.array(),
  Invoice: RelatedInvoiceModel.array(),
  Session: RelatedSessionModel.array(),
}))
