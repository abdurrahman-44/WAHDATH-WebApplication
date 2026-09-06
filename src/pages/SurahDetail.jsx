import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuranData } from '../hooks/useQuranData'
import { getSurah } from '../services/quranService'
import { loadJSON, saveJSON } from '../utils/storage'

const FONT_SIZES = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' }

export default function SurahDetail() {
  const { surahId } = useParams()
  const { data, loading, error } = useQuranData()
  const [fontSize, setFontSize] = useState('md')
  const [showTranslation, setShowTranslation] = useState(true)
  const [bookmarks, setBookmarks] = useState(() => loadJSON('quran:bookmarks', []))

  const surah = data ? getSurah(data, surahId) : null

  useEffect(() => {
    if (!surah) return
    const hash = window.location.hash
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [surah])

  const toggleBookmark = (ayah) => {
    const exists = bookmarks.some((b) => b.surahId === surah.id && b.ayah === ayah)
    const next = exists
      ? bookmarks.filter((b) => !(b.surahId === surah.id && b.ayah === ayah))
      : [...bookmarks, { surahId: surah.id, surahName: surah.transliteration, ayah }]
    setBookmarks(next)
    saveJSON('quran:bookmarks', next)
  }

  const markLastRead = (ayah) => {
    saveJSON('quran:lastRead', { surahId: surah.id, surahName: surah.transliteration, ayah })
  }

  const copyAyah = async (verse) => {
    const text = `${verse.text}\n${verse.translation}\n— ${surah.transliteration} ${verse.id}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard unavailable — fail quietly.
    }
  }

  const shareAyah = async (verse) => {
    const text = `${verse.translation}\n— Qur'an, ${surah.transliteration} ${verse.id}`
    if (navigator.share) {
      try { await navigator.share({ text }) } catch { /* user cancelled */ }
    } else {
      copyAyah(verse)
    }
  }

  if (loading) return <p className="text-sm text-ink-soft dark:text-white/50">Loading surah…</p>
  if (error) {
    return (
      <p className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
        Couldn't load this surah right now. Please check your connection and try again.
      </p>
    )
  }
  if (!surah) {
    return (
      <p className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
        Surah not found.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <Link to="/quran" className="text-sm font-medium text-emerald-600 dark:text-emerald-100">← Qur'an</Link>

      <div className="rounded-card bg-emerald-900 p-6 text-white">
        <p className="text-xs font-medium tracking-wide text-emerald-100/70">
          SURAH {surah.id} · {surah.type.toUpperCase()} · {surah.total_verses} VERSES
        </p>
        <h1 className="mt-1 font-display text-2xl">{surah.transliteration}</h1>
        <p className="text-emerald-100/70">{surah.translation}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          aria-label="Arabic font size"
          className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
        >
          <option value="sm">Small text</option>
          <option value="md">Medium text</option>
          <option value="lg">Large text</option>
        </select>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={`rounded-pill border px-4 py-2 text-sm font-medium ${
            showTranslation
              ? 'border-emerald-900 bg-emerald-900 text-white'
              : 'border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/60'
          }`}
        >
          Translation {showTranslation ? 'on' : 'off'}
        </button>
      </div>

      <div className="space-y-3">
        {surah.verses.map((verse) => {
          const bookmarked = bookmarks.some((b) => b.surahId === surah.id && b.ayah === verse.id)
          return (
            <article
              key={verse.id}
              id={`ayah-${verse.id}`}
              className="rounded-card border border-emerald-100 bg-white p-5 scroll-mt-24 dark:border-night-line dark:bg-night-card"
            >
              <div className="flex items-center justify-between text-sm text-ink-soft dark:text-white/50">
                <span>Ayah {verse.id}</span>
                <div className="flex gap-3">
                  <button onClick={() => toggleBookmark(verse.id)} className={bookmarked ? 'text-brass-600' : ''}>
                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button onClick={() => copyAyah(verse)}>Copy</button>
                  <button onClick={() => shareAyah(verse)}>Share</button>
                  <button onClick={() => markLastRead(verse.id)}>Mark read</button>
                </div>
              </div>
              <p className={`arabic mt-4 ${FONT_SIZES[fontSize]}`}>{verse.text}</p>
              {showTranslation && <p className="mt-3 text-ink-soft dark:text-white/70">{verse.translation}</p>}
            </article>
          )
        })}
      </div>

      <p className="text-xs text-ink-soft dark:text-white/40">
        Translation: Saheeh International, via Tanzil.net. Arabic text: The Noble Qur'an Encyclopedia. CC BY-SA 4.0.
      </p>
    </div>
  )
}
