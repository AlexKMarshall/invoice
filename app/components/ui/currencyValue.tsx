export function CurrencyValue({ currencyParts }: { currencyParts: string[] }) {
  return (
    <span className="flex gap-[0.5ch]">
      {currencyParts.map((part, index) => (
        <span key={index}>{part}</span>
      ))}
    </span>
  )
}
