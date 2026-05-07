'use client'

// Thin wrapper that picks the underlying map provider at runtime based on
// `NEXT_PUBLIC_MAP_PROVIDER`:
//
//   - `osm`    (default) -> free OpenStreetMap + Leaflet + Nominatim. No API key.
//   - `google`           -> Google Maps. Requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
//
// Both providers expose the same `value` / `onChange` contract:
//   value:    { address?, lat?, lng? } | null
//   onChange: ({ address, lat, lng, street?, colony?, village?, region?, country?, countryCode?, zipcode? }) => void

import React from 'react'
import GoogleMapAddressPicker from './GoogleMapAddressPicker'
import OsmMapAddressPicker from './OsmMapAddressPicker'

const resolveProvider = () => {
  const raw = (process.env.NEXT_PUBLIC_MAP_PROVIDER || '').trim().toLowerCase()
  if (raw === 'google' || raw === 'gmaps') return 'google'
  if (raw === 'osm' || raw === 'openstreetmap' || raw === 'leaflet') return 'osm'
  return 'osm'
}

const MapAddressPicker = props => {
  const provider = resolveProvider()
  if (provider === 'google') return <GoogleMapAddressPicker {...props} />
  return <OsmMapAddressPicker {...props} />
}

export default MapAddressPicker
