import { Link } from 'react-router-dom'
import NextPrayerCard from '../components/NextPrayerCard'
import PrayerList from '../components/PrayerList'
import { useNextPrayer } from '../hooks/useNextPrayer'
import { loadJSON } from '../utils/storage'

const QUICK_ACTIONS = [
  { to: '/quran', label: "Qur'an", hint: 'Read, search, bookmark' },
  { to: '/tools/qibla', label: 'Qibla', hint: 'Find the direction' },
  { to: '/tools/tasbih', label: 'Tasbih', hint: 'Digital dhikr counter' },
  { to: '/prayer/calendar', label: 'Calendar', hint: 'Monthly timetable' },
  { to: '/tools/ramadan', label: 'Ramadan', hint: 'Suhoor & Iftar' }
]

export default function Home() {
  const { statuses } = useNextPrayer()
  const lastRead = loadJSON('quran:lastRead', null)

  return (
    <div className="space-y-6">
      <NextPrayerCard />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Today's prayers</h2>
          <Link to="/prayer" className="text-sm font-medium text-emerald-600 dark:text-emerald-100">
            Full timetable →
          </Link>
        </div>
        <PrayerList prayers={statuses} />
      </section>

      <section>
        <Link
          to={lastRead ? `/quran/${lastRead.surahId}#ayah-${lastRead.ayah}` : '/quran'}
          className="flex items-center justify-between rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card"
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">CONTINUE QUR'AN</p>
            <p className="mt-1 font-display text-lg">
              {lastRead ? `${lastRead.surahName}, Ayah ${lastRead.ayah}` : 'Start reading'}
            </p>
          </div>
          <span aria-hidden="true" className="text-2xl text-emerald-600 dark:text-emerald-100">→</span>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-card border border-emerald-100 bg-white p-4 transition-colors hover:border-emerald-400 dark:border-night-line dark:bg-night-card"
            >
              <p className="font-display text-base">{a.label}</p>
              <p className="mt-1 text-xs text-ink-soft dark:text-white/50">{a.hint}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
