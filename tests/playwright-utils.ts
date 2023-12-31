import { expect, test as testBase } from '@playwright/test'
import * as setCookieParser from 'set-cookie-parser'

import { prisma } from '~/db.server'
import { getSessionExpirationDate, sessionKey } from '~/utils/auth.server'
import { sessionStorage } from '~/utils/session.server'

import { insertNewInvoice, insertNewUser } from './db-utils'

export type TestOptions = {
  isJsDisabled: boolean
}

const test = testBase.extend<
  {
    login: (user?: { id: string }) => Promise<{ id: string; email: string }>
    existingInvoices: (
      ...invoicesToCreate: Array<Parameters<typeof insertNewInvoice>[0]>
    ) => Promise<Array<Awaited<ReturnType<typeof insertNewInvoice>>>>
  } & TestOptions
>({
  isJsDisabled: [false, { option: true }],
  login: async ({ page }, use) => {
    let userId: string | undefined = undefined
    await use(async (givenUser) => {
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

      await page
        .context()
        .addCookies([{ ...cookieConfig, domain: 'localhost' }])

      userId = user.id

      return user
    })

    // Clean up
    await prisma.user
      .delete({
        where: {
          id: userId,
        },
      })
      .catch(() => {})
  },
  existingInvoices: async ({}, use) => {
    let invoices: Array<Awaited<ReturnType<typeof insertNewInvoice>>> = []
    await use(async (...invoicesToCreate) => {
      invoices = await Promise.all(
        invoicesToCreate.map((invoice) => insertNewInvoice(invoice)),
      )

      return invoices
    })

    // Clean up
    await prisma.invoice.deleteMany({
      where: {
        id: {
          in: invoices.map((invoice) => invoice.id),
        },
      },
    })
  },
})

export * from './db-utils'
export { expect, test }
