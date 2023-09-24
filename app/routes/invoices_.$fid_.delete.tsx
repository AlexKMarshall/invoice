import { type DataFunctionArgs, json, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Heading } from '~/components/ui/heading'
import { Text } from '~/components/ui/text'
import { deleteInvoice } from '~/models/invoice.server'
import { InvoiceModel } from '~/schemas'

const paramsSchema = InvoiceModel.pick({ fid: true })

export async function loader({ params }: DataFunctionArgs) {
  const parsedParams = paramsSchema.safeParse(params)

  if (!parsedParams.success) {
    throw new Response('Invalid params', { status: 400 })
  }

  const { fid } = parsedParams.data

  return json({ fid })
}

export async function action({ params }: DataFunctionArgs) {
  const parsedParams = paramsSchema.safeParse(params)

  if (!parsedParams.success) {
    throw new Response('Invalid params', { status: 400 })
  }

  const { fid } = parsedParams.data

  await deleteInvoice({ where: { fid } })

  return redirect('/invoices')
}

export default function InvoiceFidDelete() {
  const { fid } = useLoaderData<typeof loader>()
  return (
    <main className="mx-auto grid min-h-screen max-w-4xl place-content-center px-6 py-8">
      <div className="grid w-full max-w-lg gap-6 rounded-lg bg-card p-8 text-card-foreground shadow-lg">
        <div className="flex flex-col gap-4">
          <Heading level={1} className="font-bold text-2xl">
            Confirm Deletion
          </Heading>
          <Text className="text-muted-foreground text-sm leading-relaxed">
            Are you sure you want to delete invoice #{fid}? This action cannot
            be undone.
          </Text>
          <div className="flex justify-end gap-2">
            <Button asChild variant="secondary">
              <Link to="..">Cancel</Link>
            </Button>
            <Form method="post">
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </main>
  )
}
