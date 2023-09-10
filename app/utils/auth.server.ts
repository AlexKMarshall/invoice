import { sessionStorage } from "./session.server";
import type { ProviderUser } from "./providers/provider";
import { Authenticator } from "remix-auth";
import { prisma } from "~/db.server";
import { redirect } from "@remix-run/node";
import { z } from "zod";
import type { Password, User } from "@prisma/client";
import { combineHeaders } from "./misc";
import bcrypt from "bcryptjs";

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

export const authenticator = new Authenticator<ProviderUser>(sessionStorage);

const sessionIdSchema = z.string().nonempty();

export async function getUserId(request: Request) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionPayload = sessionIdSchema.safeParse(
    cookieSession.get(sessionKey),
  );
  if (!sessionPayload.success) return null;
  const sessionId = sessionPayload.data;
  const session = await prisma.session.findFirst({
    select: { user: { select: { id: true } } },
    where: { id: sessionId, expirationDate: { gt: new Date() } },
  });
  if (!session?.user) {
    throw redirect("/", {
      headers: {
        "set-cookie": await sessionStorage.destroySession(cookieSession),
      },
    });
  }
  return session.user.id;
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request);
  if (!userId) {
    /**
     * throw to the login page, with a redirect back to either the supplied redirectTo or the
     * current page
     */
    const requestUrl = new URL(request.url);
    redirectTo =
      redirectTo === null
        ? null
        : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`;
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    const loginRedirect = ["/login", loginParams?.toString()]
      .filter(Boolean)
      .join("?");
    throw redirect(loginRedirect);
  }
  return userId;
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function login({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  const user = await verifyUserPassword({ email }, password);
  if (!user) return null;
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  });
  return session;
}

export async function signup({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: email.toLowerCase(),
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      },
    },
    select: {
      id: true,
      expirationDate: true,
      userId: true,
    },
  });
  return session;
}

export async function logout(
  { request, redirectTo = "/" }: { request: Request; redirectTo?: string },
  responseInit?: ResponseInit,
) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionIdPayload = sessionIdSchema.safeParse(
    cookieSession.get(sessionKey),
  );
  if (!sessionIdPayload.success) return null;
  const sessionId = sessionIdPayload.data;
  // if this fails, we don't care, we're logging out anyway
  void prisma.session.delete({ where: { id: sessionId } });
  throw redirect(redirectTo, {
    ...responseInit,
    headers: combineHeaders(
      {
        "set-cookie": await sessionStorage.destroySession(cookieSession),
      },
      responseInit?.headers,
    ),
  });
}

export async function verifyUserPassword(
  where: Pick<User, "email"> | Pick<User, "id">,
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}
export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}
