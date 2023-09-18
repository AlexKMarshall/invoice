/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

/**
 * Combine multiple response init objects into one (uses combineHeaders)
 */
export function combineResponseInits(
  ...responseInits: Array<ResponseInit | null | undefined>
): ResponseInit {
  const combined: ResponseInit = {}
  for (const responseInit of responseInits) {
    Object.assign(combined, responseInit, {
      headers: combineHeaders(combined.headers, responseInit?.headers),
    })
  }
  return combined
}
