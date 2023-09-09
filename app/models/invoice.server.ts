import { prisma } from "~/db.server";

export function getInvoiceListItems() {
  return prisma.invoice.findMany({
    select: {
      id: true,
      clientName: true,
    },
  });
}
