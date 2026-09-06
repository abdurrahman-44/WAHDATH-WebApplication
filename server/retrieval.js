// retrieval.js
//
// Section 31: "Do not simply send every question to an LLM without
// retrieval." This module is the retrieval step — it never touches the
// network or an LLM. It just scores every ayah's English translation
// against the question's keywords and returns the strongest matches.
// The model (in claude.js) is only ever shown ayahs that came from here.

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'public', 'quran', 'quran-en.json')

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'am',
  'do', 'does', 'did', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'about',
  'and', 'or', 'but', 'says', 'say', 'said', 'quran', 'islam', 'according',
  'according', 'verses', 'verse', 'talk', 'talks', 'does', 'my', 'i', 'me'
])

let cachedSurahs = null

async function loadData() {
  if (cachedSurahs) return cachedSurahs
  const raw = await readFile(DATA_PATH, 'utf-8')
  cachedSurahs = JSON.parse(raw)
  return cachedSurahs
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

/**
 * Returns the top `limit` ayahs whose English translation best overlaps
 * the question's keywords. Each result carries surah/ayah numbers, the
 * Arabic text, and the translation — everything the model is later
 * allowed to reference.
 */
export async function retrieveAyahs(question, limit = 5) {
  const surahs = await loadData()
  const keywords = tokenize(question)
  if (keywords.length === 0) return []

  const scored = []
  for (const surah of surahs) {
    for (const verse of surah.verses) {
      const verseWords = tokenize(verse.translation)
      let score = 0
      for (const k of keywords) {
        if (verseWords.includes(k)) score += 1
        // Light partial-match credit for simple plural/tense variants.
        else if (verseWords.some((w) => w.startsWith(k) || k.startsWith(w))) score += 0.5
      }
      if (score > 0) {
        scored.push({
          surahNumber: surah.id,
          surahName: surah.transliteration,
          surahMeaning: surah.translation,
          ayahNumber: verse.id,
          arabic: verse.text,
          translation: verse.translation,
          score
        })
      }
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}
