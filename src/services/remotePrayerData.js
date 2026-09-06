const ZONE_BY_DISTRICT = {
  Colombo: 1, Gampaha: 1, Kalutara: 1,
  Jaffna: 2,
  Mullaitivu: 3, Kilinochchi: 3, Vavuniya: 3,
  Mannar: 4, Puttalam: 4,
  Anuradhapura: 5, Polonnaruwa: 5,
  Kurunegala: 6,
  Kandy: 7, Matale: 7, 'Nuwara Eliya': 7,
  Batticaloa: 8, Ampara: 8,
  Trincomalee: 9,
  Badulla: 10, Monaragala: 10,
  Ratnapura: 11, Kegalle: 11,
  Galle: 12, Matara: 12,
  Hambantota: 13
}

export function getAcjuZoneForDistrict(district) {
  return ZONE_BY_DISTRICT[district] ?? 1
}

export async function fetchAcjuYear(district, year) {
  const zone = getAcjuZoneForDistrict(district)
  const response = await fetch(`/api/prayer-times?zone=${zone}&year=${year}`)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || 'Prayer timetable unavailable')
    error.status = response.status
    error.payload = body
    throw error
  }
  return body
}
