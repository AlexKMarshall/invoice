import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { cn } from '~/lib/utils'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'p'

    return (
      <Comp ref={ref} className={cn('leading-trim', className)} {...props} />
    )
  },
)
Text.displayName = 'Text'

export { Text }
