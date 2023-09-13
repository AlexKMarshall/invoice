import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";

import { getInvoiceListItems } from "~/models/invoice.server";

export async function loader() {
  const invoiceListItems = await getInvoiceListItems();

  return json({ invoiceListItems, count: invoiceListItems.length });
}

function pluralize(word: string, count: number, plural?: string) {
  plural ??= `${word}s`;
  return count === 1 ? word : plural;
}

export default function Invoices() {
  const { invoiceListItems, count } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Invoices</h1>
      <p>
        There {pluralize("is", count, "are")} {count} total{" "}
        {pluralize("invoice", count)}
      </p>
      <Link to="new">New invoice</Link>
      <Outlet />
      {invoiceListItems.length ? (
        <ul>
          {invoiceListItems.map((invoice) => (
            <li key={invoice.id}>
              <div>#{invoice.fid}</div>
              <div>{invoice.clientName}</div>
              <div>{invoice.total}</div>
              <div>{format(new Date(invoice.dueDate), "y-MM-dd")}</div>
              <div>{invoice.status}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found</p>
      )}
    </main>
  );
}
