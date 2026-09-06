import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-3xl">Page not found</p>
      <p className="mt-2 text-sm text-ink-soft dark:text-white/50">This screen doesn't exist in WAHDATH yet.</p>
      <Link to="/" className="mt-5 rounded-pill bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white">
        Back to Home
      </Link>
    </div>
  )
}
