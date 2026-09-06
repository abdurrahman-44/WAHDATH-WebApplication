import { Link } from 'react-router-dom'

const TOOLS = [
  { to: '/tools/qibla', label: 'Qibla', hint: 'Direction and distance to the Kaaba' },
  { to: '/tools/tasbih', label: 'Tasbih', hint: 'Digital dhikr counter' },
  { to: '/prayer/calendar', label: 'Prayer Calendar', hint: 'Full monthly timetable' },
  { to: '/tools/ramadan', label: 'Ramadan', hint: 'Suhoor, Iftar and countdown' },
  { to: '/tools/hijri', label: 'Islamic Calendar', hint: 'Hijri date reference' },
  { to: '/hadith', label: 'Hadith', hint: "An-Nawawi's Forty Hadith" }
]

export default function Tools() {
  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Tools</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="rounded-card border border-emerald-100 bg-white p-5 transition-colors hover:border-emerald-400 dark:border-night-line dark:bg-night-card"
          >
            <p className="font-display text-lg">{t.label}</p>
            <p className="mt-1 text-xs text-ink-soft dark:text-white/50">{t.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
