import { useEffect, useState } from 'react'
import { useUserLocation } from '../context/LocationContext'
import { OBLIGATORY_PRAYERS, PRAYER_LABELS } from '../services/prayerEngine'
import {
  isPushSupported,
  enableAdhanNotifications,
  disableAdhanNotifications,
  getCurrentSubscription
} from '../utils/pushNotifications'
import { loadJSON, saveJSON } from '../utils/storage'

const OFFSET_OPTIONS = [
  { value: 0, label: 'At prayer time' },
  { value: 5, label: '5 min before' },
  { value: 10, label: '10 min before' }
]

export default function NotificationSettings() {
  const { location, adjustmentMode } = useUserLocation()
  const [enabledPrayers, setEnabledPrayers] = useState(() =>
    loadJSON('notifications:prayers', ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])
  )
  const [offsets, setOffsets] = useState(() => loadJSON('notifications:offsets', [0]))
  const [status, setStatus] = useState('checking') // checking | off | on | busy | unsupported
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus('unsupported')
      return
    }
    getCurrentSubscription()
      .then((sub) => setStatus(sub ? 'on' : 'off'))
      .catch(() => setStatus('off'))
  }, [])

  const togglePrayer = (key) => {
    const next = enabledPrayers.includes(key)
      ? enabledPrayers.filter((p) => p !== key)
      : [...enabledPrayers, key]
    setEnabledPrayers(next)
    saveJSON('notifications:prayers', next)
  }

  const toggleOffset = (value) => {
    const next = offsets.includes(value) ? offsets.filter((o) => o !== value) : [...offsets, value]
    setOffsets(next)
    saveJSON('notifications:offsets', next)
  }

  const enable = async () => {
    setError(null)
    setStatus('busy')
    try {
      await enableAdhanNotifications({
        province: location.province,
        district: location.district,
        city: location.city,
        adjustmentMode,
        enabledPrayers,
        offsets: offsets.length ? offsets : [0]
      })
      setStatus('on')
    } catch (err) {
      setError(err.message)
      setStatus('off')
    }
  }

  const disable = async () => {
    setStatus('busy')
    try {
      await disableAdhanNotifications()
    } finally {
      setStatus('off')
    }
  }

  if (status === 'unsupported') {
    return (
      <p className="text-sm text-ink-soft dark:text-white/50">
        This browser doesn't support push notifications, so Adhan reminders aren't available here — try adding
        WAHDATH to your home screen on a supported mobile browser.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft dark:text-white/50">
        Choose which prayers to be notified for, and when — then turn notifications on. This sends real
        notifications from WAHDATH's own server, even when the app isn't open.
      </p>

      <div className="flex flex-wrap gap-2">
        {OBLIGATORY_PRAYERS.map((key) => (
          <button
            key={key}
            onClick={() => togglePrayer(key)}
            className={`rounded-pill border px-4 py-2 text-sm font-medium ${
              enabledPrayers.includes(key)
                ? 'border-emerald-900 bg-emerald-900 text-white'
                : 'border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/60'
            }`}
          >
            {PRAYER_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {OFFSET_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => toggleOffset(o.value)}
            className={`rounded-pill border px-4 py-2 text-sm font-medium ${
              offsets.includes(o.value)
                ? 'border-brass-400 bg-brass-400/10 text-brass-600'
                : 'border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/60'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      )}

      {status === 'on' ? (
        <button
          onClick={disable}
          className="rounded-pill border border-emerald-100 px-5 py-2.5 text-sm font-medium text-ink-soft dark:border-night-line dark:text-white/60"
        >
          Turn off Adhan notifications
        </button>
      ) : (
        <button
          onClick={enable}
          disabled={status === 'busy' || status === 'checking' || enabledPrayers.length === 0}
          className="rounded-pill bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === 'busy' ? 'Enabling…' : 'Enable Adhan notifications'}
        </button>
      )}
    </div>
  )
}
