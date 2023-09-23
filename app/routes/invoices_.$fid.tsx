import { type DataFunctionArgs, json } from '@remix-run/node'
import { Form, useLoaderData, useNavigate } from '@remix-run/react'
import { ChevronLeft } from 'lucide-react'
import { useHydrated } from 'remix-utils'

import { Button } from '~/components/ui/button'
import { CurrencyValue } from '~/components/ui/currencyValue'
import { Heading } from '~/components/ui/heading'
import { InvoiceFid } from '~/components/ui/invoiceFid'
import { InvoiceStatus } from '~/components/ui/invoiceStatus'
import { Stack } from '~/components/ui/stack'
import { Text } from '~/components/ui/text'
import { cn } from '~/lib/utils'
import { getInvoiceDetail, markAsPaid } from '~/models/invoice.server'
import { InvoiceModel } from '~/schemas'

const paramsSchema = InvoiceModel.pick({ fid: true })

export async function loader({ params }: DataFunctionArgs) {
  const parsedParams = paramsSchema.safeParse(params)

  if (!parsedParams.success) {
    throw new Response('Invalid params', { status: 400 })
  }

  const { fid } = parsedParams.data

  const invoice = await getInvoiceDetail({ where: { fid } })

  if (!invoice) {
    throw new Response('Not found', { status: 404 })
  }

  const permittedActions = {
    markAsPaid: invoice.status === 'pending',
  }

  return json({ invoice, permittedActions })
}

export async function action({ params }: DataFunctionArgs) {
  const parsedParams = paramsSchema.safeParse(params)

  if (!parsedParams.success) {
    throw new Response('Invalid params', { status: 400 })
  }

  const { fid } = parsedParams.data

  await markAsPaid({ where: { fid } })

  return null
}

export default function InvoiceDetail() {
  const { invoice, permittedActions } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const isHydrated = useHydrated()

  const hasPermittedActions = Object.values(permittedActions).includes(true)

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className={cn(
          'mb-8 flex max-w-fit items-center gap-6 transition-opacity',
          {
            'invisible opacity-0': !isHydrated,
            'visible opacity-100': isHydrated,
          },
        )}
      >
        <ChevronLeft className="h-5 w-5 text-primary" />
        <Text asChild className="font-bold">
          <span>Go back</span>
        </Text>
      </button>
      <div className="mb-4 flex items-center justify-between gap-12 rounded-lg bg-card p-6 text-card-foreground shadow-md shadow-[hsl(231,38%,45%)]/5 dark:shadow-black/25 md:p-8 xl:p-12">
        <Heading level={2} className="text-muted-foreground text-sm">
          Status
        </Heading>
        <InvoiceStatus status={invoice.status} />
      </div>
      <div className="mb-14 rounded-lg bg-card p-6 text-card-foreground shadow-md shadow-[hsl(231,38%,45%)]/5 dark:shadow-black/25 md:p-8 xl:p-12">
        <Stack gap={10}>
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <Stack gap={3}>
              <Heading level={1} className="font-bold">
                <InvoiceFid fid={invoice.fid} />
              </Heading>
              <Text className="text-muted-foreground text-sm">
                {invoice.projectDescription}
              </Text>
            </Stack>
            <Stack gap={3} asChild>
              <address className="text-muted-foreground md:text-right">
                <Text asChild className="text-sm">
                  <span>{invoice.billFromStreet}</span>
                </Text>
                <Text asChild className="text-sm">
                  <span>{invoice.billFromCity}</span>
                </Text>
                <Text asChild className="text-sm">
                  <span>{invoice.billFromPostCode}</span>
                </Text>
                <Text asChild className="text-sm">
                  <span>{invoice.billFromCountry}</span>
                </Text>
              </address>
            </Stack>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            <Stack gap={10} className="row-span-2">
              <Stack gap={4}>
                <Heading level={2} className="text-muted-foreground text-sm">
                  Invoice Date
                </Heading>
                <Text className="font-bold">{invoice.invoiceDate}</Text>
              </Stack>
              <Stack gap={4}>
                <Heading level={2} className="text-muted-foreground text-sm">
                  Payment Due
                </Heading>
                <Text className="font-bold">{invoice.dueDate}</Text>
              </Stack>
            </Stack>
            <Stack gap={4} className="row-span-2">
              <Heading level={2} className="text-muted-foreground text-sm">
                Bill To
              </Heading>
              <Text className="font-bold">{invoice.clientName}</Text>
              <Stack gap={3} asChild>
                <address className="text-muted-foreground">
                  <Text asChild className="text-sm">
                    <span>{invoice.billToStreet}</span>
                  </Text>
                  <Text asChild className="text-sm">
                    <span>{invoice.billToCity}</span>
                  </Text>
                  <Text asChild className="text-sm">
                    <span>{invoice.billToPostCode}</span>
                  </Text>
                  <Text asChild className="text-sm">
                    <span>{invoice.billToCountry}</span>
                  </Text>
                </address>
              </Stack>
            </Stack>
            <Stack gap={4}>
              <Heading level={2} className="text-muted-foreground text-sm">
                Sent To
              </Heading>
              <Text className="font-bold">{invoice.clientEmail}</Text>
            </Stack>
          </div>
        </Stack>
        <div className="mt-10 overflow-hidden rounded-lg">
          <div className="bg-background p-6 dark:bg-palette-4 md:py-0">
            <table className="hidden w-full border-separate border-spacing-y-6 md:table">
              <thead>
                <tr className="font-normal">
                  <th className="text-left">Item Name</th>
                  <th className="text-right">QTY.</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="font-bold">
                    <td className="text-left">{item.name}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">
                      <CurrencyValue currencyParts={item.priceParts} />
                    </td>
                    <td className="text-right">
                      <CurrencyValue currencyParts={item.totalParts} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Stack gap={8} className="md:hidden" asChild>
              <ul>
                {invoice.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-10"
                  >
                    <Stack gap={3}>
                      <Heading level={2} className="font-bold">
                        {item.name}
                      </Heading>
                      <Text className="font-bold text-muted-foreground dark:[--muted-foreground:--palette-6]">
                        {item.quantity} x{' '}
                        <CurrencyValue currencyParts={item.priceParts} />
                      </Text>
                    </Stack>
                    <Text className="font-bold">
                      <CurrencyValue currencyParts={item.totalParts} />
                    </Text>
                  </li>
                ))}
              </ul>
            </Stack>
          </div>
          <div className="flex items-center justify-between gap-8 bg-palette-13 px-6 py-8 text-white dark:bg-palette-8">
            <Heading level={2} className="text-sm">
              Amount Due
            </Heading>
            <Text className="font-bold text-2xl">
              <CurrencyValue currencyParts={invoice.amountDueParts} />
            </Text>
          </div>
        </div>
      </div>
      {hasPermittedActions && (
        <div className="flex justify-end bg-card p-6 text-card-foreground">
          {permittedActions.markAsPaid && (
            <Form method="post" replace>
              <Button variant="default">Mark as Paid</Button>
            </Form>
          )}
        </div>
      )}
    </main>
  )
}
