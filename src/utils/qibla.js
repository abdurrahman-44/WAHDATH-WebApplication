// qibla.js — great-circle bearing + distance to the Kaaba (section 21).

const KAABA = { lat: 21.4225, lng: 39.8262 }
const EARTH_RADIUS_KM = 6371

const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

/** Initial great-circle bearing from (lat, lng) to the Kaaba, in degrees (0-360, 0 = North). */
export function qiblaBearing(lat, lng) {
  const phi1 = toRad(lat)
  const phi2 = toRad(KAABA.lat)
  const deltaLambda = toRad(KAABA.lng - lng)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = Math.atan2(y, x)
  return (toDeg(theta) + 360) % 360
}

/** Great-circle distance from (lat, lng) to the Kaaba, in kilometers. */
export function distanceToKaabaKm(lat, lng) {
  const phi1 = toRad(lat)
  const phi2 = toRad(KAABA.lat)
  const deltaPhi = toRad(KAABA.lat - lat)
  const deltaLambda = toRad(KAABA.lng - lng)

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}
