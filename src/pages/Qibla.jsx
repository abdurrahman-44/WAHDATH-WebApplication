import { useEffect, useState } from 'react'
import { qiblaBearing, distanceToKaabaKm } from '../utils/qibla'

const COLOMBO_FALLBACK = { lat: 6.9271, lng: 79.8612 }

export default function Qibla() {
  const [coords, setCoords] = useState(null)
  const [locError, setLocError] = useState(null)
  const [heading, setHeading] = useState(null)
  const [orientationSupported, setOrientationSupported] = useState(false)
  const [orientationPermission, setOrientationPermission] = useState('unknown')

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported on this browser. Showing Colombo as a fallback reference.')
      setCoords(COLOMBO_FALLBACK)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocError('Location permission was denied. Showing Colombo as a fallback reference — grant permission for an accurate reading.')
        setCoords(COLOMBO_FALLBACK)
      }
    )
  }, [])

  useEffect(() => {
    setOrientationSupported(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window)
  }, [])

  const requestOrientation = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission()
        setOrientationPermission(result)
        if (result !== 'granted') return
      } catch {
        setOrientationPermission('denied')
        return
      }
    } else {
      setOrientationPermission('granted')
    }
    window.addEventListener('deviceorientationabsolute', onOrientation, true)
    window.addEventListener('deviceorientation', onOrientation, true)
  }

  const onOrientation = (event) => {
    const alpha = event.webkitCompassHeading ?? (event.alpha != null ? 360 - event.alpha : null)
    if (alpha != null) setHeading(alpha)
  }

  const bearing = coords ? qiblaBearing(coords.lat, coords.lng) : null
  const distance = coords ? distanceToKaabaKm(coords.lat, coords.lng) : null
  const compassRotation = heading != null && bearing != null ? bearing - heading : bearing

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">Qibla finder</h1>

      {locError && (
        <p className="rounded-card border border-dashed border-emerald-100 p-4 text-sm text-ink-soft dark:border-night-line dark:text-white/50">
          {locError}
        </p>
      )}

      <div className="flex flex-col items-center rounded-card border border-emerald-100 bg-white p-8 dark:border-night-line dark:bg-night-card">
        <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-emerald-100 dark:border-night-line">
          <span className="absolute top-2 text-xs text-ink-soft dark:text-white/50">N</span>
          {bearing != null && (
            <div
              className="absolute h-24 w-1 origin-bottom rounded-full bg-brass-600"
              style={{ transform: `rotate(${compassRotation}deg)`, bottom: '50%' }}
              aria-hidden="true"
            />
          )}
          <span className="font-display text-sm text-ink-soft dark:text-white/50">
            {bearing != null ? `${Math.round(bearing)}° from North` : 'Locating…'}
          </span>
        </div>

        <p className="mt-5 text-sm text-ink-soft dark:text-white/60">
          {distance != null ? `${Math.round(distance).toLocaleString()} km to the Kaaba` : ''}
        </p>

        {orientationSupported ? (
          heading == null && (
            <button
              onClick={requestOrientation}
              className="mt-4 rounded-pill bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Enable compass
            </button>
          )
        ) : (
          <p className="mt-4 max-w-xs text-center text-xs text-ink-soft dark:text-white/40">
            This device doesn't support live compass orientation — use the bearing above with a physical compass instead.
          </p>
        )}
        {orientationPermission === 'denied' && (
          <p className="mt-2 text-xs text-ink-soft dark:text-white/40">
            Compass permission was denied — the bearing above is still accurate, just not live-rotating.
          </p>
        )}
      </div>
    </div>
  )
}
