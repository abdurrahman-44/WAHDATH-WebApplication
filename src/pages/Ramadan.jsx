import { useMemo } from 'react'
import { useNow } from '../hooks/useNow'
import { useUserLocation } from '../context/LocationContext'
import { usePrayerData } from '../context/PrayerDataContext'
import { getPrayerTimesForDate, resolveAdjustment, formatDate, formatCountdown, addDays } from '../services/prayerEngine'
import { gregorianToHijri } from '../utils/hijri'

/** Approximate: scan forward day-by-day for the next 1 Ramadan (arithmetic Hijri method). */
function findRamadanBounds(from = new Date()) {
  let cursor = new Date(from)
  let start = null
  for (let i = 0; i < 400; i++) {
    const h = gregorianToHijri(cursor)
    if (h.month === 9 && h.day === 1) { start = new Date(cursor); break }
    cursor.setDate(cursor.getDate() + 1)
  }
  if (!start) return null
  const end = new Date(start)
  end.setDate(end.getDate() + 29) // Ramadan is 29 or 30 days; treated as an estimate.
  return { start, end }
}

/** The Ramadan month currently underway, or the upcoming one — for the mini calendar. */
function findRamadanStartForCalendar(now, isRamadan) {
  if (isRamadan) {
    // Walk backwards to day 1 of the current Ramadan.
    const h = gregorianToHijri(now)
    return addDays(formatDate(now), -(h.day - 1))
  }
  const bounds = findRamadanBounds(now)
  return bounds ? formatDate(bounds.start) : null
}

export default function Ramadan() {
  const now = useNow(1000)
  const { location, adjustmentMode } = useUserLocation()
  const { activeData } = usePrayerData()
  const adjustment = resolveAdjustment(location.province, adjustmentMode)

  const hijriToday = gregorianToHijri(now)
  const isRamadan = hijriToday.month === 9

  // Only needed to show an estimated start date when not currently in Ramadan.
  const bounds = useMemo(() => (isRamadan ? null : findRamadanBounds(now)), [now, isRamadan])

  const todayStr = formatDate(now)
  const todayTimes = getPrayerTimesForDate(activeData, todayStr, adjustment)?.times

  let suhoorTarget = null
  let iftarTarget = null
  if (todayTimes?.fajr) {
    const [h, m] = todayTimes.fajr.split(':').map(Number)
    suhoorTarget = new Date(now); suhoorTarget.setHours(h, m, 0, 0)
    if (suhoorTarget < now) suhoorTarget = null
  }
  if (todayTimes?.maghrib) {
    const [h, m] = todayTimes.maghrib.split(':').map(Number)
    iftarTarget = new Date(now); iftarTarget.setHours(h, m, 0, 0)
    if (iftarTarget < now) iftarTarget = null
  }

  const calendarStart = useMemo(
    () => findRamadanStartForCalendar(now, isRamadan),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formatDate(now), isRamadan]
  )

  const calendarDays = useMemo(() => {
    if (!calendarStart) return []
    return Array.from({ length: 30 }, (_, i) => {
      const dateStr = addDays(calendarStart, i)
      const times = getPrayerTimesForDate(activeData, dateStr, adjustment)?.times
      return { dateStr, day: i + 1, fajr: times?.fajr, maghrib: times?.maghrib }
    })
  }, [calendarStart, activeData, adjustment])

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Ramadan</h1>
      <p className="text-xs text-ink-soft dark:text-white/50">
        Ramadan dates shown here are calculated with an approximate arithmetic Hijri method — always confirm the
        start of Ramadan with local moon-sighting announcements.
      </p>

      {isRamadan ? (
        <>
          <div className="rounded-card bg-emerald-900 p-6 text-white">
            <p className="text-xs font-medium tracking-wide text-emerald-100/70">RAMADAN</p>
            <p className="font-display text-3xl">Day {hijriToday.day}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
              <p className="text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">SUHOOR ENDS</p>
              <p className="mt-1 font-display text-2xl">{todayTimes?.fajr ?? '—'}</p>
              {suhoorTarget && <p className="mt-1 text-sm text-ink-soft dark:text-white/50">in {formatCountdown(suhoorTarget, now)}</p>}
            </div>
            <div className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
              <p className="text-xs font-medium tracking-wide text-brass-600">IFTAR</p>
              <p className="mt-1 font-display text-2xl">{todayTimes?.maghrib ?? '—'}</p>
              {iftarTarget && <p className="mt-1 text-sm text-ink-soft dark:text-white/50">in {formatCountdown(iftarTarget, now)}</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-card border border-emerald-100 bg-white p-6 dark:border-night-line dark:bg-night-card">
          <p className="text-sm text-ink-soft dark:text-white/60">
            Ramadan hasn't started yet this year (estimated).
            {bounds && (
              <> Estimated start: <span className="font-medium text-ink dark:text-white">{formatDate(bounds.start)}</span>.</>
            )}
          </p>
        </div>
      )}

      <section className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
        <p className="text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
          COMMONLY RECITED AT IFTAR
        </p>
        <p className="arabic mt-3 text-lg">اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ</p>
        <p className="mt-2 text-sm italic text-ink-soft dark:text-white/60">
          Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizqika aftartu
        </p>
        <p className="mt-2 text-ink-soft dark:text-white/70">
          O Allah, I fasted for You, I believe in You, I put my trust in You, and I break my fast with the
          provision You gave me.
        </p>
        <p className="mt-3 text-xs text-ink-soft dark:text-white/40">
          A widely recited traditional dua — presented here as common practice, not as a specific hadith citation
          with an asserted authenticity grade.
        </p>
      </section>

      {calendarDays.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Ramadan calendar (estimated)</h2>
          <div className="overflow-hidden rounded-card border border-emerald-100 dark:border-night-line">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left dark:bg-night-card">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-ink-soft dark:text-white/60">Day</th>
                  <th className="px-4 py-2.5 font-medium text-ink-soft dark:text-white/60">Date</th>
                  <th className="px-4 py-2.5 font-medium text-ink-soft dark:text-white/60">Suhoor ends (Fajr)</th>
                  <th className="px-4 py-2.5 font-medium text-ink-soft dark:text-white/60">Iftar (Maghrib)</th>
                </tr>
              </thead>
              <tbody>
                {calendarDays.map((d) => (
                  <tr
                    key={d.dateStr}
                    className={`border-t border-emerald-50 dark:border-night-line ${
                      d.dateStr === todayStr ? 'bg-brass-400/10' : ''
                    }`}
                  >
                    <td className="px-4 py-2 tabular-nums">{d.day}</td>
                    <td className="px-4 py-2">{d.dateStr}</td>
                    <td className="px-4 py-2 tabular-nums">{d.fajr ?? '—'}</td>
                    <td className="px-4 py-2 tabular-nums">{d.maghrib ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
