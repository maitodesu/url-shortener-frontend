/**
 * Basic, non-exhaustive client-side sanity check for "does this look like a
 * URL". The backend remains the real source of truth for validation — this
 * only exists to catch obvious typos before we make a network request.
 *
 * If the input is missing a scheme (e.g. "example.com/page"), we assume
 * "https://" so users don't have to type the protocol themselves.
 */
export function normalizeAndValidateUrl(
  input: string,
): { valid: true; normalized: string } | { valid: false } {
  const trimmed = input.trim()
  if (!trimmed) {
    return { valid: false }
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return { valid: false }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { valid: false }
  }

  // Require something resembling a domain: at least one dot, or localhost.
  const hostname = url.hostname
  if (!hostname || (!hostname.includes('.') && hostname !== 'localhost')) {
    return { valid: false }
  }

  return { valid: true, normalized: url.toString() }
}
