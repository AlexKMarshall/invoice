import type { Invoice, User } from "@prisma/client";
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
  ...data
}: Pick<Invoice, "clientName"> & { userId: User["id"] }) {
  return prisma.invoice.create({
    data: {
      ...data,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
