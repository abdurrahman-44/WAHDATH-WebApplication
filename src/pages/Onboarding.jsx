import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LocationSelector from '../components/LocationSelector'
import { useTheme } from '../context/ThemeContext'
import { saveJSON } from '../utils/storage'

const STEPS = ['Welcome', 'Location', 'Notifications', 'Theme', 'Finish']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const { mode, setMode } = useTheme()
  const navigate = useNavigate()

  const finish = () => {
    saveJSON('onboarding:completed', true)
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-emerald-600' : 'bg-emerald-100 dark:bg-night-line'}`} />
        ))}
      </div>

      {step === 0 && (
        <StepCard title="Welcome to WAHDATH" description="Your digital companion for prayer, Qur'an, and everyday Islamic tools in Sri Lanka.">
          <button onClick={() => setStep(1)} className="w-full rounded-pill bg-emerald-900 py-3 text-sm font-medium text-white">Get started</button>
        </StepCard>
      )}

      {step === 1 && (
        <StepCard title="Where are you?" description="This sets your default prayer timetable and location adjustment.">
          <LocationSelector />
          <button onClick={() => setStep(2)} className="mt-4 w-full rounded-pill bg-emerald-900 py-3 text-sm font-medium text-white">Continue</button>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Prayer reminders" description="You can enable Adhan notifications later from Settings. This step is optional.">
          <button onClick={() => setStep(3)} className="w-full rounded-pill bg-emerald-900 py-3 text-sm font-medium text-white">Continue</button>
        </StepCard>
      )}

      {step === 3 && (
        <StepCard title="Choose a theme" description="You can change this anytime in Settings.">
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-pill border py-2.5 text-sm font-medium capitalize ${
                  mode === m ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-emerald-100 dark:border-night-line'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="mt-4 w-full rounded-pill bg-emerald-900 py-3 text-sm font-medium text-white">Continue</button>
        </StepCard>
      )}

      {step === 4 && (
        <StepCard title="You're all set" description="No account needed — WAHDATH works fully in guest mode. You can add one later from Profile.">
          <button onClick={finish} className="w-full rounded-pill bg-emerald-900 py-3 text-sm font-medium text-white">Go to WAHDATH</button>
        </StepCard>
      )}
    </div>
  )
}

function StepCard({ title, description, children }) {
  return (
    <div className="rounded-card border border-emerald-100 bg-white p-6 dark:border-night-line dark:bg-night-card">
      <h1 className="font-display text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft dark:text-white/60">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}
