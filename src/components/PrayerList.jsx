const STATUS_META = {
  passed: { symbol: '✓', className: 'text-emerald-400/60 dark:text-white/30' },
  current: { symbol: '●', className: 'text-emerald-600 dark:text-emerald-100' },
  next: { symbol: '●', className: 'text-brass-600 dark:text-brass-400' },
  upcoming: { symbol: '○', className: 'text-ink-soft dark:text-white/40' }
}

export default function PrayerList({ prayers }) {
  if (!prayers?.length) {
    return (
      <div className="rounded-card border border-dashed border-emerald-100 p-6 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
        Prayer times are not available for this location yet. Please choose another nearby location.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {prayers.map((p) => {
        const meta = STATUS_META[p.status] ?? STATUS_META.upcoming
        return (
          <article
            key={p.key}
            className={`rounded-card border p-4 transition-colors ${
              p.status === 'next'
                ? 'border-brass-400 bg-brass-400/5'
                : 'border-emerald-100 dark:border-night-line'
            }`}
          >
            <div className="flex items-center justify-between text-sm text-ink-soft dark:text-white/50">
              <span>{p.label}</span>
              <span aria-hidden="true" className={meta.className}>{meta.symbol}</span>
            </div>
            <p className="mt-3 font-display text-xl tabular-nums">{p.time}</p>
            <span className="sr-only">{p.status}</span>
          </article>
        )
      })}
    </div>
  )
}
