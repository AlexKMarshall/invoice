import { conform, useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData, useSubmit } from '@remix-run/react'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import type { FormEvent } from 'react'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { CurrencyValue } from '~/components/ui/currencyValue'
import { Heading } from '~/components/ui/heading'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Text } from '~/components/ui/text'
import { getInvoiceListItems } from '~/models/invoice.server'

import { InvoiceStatus } from '../components/ui/invoiceStatus'

function pluralize(word: string, pluralVersion = `${word}s`) {
  return (count: number, includeCount = false) => {
    const prefix = includeCount ? `${count} ` : ''
    return count === 1 ? `${prefix}${word}` : `${prefix}${pluralVersion}`
  }
}

const pluralIs = pluralize('is', 'are')
const pluralInvoice = pluralize('invoice')

const filterSchema = z.object({
  status: z.array(z.enum(['draft', 'pending', 'paid'])),
})

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const submission = parse(searchParams, { schema: filterSchema })

  const statusFilter =
    submission.value?.status && submission.value.status.length > 0
      ? submission.value.status
      : undefined

  const invoiceListItems = await getInvoiceListItems({
    where: { status: statusFilter },
  })
  const count = invoiceListItems.length

  return json({
    submission,
    invoiceListItems,
    count,
    subheading: {
      base: count > 0 ? pluralInvoice(count, true) : 'No invoices',
      sm:
        count > 0
          ? `There ${pluralIs(count)} ${count} total ${pluralInvoice(count)}`
          : 'No invoices',
    },
  })
}

export default function Invoices() {
  const {
    submission: lastSubmission,
    invoiceListItems,
    subheading,
  } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const [form, { status }] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema: filterSchema })
    },
    lastSubmission,
  })

  function handleFilterChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true })
  }
  return (
    <main className="px-6 py-8">
      <div className="max-[22rem]:gap-4 mb-8 flex items-center gap-8">
        <div className="@container flex-grow basis-36">
          <Heading level={1} className="mb-2 font-bold text-2xl">
            Invoices
          </Heading>
          <Text className="text-muted-foreground text-sm">
            <span className="@[8.5rem]:hidden">{subheading.base}</span>
            <span className="@[8.5rem]:inline hidden whitespace-nowrap">
              {subheading.sm}
            </span>
          </Text>
        </div>

        <div className="@container flex basis-36 justify-end">
          <Popover>
            <Text asChild className="font-bold">
              <PopoverTrigger className="data-[state=open]:[--rotate:180deg]">
                <span>
                  Filter
                  <span className="@[7.5rem]:not-sr-only sr-only">
                    &nbsp;by status
                  </span>
                </span>
                <ChevronDownIcon className="ml-3 inline-block h-4 w-4 rotate-[--rotate] transition-transform" />
              </PopoverTrigger>
            </Text>
            <PopoverContent className="min-w-[10rem] p-6">
              <Form
                method="get"
                {...form.props}
                className="flex flex-col gap-4"
                onChange={handleFilterChange}
              >
                {conform
                  .collection(status, {
                    type: 'checkbox',
                    options: ['draft', 'pending', 'paid'],
                  })
                  .map(({ type: _type, ...props }, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Checkbox {...props} />
                      <Text asChild className="font-bold leading-none">
                        <label htmlFor={props.id} className="capitalize">
                          {props.value}
                        </label>
                      </Text>
                    </div>
                  ))}
                {/* <div className="flex items-center gap-3">
                  <Checkbox id="pending" value="pending" name="status" />
                  <Text asChild className="font-bold leading-none">
                    <label htmlFor="pending">Pending</label>
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="paid" value="paid" name="status" />
                  <Text asChild className="font-bold leading-none">
                    <label htmlFor="paid">Paid</label>
                  </Text>
                </div> */}
              </Form>
            </PopoverContent>
          </Popover>
        </div>

        <div className="@container flex basis-40 justify-end">
          <Button asChild className="relative pl-14 pr-4">
            <Link to="new">
              <span className="absolute bottom-2 left-2 top-2 aspect-square rounded-full bg-foreground p-1.5">
                <PlusIcon className="h-full w-full bg-transparent text-background" />
              </span>
              <span>
                New
                <span className="@[10rem]:not-sr-only sr-only">
                  &nbsp;invoice
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Outlet />

      {invoiceListItems.length ? (
        <ul className="flex flex-col gap-4">
          {invoiceListItems.map((invoice) => (
            <li
              key={invoice.id}
              className="grid grid-cols-2 gap-7 rounded-lg bg-card p-6 text-card-foreground"
            >
              <Heading level={2} className="font-bold">
                <span className="text-muted-foreground dark:[--muted-foreground:231_36%_63%]">
                  #
                </span>
                <span>{invoice.fid}</span>
              </Heading>
              <Text className="justify-self-end text-muted-foreground text-sm">
                {invoice.clientName}
              </Text>
              <div className="self-end">
                <Text className="mb-4 text-muted-foreground text-sm">
                  Due {invoice.dueDate}
                </Text>
                <Text className="font-bold">
                  <CurrencyValue currencyParts={invoice.totalParts} />
                </Text>
              </div>
              <InvoiceStatus
                className="min-w-[6.875rem] self-end justify-self-end"
                status={invoice.status}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found</p>
      )}
    </main>
  )
}
