// ACJU timetable bridge for WAHDATH.
// The public mirror below republishes the official ACJU timetable data.
// WAHDATH uses it only to import exact daily rows; it never calculates
// replacement prayer times for those rows.

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BASE_URL = 'https://www.prayers.lk/timetable.php'

function cleanText(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function to24h(value) {
  const m = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const ap = m[3].toUpperCase()
  if (ap === 'AM' && h === 12) h = 0
  if (ap === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function parseMonth(html, year, month) {
  const rows = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
  let rowMatch

  while ((rowMatch = rowRegex.exec(html))) {
    const cells = []
    let cellMatch
    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      cells.push(cleanText(cellMatch[1]))
    }
    if (cells.length < 7) continue

    const dateMatch = cells[0].match(/(\d{1,2})[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
    if (!dateMatch) continue

    const times = cells.slice(1, 7).map(to24h)
    if (times.some((t) => !t)) continue

    const day = Number(dateMatch[1])
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    rows.push({
      date,
      day: new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long' }),
      fajr: times[0],
      shuruq: times[1],
      dhuhr: times[2],
      asr: times[3],
      maghrib: times[4],
      isha: times[5]
    })
  }

  return rows
}

const cache = new Map()

export async function fetchAcjuZoneYear(zone, year) {
  const key = `${zone}:${year}`
  if (cache.has(key)) return cache.get(key)

  // Fetch each official monthly timetable through the mirror. If a future
  // year has not been published yet, its pages contain no timetable rows;
  // we return an empty result instead of inventing times.
  const all = []
  const errors = []

  for (let month = 1; month <= 12; month += 1) {
    const url = `${BASE_URL}?district=${encodeURIComponent(zone)}&month=${String(month).padStart(2, '0')}&year=${year}`
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'WAHDATH/1.0 prayer-data importer' }
      })
      if (!response.ok) {
        errors.push(`${MONTH_NAMES[month - 1]}: HTTP ${response.status}`)
        continue
      }
      const html = await response.text()
      const rows = parseMonth(html, year, month)
      all.push(...rows)
      if (rows.length === 0) errors.push(`${MONTH_NAMES[month - 1]}: no timetable rows found`)
    } catch (error) {
      errors.push(`${MONTH_NAMES[month - 1]}: ${error.message}`)
    }
  }

  const days = all.sort((a, b) => a.date.localeCompare(b.date))
  const result = {
    source: 'ACJU official timetable (retrieved via prayers.lk mirror)',
    sourceUrl: 'https://www.acju.lk/prayer-times/',
    zone: Number(zone),
    year: Number(year),
    days,
    complete: days.length >= (Number(year) % 4 === 0 ? 366 : 365),
    errors
  }

  cache.set(key, result)
  return result
}
