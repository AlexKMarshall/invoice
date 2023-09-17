import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex justify-center items-baseline rounded-md px-4.5 py-3.5 capitalize before:w-2 before:h-2 before:rounded-full gap-2 font-bold",
  {
    variants: {
      variant: {
        success: "bg-success/5 text-success before:bg-success",
        warning: "bg-warning/5 text-warning before:bg-warning",
        default:
          "bg-[hsl(231_20%_27%/5%)] text-[hsl(231_20%_27%)] before:bg-[hsl(231_20%_27%)] dark:bg-palette-5/5 dark:text-palette-5 dark:before:bg-palette-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
