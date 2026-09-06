import { useState } from 'react'

const EXAMPLES = [
  'What does the Quran say about patience?',
  'Which verses talk about parents?',
  'What does Islam say about gratitude?'
]

export default function AiAssistant() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [response, setResponse] = useState(null)

  const ask = async (text) => {
    const question = text.trim()
    if (!question) return
    setQuery(question)
    setState('loading')
    setResponse(null)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question })
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const data = await res.json()
      setResponse(data)
      setState('done')
    } catch (err) {
      setResponse({ error: err.message })
      setState('error')
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-card bg-emerald-900 p-6 text-white">
        <h1 className="font-display text-xl font-semibold">Ask WAHDATH</h1>
        <p className="mt-2 text-sm text-emerald-100/80">
          Assalamu Alaikum 👋 Ask about the Qur'an and I'll help you find relevant verses and understand their
          meaning.
        </p>
      </div>

      <div className="rounded-card border border-dashed border-brass-400 bg-brass-400/5 p-4 text-xs text-ink-soft dark:text-white/60">
        Verses shown below always come from a real keyword search over the full Qur'an text — never invented.
        The short explanation under each one is AI-generated commentary, clearly labeled as such, and never a
        religious ruling. For questions needing scholarly interpretation, please consult a qualified Islamic
        scholar.
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => ask(e)}
            className="rounded-pill border border-emerald-100 px-3 py-1.5 text-xs text-ink-soft dark:border-night-line dark:text-white/60"
          >
            {e}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(query) }} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What does the Quran say about…"
          className="flex-1 rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {state === 'loading' ? 'Searching…' : 'Ask'}
        </button>
      </form>

      {state === 'error' && (
        <p className="rounded-card border border-dashed border-emerald-100 p-4 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
          {response?.error || "Something went wrong. Please check your connection and try again."}
        </p>
      )}

      {state === 'done' && response && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-100">
            {response.ayahs.length ? 'Relevant Quran verses' : 'No matching verses found'}
          </p>

          {response.ayahs.length > 0 && response.explanation && (
            <div
              className={`rounded-card border p-4 text-sm ${
                response.aiGenerated
                  ? 'border-emerald-100 bg-emerald-50/60 dark:border-night-line dark:bg-night-card'
                  : 'border-dashed border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/50'
              }`}
            >
              {response.aiGenerated && (
                <p className="mb-1 text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
                  AI-GENERATED EXPLANATION
                </p>
              )}
              <p className="whitespace-pre-line text-ink dark:text-white/80">{response.explanation}</p>
            </div>
          )}

          {response.ayahs.length === 0 && response.explanation && (
            <p className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
              {response.explanation}
            </p>
          )}

          {response.ayahs.map((a) => (
            <article
              key={`${a.surahNumber}-${a.ayahNumber}`}
              className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card"
            >
              <p className="text-sm text-ink-soft dark:text-white/50">
                {a.surahName} ({a.surahMeaning}) {a.surahNumber}:{a.ayahNumber}
              </p>
              <p className="arabic mt-3 text-xl">{a.arabic}</p>
              <p className="mt-2 text-ink-soft dark:text-white/70">{a.translation}</p>
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-100">
                Source: Qur'an {a.surahNumber}:{a.ayahNumber} · Saheeh International translation
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
