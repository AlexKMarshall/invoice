import type { Invoice } from "@prisma/client";
import { prisma } from "~/db.server";

export function getInvoiceListItems() {
  return prisma.invoice.findMany({
    select: {
      id: true,
      clientName: true,
    },
  });
}

export function createInvoice(data: Pick<Invoice, "clientName">) {
  return prisma.invoice.create({
    data,
  });
}
