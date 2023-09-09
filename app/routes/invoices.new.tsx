import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";

const schema = z.object({
  clientName: z.string().nonempty("can't be empty"),
});

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const submission = parse(formData, { schema });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  return redirect("/invoices");
}

export default function InvoicesNew() {
  const lastSubmission = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastSubmission,
    shouldValidate: "onBlur",
  });

  return (
    <Form method="post" {...form.props}>
      <Label htmlFor="clientName">Client's Name</Label>
      <Input
        id="clientName"
        name="clientName"
        defaultValue={fields.clientName.defaultValue}
      />
      <p>{fields.clientName.errors}</p>
      <Button type="submit">Save &amp; Send</Button>
    </Form>
  );
}
