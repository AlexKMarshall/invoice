export function InvoiceFid({ fid }: { fid: string }) {
  return (
    <>
      <span className="text-muted-foreground dark:[--muted-foreground:231_36%_63%]">
        #
      </span>
      <span>{fid}</span>
    </>
  )
}
