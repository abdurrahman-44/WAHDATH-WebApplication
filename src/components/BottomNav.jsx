import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home', end: true },
  { to: '/prayer', label: 'Prayer' },
  { to: '/quran', label: 'Quran' },
  { to: '/tools', label: 'Tools' },
  { to: '/profile', label: 'Profile' }
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-30 flex justify-around border-t border-emerald-100 bg-white/95 backdrop-blur px-2 py-2 md:hidden dark:bg-night-card dark:border-night-line"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'text-emerald-600 dark:text-emerald-100' : 'text-ink-soft dark:text-white/60'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden="true"
                className={`block h-1.5 w-1.5 rounded-full bg-current transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
