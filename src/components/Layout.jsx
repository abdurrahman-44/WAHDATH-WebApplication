import { Outlet, NavLink } from 'react-router-dom'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import Logo from './Logo'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <header className="flex items-center justify-between border-b border-emerald-100 px-5 py-3 md:hidden dark:border-night-line">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-display text-base font-semibold">WAHDATH</span>
        </NavLink>
        <NavLink
          to="/settings"
          className="rounded-pill border border-emerald-100 px-3 py-1.5 text-xs font-medium text-ink-soft dark:border-night-line dark:text-white/70"
        >
          Settings
        </NavLink>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-8 md:pb-12 md:pt-8">
        <Outlet />
      </main>

      <footer className="hidden border-t border-emerald-100 py-8 text-center text-xs text-ink-soft md:block dark:border-night-line dark:text-white/40">
        WAHDATH — A Digital Muslim Companion for Muslims in Sri Lanka
      </footer>

      <BottomNav />
    </div>
  )
}
