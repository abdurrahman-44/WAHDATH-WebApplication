import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DateNav from '../components/DateNav'
import LocationSelector from '../components/LocationSelector'
import PrayerTimesGrid from '../components/PrayerTimesGrid'
import NextPrayerCard from '../components/NextPrayerCard'
import { useUserLocation } from '../context/LocationContext'
import { usePrayerData } from '../context/PrayerDataContext'
import { getPrayerTimesForDate, resolveAdjustment, todayStr } from '../services/prayerEngine'

export default function Prayer() {
  const [date, setDate] = useState(todayStr())
  const { location, adjustmentMode } = useUserLocation()
  const { activeData, isOverridden, ensureYear, getYearData, loadingYears, yearErrors } = usePrayerData()

  useEffect(() => { ensureYear(Number(date.slice(0, 4))) }, [date, ensureYear])

  const selectedYear = Number(date.slice(0, 4))
  const dataForDate = getYearData(selectedYear) ?? (selectedYear === new Date().getFullYear() ? activeData : null)
  const adjustment = resolveAdjustment(location.province, adjustmentMode)
  const result = getPrayerTimesForDate(dataForDate, date, adjustment)
  const year = selectedYear
  const zoneKey = location?.district || 'Colombo'
  const isLoading = !!loadingYears[`${zoneKey}:${year}`]
  const yearError = yearErrors[`${zoneKey}:${year}`]

  return (
    <div className="space-y-6">
      <NextPrayerCard />

      <section className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-semibold">Prayer times</h1>
          <Link to="/prayer/calendar" className="text-sm font-medium text-emerald-600 dark:text-emerald-100">
            Monthly calendar →
          </Link>
        </div>

        <LocationSelector />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <DateNav date={date} onChange={setDate} />
          <span className="rounded-pill bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-night dark:text-emerald-100">
            {adjustment === 0 ? 'Standard/base time' : `${adjustment > 0 ? '+' : ''}${adjustment} min applied`}
          </span>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="rounded-card border border-emerald-100 bg-emerald-50/50 p-5 text-sm text-ink-soft dark:border-night-line dark:bg-night-card dark:text-white/60">Loading the official ACJU timetable…</div>
          ) : (
            <PrayerTimesGrid times={result?.times} />
          )}
        </div>

        {yearError && !result?.times && (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
            The official ACJU timetable is not currently available for {year}. No times have been invented or calculated.
          </p>
        )}

        {result?.interpolated && !isLoading && (
          <p className="mt-3 text-xs text-ink-soft dark:text-white/50">
            Estimated by interpolating between the nearest available timetable entries for this location.
          </p>
        )}

        <p className="mt-4 text-xs text-ink-soft dark:text-white/50">
          Prayer times source: {isOverridden ? activeData.source ?? 'Admin import' : (dataForDate?.source ?? 'ACJU official timetable')}.
          {dataForDate?.complete ? ' Daily ACJU data loaded.' : ' Some dates may fall back to the bundled timetable.'}
        </p>
      </section>
    </div>
  )
}
