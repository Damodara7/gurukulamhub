import moment from 'moment-timezone'

/**
 * IANA timezone identifiers for a given ISO 3166-1 alpha-2 country code
 * (e.g. US → multiple zones, IN → Asia/Kolkata). Uses moment-timezone data.
 * Falls back to the full zone list when the country has no mapped zones.
 */
export function getIanaTimezonesForCountry(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') return []
  const code = countryCode.trim().toUpperCase()
  if (!code) return []

  try {
    const zones = moment.tz.zonesForCountry(code)
    if (Array.isArray(zones) && zones.length > 0) {
      return [...zones].sort((a, b) => a.localeCompare(b))
    }
  } catch {
    // ignore invalid codes
  }
  
  return moment.tz.names().sort((a, b) => a.localeCompare(b))
}