import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useId } from "react";
import { safeRedirect } from "remix-utils";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { login, requireAnonymous, sessionKey } from "~/utils/auth.server";
import { combineResponseInits } from "~/utils/misc";
import { sessionStorage } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireAnonymous(request);
  return json({});
};

export async function handleNewSession(
  {
    request,
    session,
    remember,
    redirectTo,
  }: {
    request: Request;
    session: { id: string; expirationDate: Date; userId: string };
    remember: boolean;
    redirectTo?: string;
  },
  responseInit?: ResponseInit,
) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  cookieSession.set(sessionKey, session.id);

  return redirect(
    safeRedirect(redirectTo),
    combineResponseInits(
      {
        headers: {
          "set-cookie": await sessionStorage.commitSession(cookieSession, {
            expires: remember ? session.expirationDate : undefined,
          }),
        },
      },
      responseInit,
    ),
  );
}

const loginFormSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string(),
  remember: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export const action = async ({ request }: ActionArgs) => {
  await requireAnonymous(request);
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: (intent) =>
      loginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, session: null };

        const session = await login(data);
        if (!session) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true,
  });

  delete submission.payload.password;

  if (submission.intent !== "submit") {
    // @ts-ignore
    delete submission.value?.password;
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value?.session) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { session, remember, redirectTo } = submission.value;

  return handleNewSession({
    request,
    session,
    remember: remember ?? false,
    redirectTo,
  });
};

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const formId = useId();

  const [form, fields] = useForm({
    id: formId,
    defaultValue: { redirectTo },
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: loginFormSchema });
    },
    shouldValidate: "onBlur",
  });

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" {...form.props} className="space-y-6">
          <div>
            <Label
              htmlFor={fields.email.id}
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </Label>
            <div className="mt-1">
              <Input
                {...conform.input(fields.email, { type: "email" })}
                autoComplete="email"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              <p id={fields.email.errorId}>{fields.email.errors}</p>
            </div>
          </div>
          <div>
            <Label
              htmlFor={fields.password.id}
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="mt-1">
              <Input
                {...conform.input(fields.password, { type: "password" })}
                autoComplete="current-password"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              <p id={fields.email.errorId}>{fields.email.errors}</p>
            </div>
          </div>

          <input {...conform.input(fields.redirectTo, { type: "hidden" })} />
          <p id={form.errorId}>{form.errors}</p>
          <Button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...conform.input(fields.remember, {
                  type: "checkbox",
                })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={fields.remember.id}
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/signup",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
