import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { PreviewCard } from './PreviewCard'
import type { ShortenFailureKind } from '../api'

type ResultPanelProps =
  | { kind: 'success'; shortUrl: string; code: string }
  | { kind: 'error'; errorKind: ShortenFailureKind }

const ERROR_COPY: Record<ShortenFailureKind, { title: string; detail: string }> = {
  invalid: {
    title: "That URL didn't work",
    detail: 'The server rejected it as an invalid or empty URL. Double-check it and try again.',
  },
  rate_limited: {
    title: "You're going a little too fast",
    detail: 'Please wait a moment before shortening another link.',
  },
  server: {
    title: 'Something went wrong on our end',
    detail: "We couldn't shorten that link right now. Please try again in a bit.",
  },
  network: {
    title: "Couldn't reach the server",
    detail: 'Check your connection (or that the backend is running) and try again.',
  },
}

export function ResultPanel(props: ResultPanelProps) {
  if (props.kind === 'success') {
    return <SuccessPanel shortUrl={props.shortUrl} code={props.code} />
  }
  return <ErrorPanel errorKind={props.errorKind} />
}

function SuccessPanel({ shortUrl, code }: { shortUrl: string; code: string }) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div>
      <div
        role="status"
        className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Your short link is ready
          </p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block truncate text-lg font-semibold text-emerald-900 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-700 dark:text-emerald-200 dark:decoration-emerald-600"
          >
            {shortUrl}
          </a>
        </div>
        <button
          type="button"
          onClick={() => copy(shortUrl)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900"
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied
            </>
          ) : (
            <>
              <CopyIcon />
              Copy
            </>
          )}
        </button>
      </div>
      <PreviewCard code={code} />
    </div>
  )
}

function ErrorPanel({ errorKind }: { errorKind: ShortenFailureKind }) {
  const { title, detail } = ERROR_COPY[errorKind]
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800/60 dark:bg-rose-950/40"
    >
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{title}</p>
      <p className="mt-0.5 text-sm text-rose-600/90 dark:text-rose-300/80">{detail}</p>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 15V6a2 2 0 012-2h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
