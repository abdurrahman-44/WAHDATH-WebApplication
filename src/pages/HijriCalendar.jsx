import { useNow } from '../hooks/useNow'
import { formatHijri } from '../utils/hijri'

export default function HijriCalendar() {
  const now = useNow(60000)
  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Islamic calendar</h1>
      <div className="rounded-card border border-emerald-100 bg-white p-6 dark:border-night-line dark:bg-night-card">
        <p className="text-sm text-ink-soft dark:text-white/50">
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-2 font-display text-3xl">{formatHijri(now)}</p>
        <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
          Calculated with an approximate arithmetic method — it is not astronomically precise. For religious
          observances, follow your local mosque or moon-sighting committee's announcement.
        </p>
      </div>
    </div>
  )
}
