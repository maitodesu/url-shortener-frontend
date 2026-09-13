import { useEffect, useState } from 'react'
import { getPreview } from '../api'
import type { LinkPreview } from '../api'

type PreviewCardProps = {
  code: string
}

/**
 * Fetches and shows a small Open Graph-style preview of the shortened
 * link's destination. Fails silently (renders nothing) on any error --
 * this is a nice-to-have, never worth showing an error state for.
 */
export function PreviewCard({ code }: PreviewCardProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPreview(null)

    getPreview(code).then((result) => {
      if (!cancelled) {
        setPreview(result)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [code])

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    )
  }

  if (!preview || (!preview.title && !preview.description)) {
    return null
  }

  const thumbnail = preview.image?.url ?? preview.favicon?.url ?? null

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="min-w-0">
        {preview.title && (
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {preview.title}
          </p>
        )}
        {preview.siteName && (
          <p className="truncate text-xs text-slate-400 dark:text-slate-500">{preview.siteName}</p>
        )}
        {preview.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {preview.description}
          </p>
        )}
      </div>
    </div>
  )
}
