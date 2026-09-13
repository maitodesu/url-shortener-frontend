// API base URL is configurable at build time via VITE_API_BASE_URL,
// falling back to the local Go backend's default port for dev.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type ShortenSuccess = {
  ok: true
  shortUrl: string
  code: string
}

export type ShortenFailureKind = 'invalid' | 'rate_limited' | 'server' | 'network'

export type ShortenFailure = {
  ok: false
  kind: ShortenFailureKind
}

export type ShortenResult = ShortenSuccess | ShortenFailure

/**
 * Calls POST /short on the backend and normalizes every outcome (success,
 * the documented error statuses, and network-level failures) into a
 * ShortenResult so the UI never has to deal with raw backend error strings.
 */
export async function shortenUrl(longUrl: string): Promise<ShortenResult> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/short`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    })
  } catch {
    return { ok: false, kind: 'network' }
  }

  if (response.status === 201) {
    const data = (await response.json().catch(() => null)) as { code?: string } | null
    if (!data?.code) {
      return { ok: false, kind: 'server' }
    }
    return {
      ok: true,
      code: data.code,
      shortUrl: `${API_BASE_URL}/${data.code}`,
    }
  }

  if (response.status === 429) {
    return { ok: false, kind: 'rate_limited' }
  }

  if (response.status === 400) {
    return { ok: false, kind: 'invalid' }
  }

  return { ok: false, kind: 'server' }
}

export type LinkPreview = {
  title?: string
  description?: string
  siteName?: string
  image?: { url: string } | null
  favicon?: { url: string } | null
}

/**
 * Calls GET /{code}/preview. Returns null on any failure (missing preview,
 * network error, bad response) rather than throwing -- this is a nice-to-have
 * enhancement, so a failure here should never surface as an error to the user,
 * just mean no preview card renders.
 */
export async function getPreview(code: string): Promise<LinkPreview | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${code}/preview`)
    if (!response.ok) return null
    return (await response.json()) as LinkPreview
  } catch {
    return null
  }
}
