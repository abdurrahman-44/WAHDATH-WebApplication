import { useState } from 'react'
import { usePrayerData } from '../context/PrayerDataContext'
import { parseAndValidateCsv } from '../utils/csvImport'

export default function Admin() {
  const { activeData, baseTimetable, isOverridden, importOverride, clearOverride } = usePrayerData()
  const [parsed, setParsed] = useState(null)
  const [sourceLabel, setSourceLabel] = useState('')
  const [locationLabel, setLocationLabel] = useState('')

  const onFile = async (file) => {
    if (!file) return
    const text = await file.text()
    const result = parseAndValidateCsv(text)
    setParsed(result)
    setSourceLabel(file.name)
  }

  const confirmImport = () => {
    if (!parsed || parsed.rows.length === 0) return
    importOverride({
      source: `Admin CSV import (${sourceLabel})`,
      location: locationLabel || 'Base',
      days: parsed.rows
    })
    setParsed(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-semibold">Admin</h1>
        <p className="mt-1 text-xs text-brass-600">
          Demo-only screen. This build has no real authentication — do not expose this route in production
          without a proper backend/database auth layer (section 13).
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
          CURRENT PRAYER DATA
        </h2>
        <div className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
          <p className="text-sm">
            Active source: <span className="font-medium">{activeData.source ?? activeData.location}</span>
          </p>
          <p className="text-sm text-ink-soft dark:text-white/50">
            {activeData.days?.length ?? 0} rows{activeData.importedAt ? ` · imported ${new Date(activeData.importedAt).toLocaleString()}` : ''}
          </p>
          {isOverridden && (
            <button
              onClick={clearOverride}
              className="mt-3 rounded-pill border border-emerald-100 px-4 py-2 text-sm font-medium text-ink-soft dark:border-night-line dark:text-white/60"
            >
              Revert to shipped base data ({baseTimetable.location})
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
          IMPORT YEARLY TIMETABLE
        </h2>
        <div className="rounded-card border border-emerald-100 bg-white p-5 dark:border-night-line dark:bg-night-card">
          <p className="text-xs text-ink-soft dark:text-white/50">
            CSV columns: date,fajr,dhuhr,asr,maghrib,isha (shuruq optional)
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="mt-3 block text-sm"
          />
          <input
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Location label for this data (e.g. Jaffna, Northern)"
            className="mt-3 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night dark:text-white"
          />

          {parsed && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">
                {parsed.rows.length} row(s) parsed successfully
                {parsed.errors.length > 0 && `, ${parsed.errors.length} row(s) failed`}
              </p>
              {parsed.errors.length > 0 && (
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {parsed.errors.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.message}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={confirmImport}
                disabled={parsed.rows.length === 0}
                className="rounded-pill bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                Save as active timetable
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
          LOCATION RULE
        </h2>
        <p className="rounded-card border border-emerald-100 bg-white p-5 text-sm text-ink-soft dark:border-night-line dark:bg-night-card dark:text-white/60">
          Eastern Province currently applies a −6 minute adjustment (configurable in{' '}
          <code className="rounded bg-emerald-50 px-1 py-0.5 dark:bg-night">src/services/prayerEngine.js</code>
          's <code className="rounded bg-emerald-50 px-1 py-0.5 dark:bg-night">PROVINCE_ADJUSTMENTS</code>).
        </p>
      </section>
    </div>
  )
}
