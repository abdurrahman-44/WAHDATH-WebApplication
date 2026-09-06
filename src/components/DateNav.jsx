import { addDays, todayStr } from '../services/prayerEngine'

export default function DateNav({ date, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
        className="rounded-xl border border-emerald-100 px-3 py-2 text-sm dark:border-night-line"
      >
        ‹
      </button>
      <input
        type="date"
        aria-label="Select date"
        value={date}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
      />
      <button
        type="button"
        aria-label="Next day"
        onClick={() => onChange(addDays(date, 1))}
        className="rounded-xl border border-emerald-100 px-3 py-2 text-sm dark:border-night-line"
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => onChange(todayStr())}
        className="rounded-pill bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 dark:bg-night-card dark:text-emerald-100"
      >
        Today
      </button>
    </div>
  )
}
