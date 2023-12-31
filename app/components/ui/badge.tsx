import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md px-4.5 py-4 font-bold capitalize text-base before:h-2 before:w-2 before:rounded-full',
  {
    variants: {
      variant: {
        success: 'bg-success/5 text-success before:bg-success',
        warning: 'bg-warning/5 text-warning before:bg-warning',
        default:
          'bg-palette-13/5 text-palette-13 before:bg-palette-13 dark:bg-palette-5/5 dark:text-palette-5 dark:before:bg-palette-5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className="leading-trim">{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
