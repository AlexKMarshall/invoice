import * as React from 'react'

import { cn } from '~/lib/utils'

import type { TextProps } from './text'
import { Text } from './text'

const ErrorMessage = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={cn('text-destructive text-sm', className)}
        {...props}
      />
    )
  },
)
ErrorMessage.displayName = 'ErrorMessage'

export { ErrorMessage }
