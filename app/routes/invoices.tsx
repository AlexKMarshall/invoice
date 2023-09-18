import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { PlusIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { CurrencyValue } from '~/components/ui/currencyValue'
import { Heading } from '~/components/ui/heading'
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

export async function loader() {
  const invoiceListItems = await getInvoiceListItems()
  const count = invoiceListItems.length

  return json({
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
  const { invoiceListItems, subheading } = useLoaderData<typeof loader>()
  return (
    <main className="px-6 py-8">
      <div className="mb-8 flex items-center">
        <div className="flex-grow">
          <Heading level={1} className="mb-2 font-bold text-2xl">
            Invoices
          </Heading>
          <Text className="text-muted-foreground text-sm">
            <span className="sm:hidden">{subheading.base}</span>
            <span className="hidden sm:inline">{subheading.sm}</span>
          </Text>
        </div>
        <Button asChild className="relative pl-14 pr-4">
          <Link to="new">
            <span className="absolute bottom-2 left-2 top-2 aspect-square rounded-full bg-foreground p-1.5">
              <PlusIcon className="h-full w-full bg-transparent text-background" />
            </span>
            New invoice
          </Link>
        </Button>
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
