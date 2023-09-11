import type { Invoice, InvoiceItem, User } from "@prisma/client";

import { prisma } from "~/db.server";

export function getInvoiceListItems() {
  return prisma.invoice.findMany({
    select: {
      id: true,
      clientName: true,
    },
  });
}

export function createInvoice({
  userId,
  items,
  ...data
}: Pick<
  Invoice,
  | "billFromStreet"
  | "billFromCity"
  | "billFromPostCode"
  | "billFromCountry"
  | "clientName"
  | "clientEmail"
  | "billToStreet"
  | "billToCity"
  | "billToPostCode"
  | "billToCountry"
  | "invoiceDate"
  | "paymentTerms"
  | "projectDescription"
> & { userId: User["id"] } & {
  items: Array<Pick<InvoiceItem, "name" | "quantity" | "price">>;
}) {
  return prisma.invoice.create({
    data: {
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
      items: {
        create: items,
      },
    },
  });
}
