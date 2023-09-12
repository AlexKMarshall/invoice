import type { Invoice, InvoiceItem, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getInvoiceListItems() {
  const rawInvoices = await prisma.invoice.findMany({
    select: {
      id: true,
      clientName: true,
      items: {
        select: {
          price: true,
          quantity: true,
        },
      },
    },
  });

  return rawInvoices.map(({ items, ...invoice }) => {
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    return {
      ...invoice,
      total,
    };
  });
}

export function getPaymentTerms() {
  return prisma.paymentTerm.findMany({
    select: { id: true, name: true },
    orderBy: {
      days: "asc",
    },
  });
}

export function createInvoice({
  userId,
  items,
  paymentTermId,
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
  | "paymentTermId"
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
      paymentTerm: {
        connect: {
          id: paymentTermId,
        },
      },
    },
  });
}
