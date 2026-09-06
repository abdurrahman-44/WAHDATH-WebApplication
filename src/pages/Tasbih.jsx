import { useState } from 'react'
import { loadJSON, saveJSON } from '../utils/storage'

const PRESETS = [
  { label: 'SubhanAllah', goal: 33 },
  { label: 'Alhamdulillah', goal: 33 },
  { label: 'Allahu Akbar', goal: 34 },
  { label: 'Custom', goal: 0 }
]

export default function Tasbih() {
  const [presetIndex, setPresetIndex] = useState(() => loadJSON('tasbih:presetIndex', 0))
  const [count, setCount] = useState(() => loadJSON('tasbih:count', 0))
  const [customGoal, setCustomGoal] = useState(() => loadJSON('tasbih:customGoal', 100))

  const preset = PRESETS[presetIndex]
  const goal = preset.label === 'Custom' ? customGoal : preset.goal

  const persist = (nextCount, nextPresetIndex = presetIndex, nextGoal = customGoal) => {
    saveJSON('tasbih:count', nextCount)
    saveJSON('tasbih:presetIndex', nextPresetIndex)
    saveJSON('tasbih:customGoal', nextGoal)
  }

  const increment = () => {
    const next = count + 1
    setCount(next)
    persist(next)
    if (navigator.vibrate) navigator.vibrate(next === goal ? [40, 30, 40] : 15)
  }

  const reset = () => {
    setCount(0)
    persist(0)
  }

  const selectPreset = (index) => {
    setPresetIndex(index)
    setCount(0)
    persist(0, index)
  }

  const reachedGoal = goal > 0 && count >= goal

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Tasbih</h1>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => selectPreset(i)}
            className={`rounded-pill border px-4 py-2 text-sm font-medium ${
              presetIndex === i
                ? 'border-emerald-900 bg-emerald-900 text-white'
                : 'border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/60'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset.label === 'Custom' && (
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="customGoal">Goal:</label>
          <input
            id="customGoal"
            type="number"
            min={1}
            value={customGoal}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1)
              setCustomGoal(v)
              persist(count, presetIndex, v)
            }}
            className="w-24 rounded-xl border border-emerald-100 bg-white px-3 py-2 dark:border-night-line dark:bg-night-card dark:text-white"
          />
        </div>
      )}

      <button
        onClick={increment}
        className={`flex h-64 w-full flex-col items-center justify-center rounded-card border transition-colors ${
          reachedGoal
            ? 'border-brass-400 bg-brass-400/10'
            : 'border-emerald-100 bg-white dark:border-night-line dark:bg-night-card'
        }`}
      >
        <span className="font-display text-6xl tabular-nums">{count}</span>
        {goal > 0 && <span className="mt-2 text-sm text-ink-soft dark:text-white/50">of {goal}</span>}
        {reachedGoal && <span className="mt-2 text-sm font-medium text-brass-600">Goal reached</span>}
      </button>

      <button
        onClick={reset}
        className="rounded-pill border border-emerald-100 px-5 py-2.5 text-sm font-medium text-ink-soft dark:border-night-line dark:text-white/60"
      >
        Reset
      </button>
    </div>
  )
}
