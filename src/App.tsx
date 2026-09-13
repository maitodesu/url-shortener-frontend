import { useState } from 'react'
import { shortenUrl } from './api'
import type { ShortenFailureKind } from './api'
import { ShortenForm } from './components/ShortenForm'
import { ResultPanel } from './components/ResultPanel'
import { HistoryTable } from './components/HistoryTable'
import { addToHistory, getHistory, removeFromHistory } from './lib/linkHistory'

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; shortUrl: string }
  | { status: 'error'; kind: ShortenFailureKind }

function App() {
  const [state, setState] = useState<ViewState>({ status: 'idle' })
  const [history, setHistory] = useState(() => getHistory())

  async function handleSubmit(normalizedUrl: string) {
    setState({ status: 'loading' })
    const result = await shortenUrl(normalizedUrl)
    if (result.ok) {
      setState({ status: 'success', shortUrl: result.shortUrl })
      addToHistory({ code: result.code, longUrl: normalizedUrl, shortUrl: result.shortUrl })
      setHistory(getHistory())
    } else {
      setState({ status: 'error', kind: result.kind })
    }
  }

  function handleRemove(code: string) {
    removeFromHistory(code)
    setHistory(getHistory())
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <main className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-indigo-600/10 p-3 dark:bg-indigo-400/10">
            <LinkIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Make your links shorter
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
            Paste a long URL below and get a short, shareable link in an instant.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <ShortenForm
            disabled={state.status === 'loading'}
            onSubmit={handleSubmit}
            onInvalid={() => setState({ status: 'idle' })}
          />

          {state.status !== 'idle' && state.status !== 'loading' && (
            <div className="mt-5">
              {state.status === 'success' ? (
                <ResultPanel kind="success" shortUrl={state.shortUrl} />
              ) : (
                <ResultPanel kind="error" errorKind={state.kind} />
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          No accounts, no tracking dashboards — just paste and go.
        </p>

        <HistoryTable entries={history} onRemove={handleRemove} />
      </main>
    </div>
  )
}

function LinkIcon() {
  return (
    <svg
      className="h-7 w-7 text-indigo-600 dark:text-indigo-400"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 15l6-6M10.5 6.5l1-1a4 4 0 115.5 5.5l-1.5 1.5M13.5 17.5l-1 1a4 4 0 11-5.5-5.5l1.5-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default App
