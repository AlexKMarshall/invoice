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

/**
 * Splits an array into subarrays, where each subarray contains either a single matching element
 * or non-matching elements from the original array, effectively separating matches from non-matches.
 *
 * @template T
 * @param {T[]} arr - The array to split.
 * @param {(element: T) => boolean} predicate - The predicate function to determine matches.
 * @returns {T[][]} An array of subarrays representing portions of the original array,
 *                  with each subarray containing either a matching element or non-matching elements.
 */
export function splitArray<T>(
  arr: T[],
  predicate: (element: T) => boolean,
): T[][] {
  const result: T[][] = []
  let startIndex = 0

  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      if (i > startIndex) {
        result.push(arr.slice(startIndex, i))
      }
      result.push([arr[i]])
      startIndex = i + 1
    }
  }

  if (startIndex < arr.length) {
    result.push(arr.slice(startIndex))
  }

  return result.filter((subarray) => subarray.length > 0)
}
export function generateFid({
  isFidUnique,
  maxIterations = 10,
}: {
  isFidUnique?: (fid: string) => Promise<boolean>
  maxIterations?: number
} = {}) {
  function generator() {
    // generate a 2 character string of random capital letters
    const prefix = Array.from({ length: 2 })
      .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65))
      .join('')
    // generate a 4 digit number
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    return prefix + suffix
  }

  let iterations = 0

  async function generateUniqueFid() {
    if (iterations >= maxIterations) {
      throw new Error(
        'Could not generate a unique fid. Max iterations reached.',
      )
    }
    iterations++

    const fid = generator()
    const isUnique = (await isFidUnique?.(fid)) ?? true
    if (isUnique) {
      return fid
    } else {
      return generateUniqueFid()
    }
  }

  return generateUniqueFid()
}
