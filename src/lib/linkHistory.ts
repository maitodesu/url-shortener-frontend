/**
 * Per-browser history of links shortened from this device, kept in
 * localStorage since the backend has no accounts and no "my links" concept.
 *
 * Eviction has two independent rules:
 *  - Grace period: a link that's never been touched again (count stays at 1)
 *    is dropped after GRACE_PERIOD_MS of silence since creation.
 *  - Cap: once the list exceeds MAX_ENTRIES, the least-recently-touched
 *    entries are dropped first (true LRU) -- a link earns protection from
 *    both rules every time it's reused, since that refreshes lastTouched.
 */

export type HistoryEntry = {
  code: string
  longUrl: string
  shortUrl: string
  createdAt: number
  lastTouched: number
  count: number
}

const STORAGE_KEY = 'url-shortener:history'
const MAX_ENTRIES = 500
const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000

function readAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function writeAll(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage unavailable or full -- history is a convenience feature,
    // fail silently rather than breaking the actual shortening flow.
  }
}

function prune(entries: HistoryEntry[], now: number): HistoryEntry[] {
  let result = entries.filter(
    (e) => !(e.count <= 1 && now - e.createdAt > GRACE_PERIOD_MS),
  )

  if (result.length > MAX_ENTRIES) {
    result = [...result]
      .sort((a, b) => b.lastTouched - a.lastTouched)
      .slice(0, MAX_ENTRIES)
  }

  return result
}

/** Returns history sorted most-recently-touched first, pruning as a side effect. */
export function getHistory(): HistoryEntry[] {
  const now = Date.now()
  const pruned = prune(readAll(), now)
  writeAll(pruned)
  return [...pruned].sort((a, b) => b.lastTouched - a.lastTouched)
}

export function addToHistory(entry: {
  code: string
  longUrl: string
  shortUrl: string
}): void {
  const now = Date.now()
  const entries = readAll()
  const existing = entries.find((e) => e.code === entry.code)

  if (existing) {
    existing.lastTouched = now
    existing.count += 1
  } else {
    entries.push({ ...entry, createdAt: now, lastTouched: now, count: 1 })
  }

  writeAll(prune(entries, now))
}

/** Call when a user re-copies/re-visits a link from the history list, so it
 *  earns another grace period and counts as "used" rather than abandoned. */
export function touchHistory(code: string): void {
  const now = Date.now()
  const entries = readAll()
  const entry = entries.find((e) => e.code === code)
  if (!entry) return

  entry.lastTouched = now
  entry.count += 1
  writeAll(prune(entries, now))
}

export function removeFromHistory(code: string): void {
  writeAll(readAll().filter((e) => e.code !== code))
}
