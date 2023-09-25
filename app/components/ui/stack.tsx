import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { cn } from '~/lib/utils'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  gap?: 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12
}

const gapMap = {
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
} satisfies Record<NonNullable<StackProps['gap']>, string>

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ asChild, className, gap = 4, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'

    return (
      <Comp
        ref={ref}
        className={cn('flex flex-col', gapMap[gap], className)}
        {...props}
      />
    )
  },
)
Stack.displayName = 'Stack'

export { Stack }
