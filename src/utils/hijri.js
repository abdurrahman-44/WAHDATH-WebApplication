// hijri.js
// Approximate Gregorian → Hijri conversion (tabular/arithmetic method).
// This is intentionally NOT presented as astronomically precise — actual
// Hijri dates depend on local moon-sighting announcements. Section 20
// requires we not overclaim precision, so the UI must always show this
// alongside a "approximate — follow local moon sighting" note.

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
]

export function gregorianToHijri(date = new Date()) {
  const jd = Math.floor(
    (date.getTime() - Date.UTC(1970, 0, 1)) / 86400000
  ) + 2440588

  let l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l =
    l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29
  const month = Math.floor((24 * l) / 709)
  const day = l - Math.floor((709 * month) / 24)
  const year = 30 * n + j - 30

  return { year, month, day, monthName: HIJRI_MONTHS[month - 1] }
}

export function formatHijri(date = new Date()) {
  const h = gregorianToHijri(date)
  return `${h.day} ${h.monthName} ${h.year} AH`
}
