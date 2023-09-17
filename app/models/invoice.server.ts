import type { Invoice, InvoiceItem, User } from "@prisma/client";
import { add, format } from "date-fns";
import { z } from "zod";

import { prisma } from "~/db.server";
import { InvoiceItemModel, InvoiceModel, PaymentTermModel } from "~/schemas";

export async function getInvoiceListItems() {
  const rawInvoices = await prisma.invoice.findMany({
    select: {
      id: true,
      fid: true,
      clientName: true,
      invoiceDate: true,
      status: true,
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
  });

  return z
    .array(
      InvoiceModel.pick({
        id: true,
        fid: true,
        clientName: true,
        invoiceDate: true,
        status: true,
      }).extend({
        items: z.array(InvoiceItemModel.pick({ price: true, quantity: true })),
        paymentTerm: PaymentTermModel.pick({ days: true }),
      }),
    )
    .parse(rawInvoices)
    .map(({ items, invoiceDate, paymentTerm, ...invoice }) => {
      const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const dueDate = format(
        add(new Date(invoiceDate), { days: paymentTerm.days }),
        "dd MMM yyyy",
      );
      return {
        ...invoice,
        total,
        dueDate,
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

export async function createInvoice({
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
  status: "pending";
}) {
  const fid = await generateFid({
    isFidUnique: async (fid) => {
      const count = await prisma.invoice.count({ where: { fid } });
      return count === 0;
    },
  });
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
  });
}

export function generateFid({
  isFidUnique,
  maxIterations = 10,
}: {
  isFidUnique?: (fid: string) => Promise<boolean>;
  maxIterations?: number;
} = {}) {
  function generator() {
    // generate a 2 character string of random capital letters
    const prefix = Array.from({ length: 2 })
      .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65))
      .join("");
    // generate a 4 digit number
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    return prefix + suffix;
  }

  let iterations = 0;

  async function generateUniqueFid() {
    if (iterations >= maxIterations) {
      throw new Error(
        "Could not generate a unique fid. Max iterations reached.",
      );
    }
    iterations++;

    const fid = generator();
    const isUnique = (await isFidUnique?.(fid)) ?? true;
    if (isUnique) {
      return fid;
    } else {
      return generateUniqueFid();
    }
  }

  return generateUniqueFid();
}
