import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import locationsData from '../data/locations.json'
import { defaultLocation } from '../services/locationService'
import { loadJSON, saveJSON } from '../utils/storage'

const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() =>
    loadJSON('location', defaultLocation(locationsData))
  )
  // 'auto' applies the province rule (section 6); a number overrides it
  // manually from Settings.
  const [adjustmentMode, setAdjustmentMode] = useState(() =>
    loadJSON('adjustmentMode', 'auto')
  )

  useEffect(() => saveJSON('location', location), [location])
  useEffect(() => saveJSON('adjustmentMode', adjustmentMode), [adjustmentMode])

  const value = useMemo(
    () => ({ locations: locationsData, location, setLocation, adjustmentMode, setAdjustmentMode }),
    [location, adjustmentMode]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

// Named useUserLocation (not useLocation) to avoid colliding with
// react-router-dom's useLocation hook used elsewhere in the app.
export function useUserLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useUserLocation must be used within LocationProvider')
  return ctx
}
