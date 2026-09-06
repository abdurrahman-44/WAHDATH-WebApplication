// csvImport.js
// Parses and validates an admin-uploaded prayer timetable CSV.
// Expected header: date,fajr,dhuhr,asr,maghrib,isha  (shuruq/dhuha optional extra columns)

const REQUIRED_COLUMNS = ['date', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseAndValidateCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: 'File has no data rows.' }] }
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
  if (missingColumns.length) {
    return {
      rows: [],
      errors: [{ row: 0, message: `Missing required column(s): ${missingColumns.join(', ')}` }]
    }
  }

  const errors = []
  const seenDates = new Set()
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1 // 1-indexed, matches spreadsheet row incl. header
    const raw = lines[i]
    if (!raw.trim()) continue
    const cells = raw.split(',').map((c) => c.trim())
    const record = {}
    header.forEach((h, idx) => { record[h] = cells[idx] ?? '' })

    if (!DATE_RE.test(record.date)) {
      errors.push({ row: rowNum, message: `Invalid date "${record.date}" — expected YYYY-MM-DD.` })
      continue
    }
    if (seenDates.has(record.date)) {
      errors.push({ row: rowNum, message: `Duplicate date "${record.date}".` })
      continue
    }

    let rowValid = true
    for (const field of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      if (!record[field] || !TIME_RE.test(record[field])) {
        errors.push({ row: rowNum, message: `Invalid or missing "${field}" time "${record[field] ?? ''}" — expected HH:MM.` })
        rowValid = false
      }
    }
    if (record.shuruq && !TIME_RE.test(record.shuruq)) {
      errors.push({ row: rowNum, message: `Invalid "shuruq" time "${record.shuruq}".` })
      rowValid = false
    }

    if (!rowValid) continue
    seenDates.add(record.date)
    rows.push(record)
  }

  rows.sort((a, b) => (a.date < b.date ? -1 : 1))

  return { rows, errors }
}
