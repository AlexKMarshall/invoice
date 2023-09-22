import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Heading } from '~/components/ui/heading'
import { InvoiceFid } from '~/components/ui/invoiceFid'
import { Stack } from '~/components/ui/stack'
import { Text } from '~/components/ui/text'
import { getInvoiceDetail } from '~/models/invoice.server'
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

  return json({ invoice })
}

export default function InvoiceDetail() {
  const { invoice } = useLoaderData<typeof loader>()
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <div className="rounded-lg bg-card p-6 text-card-foreground shadow-md shadow-[hsl(231,38%,45%)]/5 dark:shadow-black/25">
        <Stack gap={10}>
          <Stack gap={3}>
            <Heading level={1} className="font-bold">
              <InvoiceFid fid={invoice.fid} />
            </Heading>
            <Text className="text-muted-foreground text-sm">
              {invoice.projectDescription}
            </Text>
          </Stack>
          <Stack gap={3} asChild>
            <address className="text-muted-foreground">
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
          <div className="grid grid-flow-col grid-cols-2 gap-10">
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
          </div>
          <Stack gap={4}>
            <Heading level={2} className="text-muted-foreground text-sm">
              Sent To
            </Heading>
            <Text className="font-bold">{invoice.clientEmail}</Text>
          </Stack>
        </Stack>
      </div>
    </main>
  )
}
