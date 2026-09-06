// quranService.js
//
// The 114-surah metadata list (src/data/quran-surahs.json) is small enough
// to bundle statically — it powers the Surah browser instantly.
//
// The full text + translation (public/quran/quran-en.json, ~2.4MB) is
// fetched lazily on first use and cached in memory for the session, so the
// initial app bundle stays small but search/reading only ever pays the
// download cost once. The PWA service worker also precaches this file for
// offline use (see vite.config.js).

let fullDataPromise = null

export function loadFullQuran() {
  if (!fullDataPromise) {
    fullDataPromise = fetch('/quran/quran-en.json').then((res) => {
      if (!res.ok) throw new Error(`Failed to load Qur'an data (${res.status})`)
      return res.json()
    })
  }
  return fullDataPromise
}

export function getSurah(fullData, surahNumber) {
  return fullData?.find((s) => s.id === Number(surahNumber)) ?? null
}

/**
 * Search across every ayah's translation (and transliteration of the surah
 * name) for a query. Returns matches with surah context attached, capped at
 * `limit` so a broad query doesn't render thousands of results at once.
 */
export function searchQuran(fullData, query, limit = 60) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results = []
  for (const surah of fullData) {
    if (results.length >= limit) break
    const surahMatches = surah.transliteration.toLowerCase().includes(q) || surah.name.includes(query)
    for (const verse of surah.verses) {
      if (results.length >= limit) break
      if (surahMatches || verse.translation.toLowerCase().includes(q) || String(verse.id) === q) {
        results.push({
          surahId: surah.id,
          surahName: surah.transliteration,
          surahMeaning: surah.translation,
          ayah: verse.id,
          arabic: verse.text,
          translation: verse.translation
        })
      }
    }
  }
  return results
}
