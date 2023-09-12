import type { FieldConfig } from "@conform-to/react";
import {
  conform,
  list,
  useFieldList,
  useFieldset,
  useForm,
} from "@conform-to/react";
import { parse, refine } from "@conform-to/zod";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useId, useRef, useState } from "react";
import { ClientOnly } from "remix-utils";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/datePicker";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/db.server";
import { createInvoice, getPaymentTerms } from "~/models/invoice.server";
import { requireUserId } from "~/utils/auth.server";

function createInvoiceFormSchema(
  options: {
    doesPaymentTermExist?: (paymentTermId: string) => Promise<boolean>;
  } = {},
) {
  return z.object({
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
    paymentTermId: z
      .string()
      .nonempty("can't be empty")
      .pipe(
        z.string().superRefine((paymentTermId, ctx) =>
          refine(ctx, {
            validate: () => options.doesPaymentTermExist?.(paymentTermId),
            message: "must be a valid payment term",
          }),
        ),
      ),
    projectDescription: z.string().nonempty("can't be empty"),
    items: z.array(
      z.object({
        name: z.string().nonempty("can't be empty"),
        quantity: z.coerce.number().int().positive("must be a positive number"),
        price: z.coerce.number().int().positive("must be a positive number"),
      }),
    ),
  });
}

type InvoiceItemFieldset = z.infer<
  ReturnType<typeof createInvoiceFormSchema>
>["items"][number];

export async function loader() {
  const paymentTerms = await getPaymentTerms();

  return json({ paymentTerms });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: createInvoiceFormSchema({
      async doesPaymentTermExist(paymentTermId) {
        const existingPaymentTerm = await prisma.paymentTerm.findUnique({
          where: { id: paymentTermId },
        });
        return Boolean(existingPaymentTerm);
      },
    }),
    async: true,
  });

  if (submission.intent !== "submit" || !submission.value) {
    return json(submission);
  }

  await createInvoice({ ...submission.value, userId });

  return redirect("/invoices");
}

export default function InvoicesNew() {
  const { paymentTerms } = useLoaderData<typeof loader>();
  const lastSubmission = useActionData<typeof action>();
  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parse(formData, { schema: createInvoiceFormSchema() });
    },
    defaultValue: {
      items: [{ name: "", quantity: "", price: "" }],
    },
  });
  const items = useFieldList(form.ref, fields.items);

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
        <DatePicker {...conform.input(fields.invoiceDate)} />
        <p id={fields.invoiceDate.errorId}>{fields.invoiceDate.errors}</p>
      </div>
      <div>
        <Label htmlFor={fields.paymentTermId.id}>Payment Terms</Label>
        <ClientOnly
          fallback={
            <select {...conform.select(fields.paymentTermId)}>
              {paymentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          }
        >
          {() => (
            <select {...conform.select(fields.paymentTermId)}>
              {paymentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </select>
          )}
        </ClientOnly>
        {/* <Input {...conform.input(fields.paymentTermId)} /> */}
        <p id={fields.paymentTermId.errorId}>{fields.paymentTermId.errors}</p>
      </div>
      <div>
        <Label htmlFor={fields.projectDescription.id}>
          Project Description
        </Label>
        <Input {...conform.input(fields.projectDescription)} />
        <p id={fields.projectDescription.errorId}>
          {fields.projectDescription.errors}
        </p>
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <InvoiceItemFieldset
              config={item}
              name={fields.items.name}
              index={index}
            />
          </li>
        ))}
      </ul>
      <Button {...list.insert(fields.items.name)}>Add Item</Button>

      <Button type="submit">Save &amp; Send</Button>
    </Form>
  );
}

function InvoiceItemFieldset({
  config,
  name: fieldsetName,
  index,
}: {
  config: FieldConfig<InvoiceItemFieldset>;
  name: string;
  index: number;
}) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const { name, quantity, price } = useFieldset(ref, config);

  return (
    <fieldset ref={ref}>
      <div>
        <Label htmlFor={name.id}>Item Name</Label>
        <Input {...conform.input(name)} />
        <p id={name.errorId}>{name.errors}</p>
      </div>
      <div>
        <Label htmlFor={quantity.id}>Qty</Label>
        <Input {...conform.input(quantity)} />
        <p id={quantity.errorId}>{quantity.errors}</p>
      </div>
      <div>
        <Label htmlFor={price.id}>Price</Label>
        <Input {...conform.input(price)} />
        <p id={price.errorId}>{price.errors}</p>
      </div>
      <Button {...list.remove(fieldsetName, { index })}>remove</Button>
    </fieldset>
  );
}
