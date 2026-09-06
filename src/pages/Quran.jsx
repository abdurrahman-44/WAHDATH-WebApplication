import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import surahIndex from '../data/quran-surahs.json'
import { useQuranData } from '../hooks/useQuranData'
import { searchQuran } from '../services/quranService'
import { loadJSON } from '../utils/storage'

export default function Quran() {
  const [query, setQuery] = useState('')
  const { data, loading, error } = useQuranData()
  const lastRead = loadJSON('quran:lastRead', null)
  const bookmarks = loadJSON('quran:bookmarks', [])

  const results = useMemo(() => {
    if (!data || !query.trim()) return null
    return searchQuran(data, query)
  }, [data, query])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Qur'an</h1>
        <p className="text-sm text-ink-soft dark:text-white/50">
          114 surahs · Arabic (Uthmani) with the Saheeh International translation
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search surah, ayah number, or translation…"
        className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-2.5 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
      />

      {lastRead && !query && (
        <Link
          to={`/quran/${lastRead.surahId}#ayah-${lastRead.ayah}`}
          className="block rounded-card border border-emerald-100 bg-white p-4 text-sm dark:border-night-line dark:bg-night-card"
        >
          Continue reading: <span className="font-medium">{lastRead.surahName}, Ayah {lastRead.ayah}</span>
        </Link>
      )}

      {loading && (
        <p className="text-sm text-ink-soft dark:text-white/50">Loading the full Qur'an text…</p>
      )}
      {error && (
        <p className="rounded-card border border-dashed border-emerald-100 p-4 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
          Couldn't load Qur'an data right now. Please check your connection and try again.
        </p>
      )}

      {results ? (
        <SearchResults results={results} bookmarks={bookmarks} />
      ) : (
        !loading && <SurahGrid />
      )}
    </div>
  )
}

function SurahGrid() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {surahIndex.map((s) => (
        <Link
          key={s.id}
          to={`/quran/${s.id}`}
          className="flex items-center justify-between rounded-card border border-emerald-100 bg-white p-4 transition-colors hover:border-emerald-400 dark:border-night-line dark:bg-night-card"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-medium text-emerald-600 dark:bg-night dark:text-emerald-100">
              {s.id}
            </span>
            <div>
              <p className="font-display text-base">{s.transliteration}</p>
              <p className="text-xs text-ink-soft dark:text-white/50">
                {s.translation} · {s.total_verses} verses · {s.type}
              </p>
            </div>
          </div>
          <span className="arabic text-lg text-ink-soft dark:text-white/60">{s.name}</span>
        </Link>
      ))}
    </div>
  )
}

function SearchResults({ results, bookmarks }) {
  if (results.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
        No ayahs match that search.
      </p>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-soft dark:text-white/40">{results.length} result(s)</p>
      {results.map((r) => {
        const bookmarked = bookmarks.some((b) => b.surahId === r.surahId && b.ayah === r.ayah)
        return (
          <Link
            key={`${r.surahId}-${r.ayah}`}
            to={`/quran/${r.surahId}#ayah-${r.ayah}`}
            className="block rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card"
          >
            <p className="text-sm text-ink-soft dark:text-white/50">
              {r.surahName} ({r.surahMeaning}) · {r.ayah} {bookmarked && '· Bookmarked'}
            </p>
            <p className="arabic mt-3 text-xl">{r.arabic}</p>
            <p className="mt-2 text-ink-soft dark:text-white/70">{r.translation}</p>
          </Link>
        )
      })}
    </div>
  )
}
