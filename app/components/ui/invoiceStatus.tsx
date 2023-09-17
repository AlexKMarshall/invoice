import type { z } from "zod";

import { Badge } from "~/components/ui/badge";
import type { InvoiceModel } from "~/schemas";

export function InvoiceStatus({
  status,
  className,
}: {
  status: z.infer<typeof InvoiceModel>["status"];
  className?: string;
}) {
  const statusMap = {
    paid: "success",
    pending: "warning",
    draft: "default",
  } as const;
  return (
    <Badge className={className} variant={statusMap[status]}>
      {status}
    </Badge>
  );
}
