import { useUserLocation } from '../context/LocationContext'
import { useNextPrayer } from '../hooks/useNextPrayer'
import { formatHijri } from '../utils/hijri'

export default function NextPrayerCard() {
  const { location } = useUserLocation()
  const { now, next, countdown } = useNextPrayer()

  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const nextTimeLabel = next
    ? next.target.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—'

  return (
    <section className="rounded-card bg-emerald-900 px-6 py-7 text-white md:px-9 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-emerald-100/70">
            {location.city}, {location.district}
          </p>
          <p className="mt-1 font-display text-xl">{dateLabel}</p>
          <p className="text-sm text-emerald-100/70">{formatHijri(now)} · approximate — follow local moon sighting</p>
        </div>
        <p className="font-display text-3xl tabular-nums text-emerald-50">{timeLabel}</p>
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-brass-400">NEXT PRAYER</p>
          <p className="font-display text-4xl md:text-5xl">{next ? next.label : '—'}</p>
          <p className="mt-1 text-emerald-100/80">in {countdown}</p>
        </div>
        <p className="font-display text-3xl text-emerald-50 md:text-4xl">{nextTimeLabel}</p>
      </div>
    </section>
  )
}
