// claude.js
//
// The only place in this whole project that talks to an LLM. It is only
// ever called with ayahs that retrieval.js already found by keyword
// search — the model is told explicitly it may not go beyond them.

const API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-5'

const SYSTEM_PROMPT = `You are the explanation layer of WAHDATH, a Quran-verse assistant for Muslims in Sri Lanka.

You will be given a user's question and a fixed list of Quran ayahs that a keyword search already retrieved. Rules, no exceptions:
- Only discuss the ayahs provided to you. Never quote, reference, or imply the existence of any other ayah, hadith, or source.
- Never issue a religious ruling (fatwa) or claim scholarly authority. If the question needs one, say so plainly and recommend consulting a qualified Islamic scholar.
- Keep the explanation short (2-4 sentences per ayah), in plain language, focused only on what the ayah's given translation actually says.
- Clearly separate: the Arabic/translation (already shown to the user, don't repeat it) from your explanation, which is AI-generated commentary, not scripture.
- If none of the provided ayahs actually answer the question, say so honestly instead of stretching an unrelated verse to fit.
- Never claim certainty about matters of unseen (ghayb), specific rulings, or anything not directly stated in the given translations.
- Output plain text only, no markdown headers, no verse text repetition — just the explanation.`

export async function explainAyahs(question, ayahs) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY is not configured on the server.')
    err.code = 'NO_API_KEY'
    throw err
  }

  const context = ayahs
    .map((a) => `${a.surahName} (${a.surahMeaning}) ${a.surahNumber}:${a.ayahNumber} — "${a.translation}"`)
    .join('\n')

  const userMessage = `Question: ${question}\n\nRetrieved ayahs:\n${context}\n\nExplain how these ayahs relate to the question, ayah by ayah, following your rules.`

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const err = new Error(`Claude API error ${response.status}: ${body}`)
    err.code = 'UPSTREAM_ERROR'
    throw err
  }

  const data = await response.json()
  const textBlock = data.content?.find((b) => b.type === 'text')
  return textBlock?.text?.trim() ?? ''
}
