import { useEffect, useState } from 'react'

/** Re-renders every second with the current Date. Section 3/24: countdowns
 *  must update every second, correctly through midnight and date changes. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
