import type { FieldConfig } from '@conform-to/react'
import {
  conform,
  list,
  useFieldList,
  useFieldset,
  useForm,
} from '@conform-to/react'
import { parse, refine } from '@conform-to/zod'
import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { TrashIcon } from 'lucide-react'
import { useId, useRef } from 'react'
import { ClientOnly } from 'remix-utils'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { DatePicker } from '~/components/ui/datePicker'
import { ErrorMessage } from '~/components/ui/errorMessage'
import { Heading } from '~/components/ui/heading'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Stack } from '~/components/ui/stack'
import { Text } from '~/components/ui/text'
import { prisma } from '~/db.server'
import { createInvoice, getPaymentTerms } from '~/models/invoice.server'
import { requireUserId } from '~/utils/auth.server'

function createInvoiceFormSchema(
  options: {
    doesPaymentTermExist?: (paymentTermId: string) => Promise<boolean>
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
      .email('must be a valid email address'),
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
            message: 'must be a valid payment term',
          }),
        ),
      ),
    projectDescription: z.string().nonempty("can't be empty"),
    items: z.array(
      z.object({
        name: z.string().nonempty("can't be empty"),
        quantity: z.coerce.number().int().positive('must be a positive number'),
        price: z.coerce.number().int().positive('must be a positive number'),
      }),
    ),
  })
}

type InvoiceItemFieldset = z.infer<
  ReturnType<typeof createInvoiceFormSchema>
>['items'][number]

export async function loader() {
  const paymentTerms = await getPaymentTerms()

  return json({ paymentTerms })
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)

  const formData = await request.formData()

  const submission = await parse(formData, {
    schema: createInvoiceFormSchema({
      async doesPaymentTermExist(paymentTermId) {
        const existingPaymentTerm = await prisma.paymentTerm.findUnique({
          where: { id: paymentTermId },
        })
        return Boolean(existingPaymentTerm)
      },
    }),
    async: true,
  })

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission)
  }

  await createInvoice({ ...submission.value, userId, status: 'pending' })

  return redirect('/invoices')
}

export default function InvoicesNew() {
  const { paymentTerms } = useLoaderData<typeof loader>()
  const lastSubmission = useActionData<typeof action>()
  const id = useId()
  const [form, fields] = useForm({
    id,
    lastSubmission,
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parse(formData, { schema: createInvoiceFormSchema() })
    },
    defaultValue: {
      items: [{ name: '', quantity: '', price: '' }],
    },
  })
  const items = useFieldList(form.ref, fields.items)

  return (
    <main className="bg-card px-6 py-8 text-card-foreground">
      <Form method="post" {...form.props}>
        <Heading level={1} className="mb-8 font-bold text-2xl ">
          New Invoice
        </Heading>
        <fieldset className="mb-10">
          <Text asChild className="mb-6 font-bold text-primary">
            <legend>Bill From</legend>
          </Text>
          <div className="grid grid-cols-2 gap-6">
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billFromStreet.id}>Street Address</Label>
                <ErrorMessage id={fields.billFromStreet.errorId}>
                  {fields.billFromStreet.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billFromStreet)}
                autoComplete="street-address"
              />
            </Stack>
            <Stack gap={3}>
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billFromCity.id}>City</Label>
                <ErrorMessage id={fields.billFromCity.errorId}>
                  {fields.billFromCity.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billFromCity)}
                autoComplete="address-level1"
              />
            </Stack>
            <Stack gap={3}>
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billFromPostCode.id}>Post Code</Label>
                <ErrorMessage id={fields.billFromPostCode.errorId}>
                  {fields.billFromPostCode.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billFromPostCode)}
                autoComplete="postal-code"
              />
            </Stack>
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billFromCountry.id}>Country</Label>
                <ErrorMessage id={fields.billFromCountry.errorId}>
                  {fields.billFromCountry.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billFromCountry)}
                autoComplete="country-name"
              />
            </Stack>
          </div>
        </fieldset>
        <fieldset className="mb-10">
          <Text asChild className="mb-6 font-bold text-primary">
            <legend>Bill To</legend>
          </Text>
          <div className="grid grid-cols-2 gap-6">
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.clientName.id}>Client's Name</Label>
                <ErrorMessage id={fields.clientName.errorId}>
                  {fields.clientName.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.clientName)}
                autoComplete="name"
              />
            </Stack>
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.clientEmail.id}>Client's Email</Label>
                <ErrorMessage id={fields.clientEmail.errorId}>
                  {fields.clientEmail.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.clientEmail)}
                autoComplete="email"
              />
            </Stack>
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billToStreet.id}>Street Address</Label>
                <ErrorMessage id={fields.billToStreet.errorId}>
                  {fields.billToStreet.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billToStreet)}
                autoComplete="street-address"
              />
            </Stack>
            <Stack gap={3}>
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billToCity.id}>City</Label>
                <ErrorMessage id={fields.billToCity.errorId}>
                  {fields.billToCity.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billToCity)}
                autoComplete="address-level1"
              />
            </Stack>
            <Stack gap={3}>
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billToPostCode.id}>Post Code</Label>
                <ErrorMessage id={fields.billToPostCode.errorId}>
                  {fields.billToPostCode.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billToPostCode)}
                autoComplete="postal-code"
              />
            </Stack>
            <Stack gap={3} className="col-span-full">
              <div className="flex justify-between gap-8">
                <Label htmlFor={fields.billToCountry.id}>Country</Label>
                <ErrorMessage id={fields.billToCountry.errorId}>
                  {fields.billToCountry.errors}
                </ErrorMessage>
              </div>
              <Input
                {...conform.input(fields.billToCountry)}
                autoComplete="country-name"
              />
            </Stack>
          </div>
        </fieldset>
        <div className="mb-16 grid gap-6">
          <Stack gap={3} className="col-span-full">
            <div className="flex justify-between gap-8">
              <Label htmlFor={fields.invoiceDate.id}>Invoice Date</Label>
              <ErrorMessage id={fields.invoiceDate.errorId}>
                {fields.invoiceDate.errors}
              </ErrorMessage>
            </div>
            <DatePicker {...conform.input(fields.invoiceDate)} />
          </Stack>
          <Stack gap={3} className="col-span-full">
            <div className="flex justify-between gap-8">
              <Label htmlFor={fields.paymentTermId.id}>Payment Terms</Label>
              <ErrorMessage id={fields.paymentTermId.errorId}>
                {fields.paymentTermId.errors}
              </ErrorMessage>
            </div>
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
                <Select
                  {...conform.select(fields.paymentTermId)}
                  defaultValue={String(fields.paymentTermId.defaultValue)}
                >
                  <SelectTrigger id={fields.paymentTermId.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTerms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ClientOnly>
          </Stack>
          <Stack gap={3} className="col-span-full">
            <div className="flex justify-between gap-8">
              <Label htmlFor={fields.projectDescription.id}>
                Project Description
              </Label>
              <ErrorMessage id={fields.projectDescription.errorId}>
                {fields.projectDescription.errors}
              </ErrorMessage>
            </div>
            <Input {...conform.input(fields.projectDescription)} />
          </Stack>
        </div>
        <Heading level={2} className="mb-8 font-bold text-lg">
          Item List
        </Heading>
        <Stack gap={12} asChild className="mb-12">
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
        </Stack>
        <Button
          variant="secondary"
          {...list.insert(fields.items.name)}
          className="mb-24 block w-full"
        >
          + Add New Item
        </Button>
        <Button type="submit">Save &amp; Send</Button>
      </Form>
    </main>
  )
}

function InvoiceItemFieldset({
  config,
  name: fieldsetName,
  index,
}: {
  config: FieldConfig<InvoiceItemFieldset>
  name: string
  index: number
}) {
  const ref = useRef<HTMLFieldSetElement>(null)
  const { name, quantity, price } = useFieldset(ref, config)

  return (
    <fieldset
      ref={ref}
      className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-x-4 gap-y-6"
    >
      <Stack gap={3} className="col-span-full">
        <div className="flex justify-between gap-8">
          <Label htmlFor={name.id}>Item Name</Label>
          <ErrorMessage id={name.errorId}>{name.errors}</ErrorMessage>
        </div>
        <Input {...conform.input(name)} />
      </Stack>
      <Stack gap={3}>
        <div className="flex flex-wrap justify-between gap-8">
          <Label htmlFor={quantity.id}>Qty</Label>
          <ErrorMessage id={quantity.errorId}>{quantity.errors}</ErrorMessage>
        </div>
        <Input {...conform.input(quantity)} />
      </Stack>
      <Stack gap={3}>
        <div className="flex flex-wrap justify-between gap-8">
          <Label htmlFor={price.id}>Price</Label>
          <ErrorMessage id={price.errorId}>{price.errors}</ErrorMessage>
        </div>
        <Input {...conform.input(price)} />
      </Stack>
      <Stack gap={3} className="col-start-4 justify-self-end">
        {/* Spacer so button alignment works.  */}
        <Text className="invisible text-sm">X</Text>
        <button
          {...list.remove(fieldsetName, { index })}
          aria-label="remove"
          className="my-3"
        >
          <TrashIcon className="h-4 w-4 fill-muted-foreground text-muted-foreground" />
        </button>
      </Stack>
    </fieldset>
  )
}
