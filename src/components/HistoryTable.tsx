import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { touchHistory } from '../lib/linkHistory'
import type { HistoryEntry } from '../lib/linkHistory'
import { PreviewCard } from './PreviewCard'

type HistoryTableProps = {
  entries: HistoryEntry[]
  onRemove: (code: string) => void
}

export function HistoryTable({ entries, onRemove }: HistoryTableProps) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: ['longUrl', 'code'],
        threshold: 0.35,
      }),
    [entries],
  )

  const visible = query.trim() ? fuse.search(query).map((r) => r.item) : entries

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="mt-8 w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Your links on this device ({entries.length})
        </h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-56"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
          No links match "{query}"
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {visible.map((entry) => (
              <HistoryRow
                key={entry.code}
                entry={entry}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function HistoryRow({
  entry,
  onRemove,
}: {
  entry: HistoryEntry
  onRemove: (code: string) => void
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <li className="bg-white px-4 py-3 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={entry.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => touchHistory(entry.code)}
            className="block break-all text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {entry.shortUrl}
          </a>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{entry.longUrl}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              touchHistory(entry.code)
              copy(entry.shortUrl)
            }}
            aria-label="Copy short link"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(entry.code)}
            aria-label="Remove from history"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <PreviewCard code={entry.code} />
    </li>
  )
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15V6a2 2 0 012-2h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 12a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
