// locationService.js
// Thin helpers over the Province → District → City base data (section 4).
// Keeping this separate means the selector UI never touches the raw
// JSON shape directly, so the data source can move to an API later
// without changing any component.

export function getProvinces(locations) {
  return Object.keys(locations)
}

export function getDistricts(locations, province) {
  if (!province || !locations[province]) return []
  return Object.keys(locations[province])
}

export function getCities(locations, province, district) {
  if (!province || !district || !locations[province]?.[district]) return []
  return locations[province][district]
}

export function defaultLocation(locations) {
  const province = getProvinces(locations)[0]
  const district = getDistricts(locations, province)[0]
  const city = getCities(locations, province, district)[0]
  return { province, district, city }
}
