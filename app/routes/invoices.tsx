import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/ui/button'
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
          <h1 className="mb-2 font-bold text-2xl leading-trim">Invoices</h1>
          <p className="text-muted-foreground text-sm leading-trim">
            <span className="sm:hidden">{subheading.base}</span>
            <span className="hidden sm:inline">{subheading.sm}</span>
          </p>
        </div>
        <Button asChild>
          <Link to="new">New invoice</Link>
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
              <h2 className="font-bold leading-trim">
                <span className="text-muted-foreground dark:[--muted-foreground:231_36%_63%]">
                  #
                </span>
                <span>{invoice.fid}</span>
              </h2>
              <p className="justify-self-end text-muted-foreground text-sm leading-trim">
                {invoice.clientName}
              </p>
              <div className="self-end">
                <p className="mb-4 text-muted-foreground text-sm leading-trim">
                  Due {invoice.dueDate}
                </p>
                <p className="leading-trim">{invoice.total}</p>
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
