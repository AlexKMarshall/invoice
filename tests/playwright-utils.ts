import type { Page } from '@playwright/test'
import { test } from '@playwright/test'
import * as setCookieParser from 'set-cookie-parser'

import { prisma } from '~/db.server'
import { getSessionExpirationDate, sessionKey } from '~/utils/auth.server'
import { sessionStorage } from '~/utils/session.server'

import { insertedUsers, insertNewUser } from './db-utils'

export * from './db-utils'

export async function loginPage({
  page,
  user: givenUser,
}: {
  page: Page
  user?: { id: string }
}) {
  const user = givenUser
    ? await prisma.user.findUniqueOrThrow({
        where: {
          id: givenUser.id,
        },
        select: {
          id: true,
          email: true,
        },
      })
    : await insertNewUser()
  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
    select: { id: true },
  })

  const cookieSession = await sessionStorage.getSession()
  cookieSession.set(sessionKey, session.id)
  const cookieConfig = setCookieParser.parseString(
    await sessionStorage.commitSession(cookieSession),
  ) as any

  await page.context().addCookies([{ ...cookieConfig, domain: 'localhost' }])

  return user
}

test.afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      id: { in: Array.from(insertedUsers) },
    },
  })
  insertedUsers.clear()
})
