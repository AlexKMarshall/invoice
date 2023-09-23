import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { UniqueEnforcer } from 'enforce-unique'

import { prisma } from '~/db.server'
import type { InvoiceToCreate } from '~/models/invoice.server'
import { getPasswordHash } from '~/models/user.server'
import type { CompleteInvoice } from '~/schemas'
import { generateFid } from '~/utils/misc'

const uniqueUsernameEnforcer = new UniqueEnforcer()

export function createUsername() {
  return uniqueUsernameEnforcer.enforce(() => faker.internet.email())
}

export function createPassword(password: string = faker.internet.password()) {
  return {
    hash: bcrypt.hashSync(password, 10),
  }
}

export async function insertNewUser({
  username = createUsername(),
  password = username,
}: { username?: string; password?: string } = {}) {
  const user = await prisma.user.create({
    select: { id: true, email: true },
    data: {
      email: username,
      password: {
        create: {
          hash: await getPasswordHash(password),
        },
      },
    },
  })
  return user
}

export async function insertNewInvoice({
  userId,
  items,
  paymentTermId,
  ...data
}: Omit<InvoiceToCreate, 'status'> & { status: CompleteInvoice['status'] }) {
  const fid = await generateFid({
    isFidUnique: async (fid) => {
      const count = await prisma.invoice.count({ where: { fid } })
      return count === 0
    },
  })
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
  })
}
