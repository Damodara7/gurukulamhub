import { CountryRegionData } from '@/data/regions'

// Function to remove tilde and suffix from a region string
const removeSuffix = region => region.split('~')[0].toUpperCase()

// Parse the CountryRegionData into a structured format
export const parsedCountryRegionData = CountryRegionData.map(([country, countryCode, regions]) => ({
  country,
  countryCode,
  regions: regions.split('|').map(removeSuffix)
}))

export function getCountryByName(name) {
  return parsedCountryRegionData.find(c => c.country.toLocaleLowerCase() === name.toLocaleLowerCase())
}
export function getCountryByCode(code) {
  return parsedCountryRegionData.find(c => c.countryCode === code)
}
