import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { createInvoice } from "~/models/invoice.server";
import { useId } from "react";
import { requireUserId } from "~/utils/auth.server";

const schema = z.object({
  clientName: z.string().nonempty("can't be empty"),
});

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  await createInvoice({ ...submission.value, userId });

  return redirect("/invoices");
}

export default function InvoicesNew() {
  const lastSubmission = useActionData<typeof action>();
  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });

  return (
    <Form method="post" {...form.props}>
      <Label htmlFor={fields.clientName.id}>Client's Name</Label>
      <Input {...conform.input(fields.clientName)} />
      <p id={fields.clientName.errorId}>{fields.clientName.errors}</p>
      <Button type="submit">Save &amp; Send</Button>
    </Form>
  );
}
