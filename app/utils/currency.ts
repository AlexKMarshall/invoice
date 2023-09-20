import type { CompleteInvoice } from '~/schemas'

import { splitArray } from './misc'

export function getCurrencyParts(
  amount: number,
  {
    currency,
    locale = 'en-GB',
  }: { currency: CompleteInvoice['currency']; locale?: string },
) {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(amount)

  return splitArray(parts, (part) => part.type === 'currency').map((parts) =>
    parts.map((part) => part.value).join(''),
  )
}
