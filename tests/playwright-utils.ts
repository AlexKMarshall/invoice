import type { Page } from "@playwright/test";
import { test } from "@playwright/test";
import { prisma } from "~/db.server";
import { insertNewUser, insertedUsers } from "./db-utils";
import { USER_SESSION_KEY, sessionStorage } from "~/session.server";
import * as setCookieParser from "set-cookie-parser";

export * from "./db-utils";

export async function loginPage({
  page,
  user: givenUser,
}: {
  page: Page;
  user?: { id: string };
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
    : await insertNewUser();

  const cookieSession = await sessionStorage.getSession();
  cookieSession.set(USER_SESSION_KEY, user.id);
  const cookieConfig = setCookieParser.parseString(
    await sessionStorage.commitSession(cookieSession),
  ) as any;

  console.log("cookieConfig", cookieConfig);

  await page.context().addCookies([{ ...cookieConfig, domain: "localhost" }]);

  return user;
}

test.afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      id: { in: Array.from(insertedUsers) },
    },
  });
  insertedUsers.clear();
});
