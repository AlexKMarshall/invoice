import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useId } from "react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createInvoice } from "~/models/invoice.server";
import { requireUserId } from "~/utils/auth.server";

const invoiceFormSchema = z.object({
  billFromStreet: z.string().nonempty("can't be empty"),
  billFromCity: z.string().nonempty("can't be empty"),
  billFromPostCode: z.string().nonempty("can't be empty"),
  billFromCountry: z.string().nonempty("can't be empty"),
  clientName: z.string().nonempty("can't be empty"),
  clientEmail: z
    .string()
    .nonempty("can't be empty")
    .email("must be a valid email address"),
  billToStreet: z.string().nonempty("can't be empty"),
  billToCity: z.string().nonempty("can't be empty"),
  billToPostCode: z.string().nonempty("can't be empty"),
  billToCountry: z.string().nonempty("can't be empty"),
  invoiceDate: z.string().nonempty("can't be empty"),
  paymentTerms: z.string().nonempty("can't be empty"),
  projectDescription: z.string().nonempty("can't be empty"),
});

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = parse(formData, { schema: invoiceFormSchema });

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
      return parse(formData, { schema: invoiceFormSchema });
    },
  });

  return (
    <Form method="post" {...form.props}>
      <fieldset>
        <legend>Bill From</legend>
        <div>
          <Label htmlFor={fields.billFromStreet.id}>Street Address</Label>
          <Input
            {...conform.input(fields.billFromStreet)}
            autoComplete="street-address"
          />
          <p id={fields.billFromStreet.errorId}>
            {fields.billFromStreet.errors}
          </p>
        </div>
        <div>
          <Label htmlFor={fields.billFromCity.id}>City</Label>
          <Input
            {...conform.input(fields.billFromCity)}
            autoComplete="address-level1"
          />
          <p id={fields.billFromCity.errorId}>{fields.billFromCity.errors}</p>
        </div>
        <div>
          <Label htmlFor={fields.billFromPostCode.id}>Post Code</Label>
          <Input
            {...conform.input(fields.billFromPostCode)}
            autoComplete="postal-code"
          />
          <p id={fields.billFromPostCode.errorId}>
            {fields.billFromPostCode.errors}
          </p>
        </div>
        <div>
          <Label htmlFor={fields.billFromCountry.id}>Country</Label>
          <Input
            {...conform.input(fields.billFromCountry)}
            autoComplete="country-name"
          />
          <p id={fields.billFromCountry.errorId}>
            {fields.billFromCountry.errors}
          </p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Bill To</legend>
        <div>
          <Label htmlFor={fields.clientName.id}>Client's Name</Label>
          <Input {...conform.input(fields.clientName)} autoComplete="name" />
          <p id={fields.clientName.errorId}>{fields.clientName.errors}</p>
        </div>
        <div>
          <Label htmlFor={fields.clientEmail.id}>Client's Email</Label>
          <Input {...conform.input(fields.clientEmail)} autoComplete="email" />
          <p id={fields.clientEmail.errorId}>{fields.clientEmail.errors}</p>
        </div>
        <div>
          <Label htmlFor={fields.billToStreet.id}>Street Address</Label>
          <Input
            {...conform.input(fields.billToStreet)}
            autoComplete="street-address"
          />
          <p id={fields.billToStreet.errorId}>{fields.billToStreet.errors}</p>
        </div>
        <div>
          <Label htmlFor={fields.billToCity.id}>City</Label>
          <Input
            {...conform.input(fields.billToCity)}
            autoComplete="address-level1"
          />
          <p id={fields.billToCity.errorId}>{fields.billToCity.errors}</p>
        </div>
        <div>
          <Label htmlFor={fields.billToPostCode.id}>Post Code</Label>
          <Input
            {...conform.input(fields.billToPostCode)}
            autoComplete="postal-code"
          />
          <p id={fields.billToPostCode.errorId}>
            {fields.billToPostCode.errors}
          </p>
        </div>
        <div>
          <Label htmlFor={fields.billToCountry.id}>Country</Label>
          <Input
            {...conform.input(fields.billToCountry)}
            autoComplete="country-name"
          />
          <p id={fields.billToCountry.errorId}>{fields.billToCountry.errors}</p>
        </div>
      </fieldset>
      <div>
        <Label htmlFor={fields.invoiceDate.id}>Invoice Date</Label>
        <Input
          {...conform.input(fields.invoiceDate)}
          autoComplete="country-name"
        />
        <p id={fields.invoiceDate.errorId}>{fields.invoiceDate.errors}</p>
      </div>
      <div>
        <Label htmlFor={fields.paymentTerms.id}>Payment Terms</Label>
        <Input
          {...conform.input(fields.paymentTerms)}
          autoComplete="country-name"
        />
        <p id={fields.paymentTerms.errorId}>{fields.paymentTerms.errors}</p>
      </div>
      <div>
        <Label htmlFor={fields.projectDescription.id}>
          Project Description
        </Label>
        <Input
          {...conform.input(fields.projectDescription)}
          autoComplete="country-name"
        />
        <p id={fields.projectDescription.errorId}>
          {fields.projectDescription.errors}
        </p>
      </div>

      <Button type="submit">Save &amp; Send</Button>
    </Form>
  );
}
