import { PRAYER_LABELS } from '../services/prayerEngine'

const ORDER = ['fajr', 'shuruq', 'dhuhr', 'asr', 'maghrib', 'isha']
const OBLIGATORY = new Set(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])

export default function PrayerTimesGrid({ times }) {
  if (!times) {
    return (
      <div className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
        Prayer times are not available for this date yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {ORDER.filter((k) => times[k]).map((k) => (
        <article
          key={k}
          className={`rounded-card border p-4 ${
            OBLIGATORY.has(k) ? 'border-emerald-100 dark:border-night-line' : 'border-transparent bg-emerald-50/60 dark:bg-night-card/60'
          }`}
        >
          <p className="text-sm text-ink-soft dark:text-white/50">{PRAYER_LABELS[k]}</p>
          <p className="mt-2 font-display text-lg tabular-nums">{times[k]}</p>
        </article>
      ))}
    </div>
  )
}
