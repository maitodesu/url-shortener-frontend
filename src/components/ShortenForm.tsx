import { useState } from 'react'
import type { FormEvent } from 'react'
import { normalizeAndValidateUrl } from '../lib/validateUrl'

type ShortenFormProps = {
  disabled: boolean
  onSubmit: (normalizedUrl: string) => void
  /** Called when the client-side check rejects the input, so the parent can
   *  clear out any stale result from a previous successful submission. */
  onInvalid: () => void
}

export function ShortenForm({ disabled, onSubmit, onInvalid }: ShortenFormProps) {
  const [value, setValue] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (disabled) return

    const result = normalizeAndValidateUrl(value)
    if (!result.valid) {
      setLocalError("That doesn't look like a valid URL. Try something like example.com/page")
      onInvalid()
      return
    }
    setLocalError(null)
    onSubmit(result.normalized)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="long-url" className="sr-only">
          Long URL
        </label>
        <input
          id="long-url"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Paste a long URL, e.g. https://example.com/a/very/long/path"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value)
            if (localError) setLocalError(null)
          }}
          aria-invalid={localError ? 'true' : 'false'}
          aria-describedby={localError ? 'url-error' : undefined}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/15"
        />
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 active:bg-indigo-700"
        >
          {disabled ? (
            <>
              <Spinner />
              Shortening…
            </>
          ) : (
            'Shorten'
          )}
        </button>
      </div>
      {localError && (
        <p id="url-error" role="alert" className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">
          {localError}
        </p>
      )}
    </form>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
