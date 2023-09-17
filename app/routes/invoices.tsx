import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { getInvoiceListItems } from "~/models/invoice.server";

function pluralize(word: string, pluralVersion = `${word}s`) {
  return (count: number, includeCount = false) => {
    const prefix = includeCount ? `${count} ` : "";
    return count === 1 ? `${prefix}${word}` : `${prefix}${pluralVersion}`;
  };
}

const pluralIs = pluralize("is", "are");
const pluralInvoice = pluralize("invoice");

export async function loader() {
  const invoiceListItems = await getInvoiceListItems();
  const count = invoiceListItems.length;

  return json({
    invoiceListItems,
    count,
    subheading: {
      base: pluralInvoice(count, true),
      sm: `There ${pluralIs(count)} ${count} total ${pluralInvoice(count)}`,
    },
  });
}

export default function Invoices() {
  const { invoiceListItems, subheading } = useLoaderData<typeof loader>();
  return (
    <main className="px-6 py-8">
      <div className="flex mb-8 items-center">
        <div className="flex-grow">
          <h1 className="font-bold text-3xl">Invoices</h1>
          <p className="sm:hidden">{subheading.base}</p>
          <p className="hidden sm:block">{subheading.sm}</p>
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
              className="grid grid-cols-2 rounded-lg bg-gray-200 p-6 gap-6"
            >
              <h2 className="before:content-['#']">{invoice.fid}</h2>
              <p className="justify-self-end">{invoice.clientName}</p>
              <div className="self-end">
                <p>{invoice.total}</p>
                <p>{invoice.dueDate}</p>
              </div>
              <p className="justify-self-end self-end">{invoice.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found</p>
      )}
    </main>
  );
}
