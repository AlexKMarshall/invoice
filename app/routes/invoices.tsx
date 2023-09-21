import { conform, useForm } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData, useSubmit } from '@remix-run/react'
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'
import type { FormEvent, MouseEvent } from 'react'
import { useId, useRef } from 'react'
import { ClientOnly } from 'remix-utils'
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
import illustrationEmpty from '~/images/illustration-empty.svg'
import { getInvoiceListItems } from '~/models/invoice.server'
import type { CompleteInvoice } from '~/schemas'

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

function getHumanFriendlyList(
  words: string[],
  separator: 'and' | 'or' = 'and',
) {
  if (words.length === 0) return ''

  const firstWords = words.slice(0, -1)
  const lastWord = words.at(-1)

  if (firstWords.length === 0) return lastWord

  return `${firstWords.join(', ')} ${separator} ${lastWord}`
}

function getFullInvoiceSubheading(count: number, statusFilter?: string[]) {
  if (!statusFilter?.length && count === 0) {
    return 'No invoices'
  }
  const filterString = statusFilter?.length
    ? getHumanFriendlyList(statusFilter, 'or')
    : 'total'

  // There are 3 pending or draft invoices
  return `There ${pluralIs(count)} ${count} ${filterString} ${pluralInvoice(
    count,
  )}`
}

function getShortInvoiceSubheading(count: number) {
  return count > 0 ? pluralInvoice(count, true) : 'No invoices'
}

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
      short: getShortInvoiceSubheading(count),
      full: getFullInvoiceSubheading(count, statusFilter),
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
  const id = useId()
  const [form, { status }] = useForm({
    id,
    onValidate({ formData }) {
      return parse(formData, { schema: filterSchema })
    },
    lastSubmission,
  })

  function handleFilterChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true })
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <div className="relative z-10 mb-8 flex items-center gap-8 max-[22rem]:gap-4 2xl:gap-9">
        <div className="flex-grow basis-36 @container">
          <Heading level={1} className="mb-2 font-bold text-2xl">
            Invoices
          </Heading>
          <Text className="text-muted-foreground text-sm">
            <span className="@[8.5rem]:hidden">{subheading.short}</span>
            <span className="hidden whitespace-nowrap @[8.5rem]:inline">
              {subheading.full}
            </span>
          </Text>
        </div>

        <div className="flex basis-36 justify-end @container">
          <ClientOnly
            fallback={
              <details className="relative duration-1000 animate-in fade-in">
                <summary className="font-bold">
                  Filter
                  <span className="sr-only @[9rem]:not-sr-only">
                    &nbsp;by status
                  </span>
                </summary>
                <div className="absolute left-1/2 top-full z-50 w-fit min-w-[10rem] -translate-x-1/2 translate-y-1 rounded-md bg-popover p-6 text-popover-foreground shadow-lg shadow-[hsl(231,38%,45%)]/10 outline-none dark:shadow-black/25">
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
                      .map((props, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input {...props} />
                          <Text asChild className="font-bold leading-none">
                            <label htmlFor={props.id} className="capitalize">
                              {props.value}
                            </label>
                          </Text>
                        </div>
                      ))}
                    <Button type="submit">Apply</Button>
                  </Form>
                </div>
              </details>
            }
          >
            {() => (
              <Popover>
                <Text asChild className="font-bold">
                  <PopoverTrigger className="data-[state=open]:[--rotate:180deg]">
                    <span>
                      Filter
                      <span className="sr-only @[9rem]:not-sr-only">
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
                  </Form>
                </PopoverContent>
              </Popover>
            )}
          </ClientOnly>
        </div>

        <div className="flex basis-40 justify-end @container">
          <Button asChild className="relative pl-14 pr-4">
            <Link to="new">
              <span className="absolute bottom-2 left-2 top-2 aspect-square rounded-full bg-foreground p-1.5">
                <PlusIcon className="h-full w-full bg-transparent text-background" />
              </span>
              <span>
                New
                <span className="sr-only @[10rem]:not-sr-only">
                  &nbsp;invoice
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Outlet />

      {invoiceListItems.length ? (
        <ul className="flex flex-col gap-4 @container">
          {invoiceListItems.map((invoice) => (
            <InvoiceListItem invoice={invoice} key={invoice.id} />
          ))}
        </ul>
      ) : (
        <div className="flex max-w-[14rem] flex-1 flex-col items-center justify-center self-center text-center">
          <img src={illustrationEmpty} alt="" className="mb-10" />
          <Heading level={2} className="mb-6 font-bold text-2xl">
            There is nothing here
          </Heading>
          <Text className="text-sm">
            Create an invoice by clicking the{' '}
            <Link to="new" className="font-bold">
              New
            </Link>{' '}
            button and get started
          </Text>
        </div>
      )}
    </main>
  )
}

function InvoiceListItem({
  invoice,
}: {
  invoice: {
    id: string
    fid: string
    clientName: string
    dueDate: string
    totalParts: string[]
    status: CompleteInvoice['status']
  }
}) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const handleInvoiceClick = (event: MouseEvent) => {
    if (event.target === linkRef.current) return
    linkRef.current?.click()
  }

  return (
    <li
      key={invoice.id}
      className="grid cursor-pointer grid-cols-2 gap-7 rounded-lg bg-card p-6 text-card-foreground shadow-md shadow-[hsl(231,38%,45%)]/5 [grid-template-areas:'id_client'_'values_status'] focus-within:ring-1 focus-within:ring-primary @2xl:grid-cols-[1fr_minmax(max-content,2fr)_3fr_1fr_1fr] @2xl:items-center @2xl:gap-10 @2xl:px-6 @2xl:py-4 @2xl:[grid-template-areas:'id_date_client_total_status'] @3xl:px-8 dark:shadow-black/25"
      onClick={handleInvoiceClick}
    >
      <Heading level={2} className="font-bold [grid-area:id]">
        <Link ref={linkRef} to={invoice.fid} className="focus:outline-0">
          <span className="text-muted-foreground dark:[--muted-foreground:231_36%_63%]">
            #
          </span>
          <span>{invoice.fid}</span>
        </Link>
      </Heading>
      <Text className="justify-self-end text-muted-foreground text-sm [grid-area:client] @2xl:justify-self-start">
        {invoice.clientName}
      </Text>
      <div className="flex flex-col gap-4 self-end [grid-area:values] @2xl:contents">
        <Text className="text-muted-foreground text-sm [grid-area:date]">
          Due {invoice.dueDate}
        </Text>
        <Text className="font-bold [grid-area:total] @2xl:justify-self-end">
          <CurrencyValue currencyParts={invoice.totalParts} />
        </Text>
      </div>
      <div className="flex items-center gap-5 self-end justify-self-end [grid-area:status] @2xl:justify-self-stretch">
        <InvoiceStatus
          className="min-w-[6.875rem] flex-grow"
          status={invoice.status}
        />
        <ChevronRightIcon className="hidden h-5 w-5 text-primary @2xl:block" />
      </div>
    </li>
  )
}
