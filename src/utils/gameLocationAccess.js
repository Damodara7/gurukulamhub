/**
 * Location-based game access must stay aligned with user profile fields
 * (@/app/api/profile/profile.model): country, region, pincode, postoffice
 * for India and zipcode, locality elsewhere.
 */

export function emptyGameLocation() {
  return {
    country: '',
    countryCode: '',
    region: '',
    city: '',
    pincode: '',
    postoffice: '',
    street: '',
    colony: '',
    village: '',
    locality: '',
    zipcode: '',
    address: '',
    coordinates: []
  }
}

export function normLoc(s) {
  if (s === null || s === undefined) return ''
  return String(s).trim().toLowerCase()
}

/**
 * Restriction is on whenever organisers set a country on the game.
 * Matching is progressive: profile must match every filled field on game.location
 * (country → optionally region → optionally pin/post office for India, zip/locality internationally).
 */
export function isGameLocationRestricted(game) {
  const loc = game?.location
  if (!loc) return false
  return !!normLoc(loc.country)
}

export function profileMatchesGameLocation(profile, game) {
  if (!isGameLocationRestricted(game)) return true
  const loc = game.location
  const isIndia = normLoc(loc.country) === 'india'

  if (normLoc(profile?.country) !== normLoc(loc.country)) return false

  if (normLoc(loc.region)) {
    if (normLoc(profile?.region) !== normLoc(loc.region)) return false
  }

  if (isIndia) {
    if (normLoc(loc.pincode)) {
      if (normLoc(profile?.pincode) !== normLoc(loc.pincode)) return false
    }
    if (normLoc(loc.postoffice)) {
      if (normLoc(profile?.postoffice) !== normLoc(loc.postoffice)) return false
    }
  } else {
    if (normLoc(loc.zipcode)) {
      if (normLoc(profile?.zipcode) !== normLoc(loc.zipcode)) return false
    }
    if (normLoc(loc.locality)) {
      if (normLoc(profile?.locality) !== normLoc(loc.locality)) return false
    }
  }

  return true
}

export function restrictedLocationHint(game) {
  const loc = game?.location
  if (!loc || !normLoc(loc.country)) return ''
  const isIndia = normLoc(loc.country) === 'india'
  const parts = [loc.country]
  if (normLoc(loc.region)) parts.push(loc.region)
  if (isIndia) {
    if (normLoc(loc.pincode)) parts.push(loc.pincode)
    if (normLoc(loc.postoffice)) parts.push(loc.postoffice)
  } else {
    if (normLoc(loc.zipcode)) parts.push(loc.zipcode)
    if (normLoc(loc.locality)) parts.push(loc.locality)
  }
  return parts.join(', ')
}
