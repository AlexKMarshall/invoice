import * as React from 'react'

import { cn } from '~/lib/utils'

export interface CurrencyValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  currencyParts: string[]
}

export const CurrencyValue = React.forwardRef<
  HTMLSpanElement,
  CurrencyValueProps
>(({ currencyParts, className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      {...props}
      className={cn('inline-flex gap-[0.5ch]', className)}
    >
      {currencyParts.map((part, index) => (
        <span key={index}>{part}</span>
      ))}
    </span>
  )
})

CurrencyValue.displayName = 'CurrencyValue'
