import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "Invoicing app" }];

export default function Index() {
  return (
    <main>
      <h1>Main app</h1>
    </main>
  );
}
