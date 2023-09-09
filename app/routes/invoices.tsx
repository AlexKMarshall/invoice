import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getInvoiceListItems } from "~/models/invoice.server";

export async function loader() {
  const invoiceListItems = await getInvoiceListItems();

  return json({ invoiceListItems });
}

export default function Invoices() {
  const { invoiceListItems } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Invoices</h1>
      <Link to="new">New invoice</Link>
      <Outlet />
      {invoiceListItems.length ? (
        <ul>
          {invoiceListItems.map((invoice) => (
            <li key={invoice.id}>
              <div>{invoice.id}</div>
              <div>{invoice.clientName}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found</p>
      )}
    </main>
  );
}