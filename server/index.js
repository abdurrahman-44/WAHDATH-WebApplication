// index.js — WAHDATH AI assistant backend.
//
// Runs the retrieval-then-explain pipeline from section 31:
//   User Question → Quran Search (retrieval.js) → Context Construction
//   → AI Explanation (claude.js) → Citations → Answer
//
// This process is the ONLY place the Anthropic API key is used. It is
// read from the environment (see .env.example) and never sent to, or
// reachable from, the browser (section 42).

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { retrieveAyahs } from './retrieval.js'
import { explainAyahs } from './claude.js'
import { saveSubscription, removeSubscription } from './subscriptionStore.js'
import { startNotificationScheduler } from './notificationScheduler.js'
import { fetchAcjuZoneYear } from './prayerTimes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/ask', async (req, res) => {
  const question = (req.body?.question ?? '').trim()
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' })
  }
  if (question.length > 500) {
    return res.status(400).json({ error: 'Question is too long.' })
  }

  try {
    const ayahs = await retrieveAyahs(question, 5)

    if (ayahs.length === 0) {
      return res.json({
        ayahs: [],
        explanation: "I couldn't find a Quran verse in this dataset that clearly matches your question. Try rephrasing, or ask about a specific topic like patience, parents, or gratitude.",
        aiGenerated: false
      })
    }

    let explanation
    let aiGenerated = true
    try {
      explanation = await explainAyahs(question, ayahs)
    } catch (err) {
      // Retrieval already succeeded and is real data — degrade gracefully
      // to showing just the verses if the model call fails, per section 39
      // (never let the app silently break).
      aiGenerated = false
      explanation =
        err.code === 'NO_API_KEY'
          ? 'AI explanations are not configured on this server yet — showing the matching verses without commentary.'
          : "The AI explanation isn't available right now — showing the matching verses without commentary."
      // eslint-disable-next-line no-console
      console.error('[wahdath-ai] explainAyahs failed:', err.message)
    }

    res.json({ ayahs, explanation, aiGenerated })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[wahdath-ai] /api/ask failed:', err)
    res.status(500).json({ error: 'Something went wrong looking that up. Please try again.' })
  }
})

app.get('/api/prayer-times', async (req, res) => {
  const zone = Number(req.query.zone || 1)
  const year = Number(req.query.year || new Date().getFullYear())
  if (!Number.isInteger(zone) || zone < 1 || zone > 13) {
    return res.status(400).json({ error: 'zone must be an integer from 1 to 13' })
  }
  if (!Number.isInteger(year) || year < 2024 || year > 2035) {
    return res.status(400).json({ error: 'Invalid year' })
  }

  try {
    const result = await fetchAcjuZoneYear(zone, year)
    if (!result.days.length) {
      return res.status(404).json({
        error: `No ACJU timetable is currently available for zone ${zone} in ${year}.`,
        ...result
      })
    }
    res.json(result)
  } catch (err) {
    console.error('[wahdath-prayer] fetch failed:', err)
    res.status(502).json({ error: 'Could not retrieve the ACJU timetable right now.' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// --- Adhan notifications (section 25) ---

app.get('/api/notifications/vapid-public-key', (_req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'Push notifications are not configured on this server.' })
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

app.post('/api/notifications/subscribe', async (req, res) => {
  const { subscription, preferences } = req.body || {}
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'A valid push subscription is required.' })
  }
  try {
    await saveSubscription(subscription.endpoint, subscription, preferences || {})
    res.json({ ok: true })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[wahdath-notify] subscribe failed:', err)
    res.status(500).json({ error: 'Could not save your notification settings. Please try again.' })
  }
})

app.post('/api/notifications/unsubscribe', async (req, res) => {
  const { endpoint } = req.body || {}
  if (!endpoint) return res.status(400).json({ error: 'endpoint is required.' })
  await removeSubscription(endpoint)
  res.json({ ok: true })
})

const port = process.env.PORT || 8787
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`WAHDATH AI server listening on http://localhost:${port}`)
  startNotificationScheduler()
})
