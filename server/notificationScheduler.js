// notificationScheduler.js
//
// Runs on an interval and, for every stored subscription, checks whether
// any of that user's enabled prayers (minus their chosen offset) falls
// within the current tick window. If so, sends a real push notification.
//
// Deliberately reuses src/services/{prayerEngine,locationService}.js —
// the exact same pure functions the frontend uses to render the "next
// prayer" card — so the server can never disagree with what the app shows
// the user. Section 25 requires this to be real, not a fake countdown.

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPrayerTimesForDate, resolveAdjustment, timeToMinutes, formatDate, PRAYER_LABELS } from '../src/services/prayerEngine.js'
import { getAllSubscriptions, markSent, wasSent, removeSubscription } from './subscriptionStore.js'
import { ensureConfigured, webpush } from './webpush.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'prayer-times-colombo-2026.json')

let baseDataCache = null
async function loadBaseData() {
  if (!baseDataCache) {
    baseDataCache = JSON.parse(await readFile(BASE_DATA_PATH, 'utf-8'))
  }
  return baseDataCache
}

const TICK_MS = 20_000 // check every 20s — tight enough to not miss a minute-resolution target

export function startNotificationScheduler() {
  if (!ensureConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('[wahdath-notify] VAPID keys not set — Adhan push notifications are disabled.')
    return
  }
  // eslint-disable-next-line no-console
  console.log('[wahdath-notify] Adhan notification scheduler started.')
  setInterval(() => tick().catch((e) => console.error('[wahdath-notify] tick failed:', e)), TICK_MS)
}

async function tick() {
  const now = new Date()
  const dateStr = formatDate(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const baseData = await loadBaseData()
  const subs = await getAllSubscriptions()

  for (const { endpoint, subscription, preferences } of subs) {
    const prefs = preferences || {}
    const enabledPrayers = prefs.enabledPrayers || []
    const offsets = prefs.offsets ?? [0]
    if (enabledPrayers.length === 0) continue

    const adjustment = resolveAdjustment(prefs.province, prefs.adjustmentMode)
    const times = getPrayerTimesForDate(baseData, dateStr, adjustment)?.times
    if (!times) continue

    for (const prayerKey of enabledPrayers) {
      const timeStr = times[prayerKey]
      if (!timeStr) continue
      const prayerMinutes = timeToMinutes(timeStr)

      for (const offset of offsets) {
        const targetMinutes = prayerMinutes - offset
        // Fires once per (date, prayer, offset) when now crosses the target
        // minute — the 20s tick means we can land anywhere inside that
        // minute, so compare on minute granularity, not exact equality.
        if (Math.abs(nowMinutes - targetMinutes) > 0) continue
        // eslint-disable-next-line no-await-in-loop
        if (await wasSent(endpoint, dateStr, prayerKey, offset)) continue

        const title = offset === 0 ? `${PRAYER_LABELS[prayerKey]} time` : `${PRAYER_LABELS[prayerKey]} in ${offset} min`
        const body = offset === 0 ? `It's time for ${PRAYER_LABELS[prayerKey]} (${timeStr}).` : `${PRAYER_LABELS[prayerKey]} at ${timeStr}.`

        // eslint-disable-next-line no-await-in-loop
        await sendNotification(endpoint, subscription, { title, body, prayerKey })
        // eslint-disable-next-line no-await-in-loop
        await markSent(endpoint, dateStr, prayerKey, offset)
      }
    }
  }
}

async function sendNotification(endpoint, subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired or was revoked by the browser — clean it up.
      await removeSubscription(endpoint)
    } else {
      // eslint-disable-next-line no-console
      console.error('[wahdath-notify] push send failed:', err.message)
    }
  }
}
