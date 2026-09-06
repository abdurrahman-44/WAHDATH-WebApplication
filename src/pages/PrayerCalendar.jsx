import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserLocation } from '../context/LocationContext'
import { usePrayerData } from '../context/PrayerDataContext'
import { getPrayerTimesForDate, resolveAdjustment, formatDate } from '../services/prayerEngine'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function PrayerCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const { location, adjustmentMode } = useUserLocation()
  const { activeData, ensureYear, getYearData, loadingYears, yearErrors } = usePrayerData()
  useEffect(() => { ensureYear(year) }, [year, ensureYear])
  const dataForYear = getYearData(year) ?? (year === new Date().getFullYear() ? activeData : null)
  const adjustment = resolveAdjustment(location.province, adjustmentMode)

  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1)
      const dateStr = formatDate(d)
      const result = getPrayerTimesForDate(dataForYear, dateStr, adjustment)
      return { dateStr, weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }), times: result?.times ?? null }
    })
  }, [year, month, dataForYear, adjustment])

  const changeMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/prayer" className="text-sm font-medium text-emerald-600 dark:text-emerald-100">← Prayer</Link>
          <h1 className="font-display text-xl font-semibold">
            {MONTH_NAMES[month]} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {[2026, 2027].map((y) => (
            <button key={y} onClick={() => setYear(y)} className={`rounded-pill px-3 py-2 text-xs font-medium ${year === y ? 'bg-emerald-900 text-white' : 'border border-emerald-100 dark:border-night-line'}`}>{y}</button>
          ))}
          <button onClick={() => changeMonth(-1)} className="rounded-xl border border-emerald-100 px-3 py-2 text-sm dark:border-night-line">‹</button>
          <button onClick={() => changeMonth(1)} className="rounded-xl border border-emerald-100 px-3 py-2 text-sm dark:border-night-line">›</button>
        </div>
      </div>

      {loadingYears[`${location?.district || 'Colombo'}:${year}`] && (
        <p className="rounded-card border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-ink-soft dark:border-night-line dark:bg-night-card dark:text-white/60">Loading official ACJU timetable for {year}…</p>
      )}
      {yearErrors[`${location?.district || 'Colombo'}:${year}`] && !dataForYear?.days?.length && (
        <p className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          No official ACJU timetable is currently available for {year}. WAHDATH will not invent prayer times for this year.
        </p>
      )}

      {/* Mobile: cards */}
      <div className="space-y-2 md:hidden">
        {days.map((d) => (
          <div key={d.dateStr} className="rounded-card border border-emerald-100 bg-white p-4 dark:border-night-line dark:bg-night-card">
            <p className="text-sm font-medium">{d.weekday} · {d.dateStr}</p>
            {d.times ? (
              <div className="mt-2 grid grid-cols-3 gap-y-1 text-sm text-ink-soft dark:text-white/60">
                <span>Fajr {d.times.fajr}</span>
                <span>Dhuhr {d.times.dhuhr}</span>
                <span>Asr {d.times.asr}</span>
                <span>Maghrib {d.times.maghrib}</span>
                <span>Isha {d.times.isha}</span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-soft dark:text-white/50">No data</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-card border border-emerald-100 md:block dark:border-night-line">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-left dark:bg-night-card">
            <tr>
              {['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-ink-soft dark:text-white/60">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.dateStr} className="border-t border-emerald-50 dark:border-night-line">
                <td className="px-4 py-2.5">{d.weekday}, {d.dateStr}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.fajr ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.shuruq ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.dhuhr ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.asr ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.maghrib ?? '—'}</td>
                <td className="px-4 py-2.5 tabular-nums">{d.times?.isha ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
