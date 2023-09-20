import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { UniqueEnforcer } from 'enforce-unique'

import { prisma } from '~/db.server'
import { getPasswordHash } from '~/models/user.server'

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
  username,
  password,
}: { username?: string; password?: string } = {}) {
  username ??= createUsername()
  password ??= username

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
