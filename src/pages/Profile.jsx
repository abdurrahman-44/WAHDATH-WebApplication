import { Link } from 'react-router-dom'
import { useUserLocation } from '../context/LocationContext'
import { loadJSON } from '../utils/storage'

export default function Profile() {
  const { location } = useUserLocation()
  const bookmarks = loadJSON('quran:bookmarks', [])

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Profile</h1>

      <div className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
        <p className="text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">GUEST MODE</p>
        <p className="mt-1 text-sm text-ink-soft dark:text-white/60">
          You're using WAHDATH without an account. Your preferences are saved on this device only.
        </p>
        <p className="mt-3 text-sm">
          Location: <span className="font-medium">{location.city}, {location.district}</span>
        </p>
        <p className="text-sm">
          Bookmarked ayahs: <span className="font-medium">{bookmarks.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/settings" className="rounded-card border border-emerald-100 bg-white p-4 dark:border-night-line dark:bg-night-card">
          Settings
        </Link>
        <Link to="/about" className="rounded-card border border-emerald-100 bg-white p-4 dark:border-night-line dark:bg-night-card">
          About WAHDATH
        </Link>
      </div>
    </div>
  )
}
