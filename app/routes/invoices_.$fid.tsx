import { type DataFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Heading } from '~/components/ui/heading'
import { InvoiceFid } from '~/components/ui/invoiceFid'
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
      <Heading level={2} className="font-bold">
        <InvoiceFid fid={invoice.fid} />
      </Heading>
    </main>
  )
}
