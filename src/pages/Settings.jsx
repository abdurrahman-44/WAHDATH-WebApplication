import LocationSelector from '../components/LocationSelector'
import NotificationSettings from '../components/NotificationSettings'
import { useUserLocation } from '../context/LocationContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { adjustmentMode, setAdjustmentMode } = useUserLocation()
  const { mode, setMode } = useTheme()

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-semibold">Settings</h1>

      <SettingsSection title="Location">
        <LocationSelector />
      </SettingsSection>

      <SettingsSection title="Prayer adjustment">
        <select
          value={adjustmentMode}
          onChange={(e) => setAdjustmentMode(e.target.value)}
          className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm dark:border-night-line dark:bg-night-card dark:text-white"
        >
          <option value="auto">Automatic (Eastern Province −6 min)</option>
          <option value="0">No adjustment</option>
          <option value="-6">−6 minutes</option>
          <option value="6">+6 minutes</option>
        </select>
        <p className="mt-2 text-xs text-ink-soft dark:text-white/50">
          Automatic mode applies the Eastern Province rule only; other provinces are unadjusted unless you choose
          a manual offset.
        </p>
      </SettingsSection>

      <SettingsSection title="Theme">
        <div className="flex gap-2">
          {['light', 'dark', 'system'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-pill border px-4 py-2 text-sm font-medium capitalize ${
                mode === m
                  ? 'border-emerald-900 bg-emerald-900 text-white'
                  : 'border-emerald-100 text-ink-soft dark:border-night-line dark:text-white/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <NotificationSettings />
      </SettingsSection>

      <SettingsSection title="AI Assistant">
        <p className="text-sm text-ink-soft dark:text-white/50">
          Ask WAHDATH searches the full Qur'an text for matching verses first, then sends only your question and
          those verses to a Claude-powered explanation service to generate plain-language commentary. It never
          invents a verse, and it never issues religious rulings.
        </p>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <p className="text-sm text-ink-soft dark:text-white/50">
          Your location, bookmarks, tasbih counts, and last-read position are stored only on this device (guest
          mode). No account is required for core prayer or Qur'an features. Ask WAHDATH questions are sent to
          the app's own backend to search the Qur'an and generate an explanation — not to any third party. If
          you enable Adhan notifications, your device's push subscription and chosen prayer/location settings
          are stored on WAHDATH's own server so it can send you reminders — turning notifications off removes
          that subscription.
        </p>
      </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-medium tracking-wide text-emerald-600 dark:text-emerald-100">
        {title.toUpperCase()}
      </h2>
      {children}
    </section>
  )
}
