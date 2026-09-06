// hadithService.js
//
// Loads An-Nawawi's Forty Hadith (42 hadith, full Arabic + English, CC BY
// 4.0 licensed — see public/hadith/ATTRIBUTION.md) and provides search.
// This is one well-established, clearly-licensed collection, not the full
// canonical hadith corpus (Bukhari, Muslim, etc.) — see the app's README
// for why, and how to add a complete licensed dataset later.

let dataPromise = null

export function loadHadiths() {
  if (!dataPromise) {
    dataPromise = fetch('/hadith/nawawi-40-full.json').then((res) => {
      if (!res.ok) throw new Error(`Failed to load Hadith data (${res.status})`)
      return res.json()
    })
  }
  return dataPromise
}

export function searchHadiths(data, query) {
  const q = query.trim().toLowerCase()
  if (!q) return data.hadiths
  return data.hadiths.filter(
    (h) =>
      h.english.toLowerCase().includes(q) ||
      h.narrator.toLowerCase().includes(q) ||
      String(h.number) === q
  )
}
