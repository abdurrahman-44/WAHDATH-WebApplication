import { useUserLocation } from '../context/LocationContext'
import { getDistricts, getCities } from '../services/locationService'

export default function LocationSelector({ compact = false }) {
  const { locations, location, setLocation } = useUserLocation()

  const provinces = Object.keys(locations)
  const districts = getDistricts(locations, location.province)
  const cities = getCities(locations, location.province, location.district)

  const onProvince = (province) => {
    const district = getDistricts(locations, province)[0]
    const city = getCities(locations, province, district)[0]
    setLocation({ province, district, city })
  }
  const onDistrict = (district) => {
    const city = getCities(locations, location.province, district)[0]
    setLocation({ ...location, district, city })
  }
  const onCity = (city) => setLocation({ ...location, city })

  const selectClass =
    'rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-ink dark:border-night-line dark:bg-night-card dark:text-white'

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'w-full'}`}>
      <select aria-label="Province" className={selectClass} value={location.province} onChange={(e) => onProvince(e.target.value)}>
        {provinces.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select aria-label="District" className={selectClass} value={location.district} onChange={(e) => onDistrict(e.target.value)}>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select aria-label="City or town" className={selectClass} value={location.city} onChange={(e) => onCity(e.target.value)}>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  )
}
