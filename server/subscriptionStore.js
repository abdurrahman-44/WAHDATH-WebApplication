// subscriptionStore.js
//
// A minimal, file-backed store for push subscriptions and each user's
// notification preferences. A real deployment would use a proper database
// (see section 41's suggested `notifications` table) — this keeps the demo
// runnable with zero extra infrastructure while being honest that it's not
// production-grade multi-instance storage.

import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_PATH = path.join(__dirname, 'subscriptions.json')

let cache = null

async function load() {
  if (cache) return cache
  try {
    const raw = await readFile(STORE_PATH, 'utf-8')
    cache = JSON.parse(raw)
  } catch {
    cache = {}
  }
  return cache
}

async function persist() {
  await writeFile(STORE_PATH, JSON.stringify(cache, null, 2))
}

/**
 * Upserts a subscription keyed by its push endpoint (unique per browser
 * install). `preferences` = { province, district, city, adjustmentMode,
 * enabledPrayers: ['fajr', ...], offsets: [0, 5, 10] }
 */
export async function saveSubscription(endpoint, subscription, preferences) {
  const store = await load()
  store[endpoint] = { subscription, preferences, sentLog: store[endpoint]?.sentLog ?? {} }
  await persist()
}

export async function removeSubscription(endpoint) {
  const store = await load()
  delete store[endpoint]
  await persist()
}

export async function getAllSubscriptions() {
  const store = await load()
  return Object.entries(store).map(([endpoint, v]) => ({ endpoint, ...v }))
}

/** Marks (prayer, offset) as already sent for `dateStr`, so the scheduler never double-sends. */
export async function markSent(endpoint, dateStr, prayerKey, offset) {
  const store = await load()
  if (!store[endpoint]) return
  const key = `${dateStr}:${prayerKey}:${offset}`
  store[endpoint].sentLog[key] = true
  // Keep the log from growing forever — a real DB would just query by date.
  const keys = Object.keys(store[endpoint].sentLog)
  if (keys.length > 200) {
    for (const k of keys.slice(0, keys.length - 200)) delete store[endpoint].sentLog[k]
  }
  await persist()
}

export async function wasSent(endpoint, dateStr, prayerKey, offset) {
  const store = await load()
  return !!store[endpoint]?.sentLog?.[`${dateStr}:${prayerKey}:${offset}`]
}
