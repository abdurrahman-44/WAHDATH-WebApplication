import { NavLink } from 'react-router-dom'
import Logo from './Logo'

const items = [
  { to: '/', label: 'Home', end: true },
  { to: '/prayer', label: 'Prayer' },
  { to: '/quran', label: "Qur'an" },
  { to: '/tools', label: 'Tools' },
  { to: '/ai', label: 'Ask WAHDATH' },
  { to: '/profile', label: 'Profile' }
]

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-emerald-100 bg-parchment/90 backdrop-blur md:block dark:border-night-line dark:bg-night/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
        <NavLink to="/" className="flex items-center gap-3">
          <Logo size={36} />
          <span>
            <span className="block font-display text-lg font-semibold tracking-tight">WAHDATH</span>
            <span className="block text-[11px] text-ink-soft dark:text-white/50">Your Muslim Companion</span>
          </span>
        </NavLink>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-white'
                    : 'text-ink-soft hover:bg-emerald-50 dark:text-white/70 dark:hover:bg-night-card'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
