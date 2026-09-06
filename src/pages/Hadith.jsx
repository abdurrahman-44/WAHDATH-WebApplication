import { useMemo, useState } from 'react'
import { useHadithData } from '../hooks/useHadithData'
import { searchHadiths } from '../services/hadithService'

export default function Hadith() {
  const [query, setQuery] = useState('')
  const { data, loading, error } = useHadithData()

  const results = useMemo(() => (data ? searchHadiths(data, query) : []), [data, query])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Hadith</h1>
        <p className="text-sm text-ink-soft dark:text-white/50">
          An-Nawawi's Forty Hadith{data ? ` — ${data.count} hadith` : ''}
        </p>
      </div>

      <div className="rounded-card border border-dashed border-brass-400 bg-brass-400/5 p-4 text-xs text-ink-soft dark:text-white/60">
        One well-established, clearly licensed collection — not the full canonical hadith corpus (Bukhari,
        Muslim, and others). See the app's README for how a complete licensed dataset can be added.
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search narrator, hadith number, or keywords…"
        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
      />

      {loading && <p className="text-sm text-ink-soft dark:text-white/50">Loading…</p>}
      {error && (
        <p className="rounded-card border border-dashed border-emerald-100 p-4 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
          Couldn't load Hadith data right now. Please check your connection and try again.
        </p>
      )}

      <div className="space-y-3">
        {results.map((h) => (
          <article
            key={h.id}
            className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card"
          >
            <p className="text-sm text-ink-soft dark:text-white/50">Hadith {h.number}</p>
            <p className="mt-2 text-xs italic text-ink-soft dark:text-white/40">{h.narrator}</p>
            {h.arabic && <p className="arabic mt-3 text-lg">{h.arabic}</p>}
            <p className="mt-3 whitespace-pre-line text-ink dark:text-white/80">{h.english}</p>
          </article>
        ))}
        {!loading && results.length === 0 && (
          <p className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
            No hadith matches that search.
          </p>
        )}
      </div>

      {data && (
        <p className="text-xs text-ink-soft dark:text-white/40">
          Source: {data.source} · {data.license}
        </p>
      )}
    </div>
  )
}
