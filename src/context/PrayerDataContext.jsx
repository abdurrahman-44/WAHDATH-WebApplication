import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import baseTimetable from '../data/prayer-times-colombo-2026.json'
import { useUserLocation } from './LocationContext'
import { fetchAcjuYear } from '../services/remotePrayerData'
import { loadJSON, saveJSON } from '../utils/storage'

const PrayerDataContext = createContext(null)

export function PrayerDataProvider({ children }) {
  const { location } = useUserLocation()
  const [override, setOverride] = useState(() => loadJSON('prayerDataOverride', null))
  const [yearCache, setYearCache] = useState({})
  const [loadingYears, setLoadingYears] = useState({})
  const [yearErrors, setYearErrors] = useState({})

  const ensureYear = useCallback(async (year) => {
    const zone = location?.district || 'Colombo'
    const key = `${zone}:${year}`
    if (yearCache[key]?.days?.length || loadingYears[key]) return yearCache[key] || null

    setLoadingYears((prev) => ({ ...prev, [key]: true }))
    try {
      const data = await fetchAcjuYear(zone, year)
      setYearCache((prev) => ({ ...prev, [key]: data }))
      setYearErrors((prev) => ({ ...prev, [key]: null }))
      return data
    } catch (error) {
      setYearErrors((prev) => ({ ...prev, [key]: error }))
      return null
    } finally {
      setLoadingYears((prev) => ({ ...prev, [key]: false }))
    }
  }, [location?.district, yearCache, loadingYears])

  useEffect(() => {
    // Load the current year's official ACJU timetable automatically.
    ensureYear(new Date().getFullYear())
  }, [ensureYear])

  // A location change means the cached zone may have changed. Keep old data
  // in memory for navigation, but the current location's year is preferred.
  const currentYear = new Date().getFullYear()
  const currentKey = `${location?.district || 'Colombo'}:${currentYear}`
  const officialCurrent = yearCache[currentKey]
  const activeData = override ?? officialCurrent ?? baseTimetable

  const importOverride = (parsedData) => {
    const withMeta = { ...parsedData, importedAt: new Date().toISOString() }
    setOverride(withMeta)
    saveJSON('prayerDataOverride', withMeta)
  }

  const clearOverride = () => {
    setOverride(null)
    saveJSON('prayerDataOverride', null)
  }

  const getYearData = (year) => {
    if (override && String(year) === String(currentYear)) return override
    return yearCache[`${location?.district || 'Colombo'}:${year}`] ?? null
  }

  const value = useMemo(
    () => ({
      baseTimetable,
      activeData,
      isOverridden: !!override,
      importOverride,
      clearOverride,
      ensureYear,
      getYearData,
      loadingYears,
      yearErrors,
      officialCurrent
    }),
    [activeData, override, ensureYear, yearCache, loadingYears, yearErrors, officialCurrent, location?.district]
  )

  return <PrayerDataContext.Provider value={value}>{children}</PrayerDataContext.Provider>
}

export function usePrayerData() {
  const ctx = useContext(PrayerDataContext)
  if (!ctx) throw new Error('usePrayerData must be used within PrayerDataProvider')
  return ctx
}
