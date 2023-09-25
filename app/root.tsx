import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'

import { getUser } from '~/session.server'
import fontCss from '~/styles/font.css'
import tailwindCss from '~/styles/tailwind.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: fontCss },
  { rel: 'stylesheet', href: tailwindCss },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export const loader = async ({ request }: LoaderArgs) => {
  const reducedData = request.headers.get('Save-Data') === 'on'
  return json({ user: await getUser(request), reducedData })
}

export default function App() {
  const { reducedData } = useLoaderData<typeof loader>()
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen">
        <Outlet />
        {!reducedData && (
          <>
            <Scripts />
            <ScrollRestoration />
          </>
        )}
        <LiveReload />
      </body>
    </html>
  )
}
