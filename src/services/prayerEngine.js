// prayerEngine.js
//
// WAHDATH prayer-time engine.
//
// Responsible for:
//   - Reading BASE DATA (the raw uploaded timetable) without ever mutating it
//   - Producing LOCATION-SPECIFIC times by applying a configurable adjustment
//   - Looking up a day's times even when the base timetable is sparse
//     (the supplied Colombo 2026 sheet only has an entry every ~5 days —
//     the old app did an exact-date match and silently failed 4 days out
//     of 5. This engine interpolates between the two surrounding rows.)
//   - Computing "next prayer" + a countdown that is always correct across
//     midnight, month, and year boundaries.

export const OBLIGATORY_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export const PRAYER_LABELS = {
  fajr: 'Fajr',
  shuruq: 'Sunrise',
  dhuha: 'Dhuha',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
}

// Province-level adjustments. Kept as data, not scattered logic, so an
// admin can change/extend this without touching the calculation code.
// Section 6: Eastern Province = base time − 6 minutes.
export const PROVINCE_ADJUSTMENTS = {
  Eastern: -6
}

const pad2 = (n) => String(n).padStart(2, '0')

/** "HH:MM" -> minutes since 00:00 */
export function timeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/**
 * Normalize minutes into a valid 0–1439 range and format as "HH:MM".
 * Never returns something like "24:05" or "-02:10" — this is what
 * section 6 requires ("adjustment never creates invalid times").
 */
export function minutesToTime(mins) {
  const normalized = ((Math.round(mins) % 1440) + 1440) % 1440
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`
}

export function formatDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function todayStr() {
  return formatDate(new Date())
}

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

/**
 * Resolve the adjustment (in minutes) to apply for a given province,
 * honoring a manual override from Settings ('auto' | number).
 */
export function resolveAdjustment(province, mode) {
  if (mode === 'auto' || mode === undefined || mode === null) {
    return PROVINCE_ADJUSTMENTS[province] ?? 0
  }
  const n = Number(mode)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Find the base-data row for a date. If there's no exact row (sparse
 * timetable), linearly interpolate between the nearest row before and
 * the nearest row after. At the edges of the dataset, fall back to the
 * closest available row rather than failing.
 */
export function getBaseRowForDate(baseData, dateStr) {
  const days = baseData?.days ?? []
  if (days.length === 0) return null

  const exact = days.find((d) => d.date === dateStr)
  if (exact) return { row: exact, interpolated: false }

  const target = new Date(`${dateStr}T00:00:00`).getTime()
  let before = null
  let after = null
  for (const row of days) {
    const t = new Date(`${row.date}T00:00:00`).getTime()
    if (t <= target && (!before || t > new Date(`${before.date}T00:00:00`).getTime())) before = row
    if (t >= target && (!after || t < new Date(`${after.date}T00:00:00`).getTime())) after = row
  }

  if (before && after && before.date !== after.date) {
    const t0 = new Date(`${before.date}T00:00:00`).getTime()
    const t1 = new Date(`${after.date}T00:00:00`).getTime()
    const ratio = (target - t0) / (t1 - t0)
    const fields = ['fajr', 'shuruq', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha']
    const interpolatedRow = { date: dateStr }
    for (const f of fields) {
      const m0 = timeToMinutes(before[f])
      const m1 = timeToMinutes(after[f])
      if (m0 == null || m1 == null) continue
      interpolatedRow[f] = minutesToTime(m0 + ratio * (m1 - m0))
    }
    return { row: interpolatedRow, interpolated: true }
  }

  // Outside the dataset's range — use whichever edge row exists.
  const edge = before || after
  return edge ? { row: edge, interpolated: true } : null
}

/**
 * Full set of prayer times for a date, with the province adjustment
 * applied to every field, normalized to a valid time.
 */
export function getPrayerTimesForDate(baseData, dateStr, adjustmentMinutes) {
  const result = getBaseRowForDate(baseData, dateStr)
  if (!result) return null
  const { row, interpolated } = result
  const fields = ['fajr', 'shuruq', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha']
  const times = {}
  for (const f of fields) {
    const mins = timeToMinutes(row[f])
    if (mins == null) continue
    times[f] = minutesToTime(mins + adjustmentMinutes)
  }
  return { date: dateStr, times, interpolated, day: row.day ?? null }
}

/**
 * Determine the next upcoming prayer relative to `now`, correctly
 * rolling from Isha into the *next calendar day's* Fajr, and correctly
 * handling the case where `now` is exactly at a prayer time.
 *
 * Returns { key, label, dateStr, minutes, target: Date } or null if the
 * timetable has no usable data at all.
 */
export function getNextPrayer(baseData, adjustmentMinutes, now = new Date()) {
  const todayDateStr = formatDate(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60

  const today = getPrayerTimesForDate(baseData, todayDateStr, adjustmentMinutes)
  if (today) {
    for (const key of OBLIGATORY_PRAYERS) {
      const t = today.times[key]
      if (t == null) continue
      const mins = timeToMinutes(t)
      if (mins > nowMinutes) {
        return buildNextPrayer(key, todayDateStr, mins)
      }
    }
  }

  // Past Isha (or no data today) — roll to tomorrow's Fajr.
  const tomorrowDateStr = addDays(todayDateStr, 1)
  const tomorrow = getPrayerTimesForDate(baseData, tomorrowDateStr, adjustmentMinutes)
  if (tomorrow?.times?.fajr != null) {
    return buildNextPrayer('fajr', tomorrowDateStr, timeToMinutes(tomorrow.times.fajr))
  }

  return null
}

function buildNextPrayer(key, dateStr, mins) {
  // `mins` is total minutes since midnight (e.g. 273 = 04:33), not hours —
  // convert it correctly rather than splitting on the decimal point.
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  const target = new Date(`${dateStr}T00:00:00`)
  target.setHours(h, m, 0, 0)
  return { key, label: PRAYER_LABELS[key], dateStr, minutes: mins, target }
}

/**
 * Status of each obligatory prayer for "today" relative to now:
 * 'passed' | 'current' | 'next' | 'upcoming'.
 */
export function getPrayerStatuses(baseData, adjustmentMinutes, now = new Date()) {
  const todayDateStr = formatDate(now)
  const today = getPrayerTimesForDate(baseData, todayDateStr, adjustmentMinutes)
  if (!today) return []
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60

  const entries = OBLIGATORY_PRAYERS
    .filter((k) => today.times[k] != null)
    .map((k) => ({ key: k, label: PRAYER_LABELS[k], time: today.times[k], minutes: timeToMinutes(today.times[k]) }))

  const nextIndex = entries.findIndex((e) => e.minutes > nowMinutes)

  return entries.map((e, i) => {
    let status
    if (nextIndex === -1) status = 'passed'
    else if (i < nextIndex - 1 || (nextIndex === -1)) status = 'passed'
    else if (i === nextIndex - 1) status = 'current'
    else if (i === nextIndex) status = 'next'
    else status = 'upcoming'
    return { ...e, status }
  })
}

/** Live countdown string, e.g. "7h 32m 14s". Never negative. */
export function formatCountdown(targetDate, now = new Date()) {
  const totalSeconds = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}h ${pad2(m)}m ${pad2(s)}s`
}
