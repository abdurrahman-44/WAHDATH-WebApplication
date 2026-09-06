import { useMemo } from 'react'
import { useNow } from './useNow'
import { useUserLocation } from '../context/LocationContext'
import { usePrayerData } from '../context/PrayerDataContext'
import { resolveAdjustment, getNextPrayer, getPrayerStatuses, formatCountdown } from '../services/prayerEngine'

export function useNextPrayer() {
  const now = useNow(1000)
  const { location, adjustmentMode } = useUserLocation()
  const { activeData } = usePrayerData()

  const adjustment = resolveAdjustment(location.province, adjustmentMode)

  // Recompute the target prayer only when the minute or the day changes,
  // not every second — the countdown string itself is derived from `now`
  // every tick, but the *target* only needs to move once it's reached.
  const next = useMemo(
    () => getNextPrayer(activeData, adjustment, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeData, adjustment, Math.floor(now.getTime() / 1000)]
  )

  const statuses = useMemo(
    () => getPrayerStatuses(activeData, adjustment, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeData, adjustment, Math.floor(now.getTime() / 60000)]
  )

  const countdown = next ? formatCountdown(next.target, now) : '—'

  return { now, next, countdown, statuses, adjustment }
}
