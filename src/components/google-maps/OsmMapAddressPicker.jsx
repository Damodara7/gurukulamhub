'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Autocomplete as MuiAutocomplete,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material'

// Leaflet must only run on the client (it touches `window` at import time).
const OsmMapInner = dynamic(() => import('./_OsmMapInner'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={24} />
    </Box>
  )
})

// Nominatim is OpenStreetMap's free forward/reverse geocoding service.
// Usage policy: <https://operations.osmfoundation.org/policies/nominatim/>
// - Max 1 request/sec from a single source -> we debounce search inputs.
// - A descriptive HTTP Referer is required; the browser sets it automatically.
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

// Country-specific postal-code sanity checks. OpenStreetMap data quality varies,
// and Nominatim sometimes attaches a nearby (wrong) postcode to a result. When
// the value clearly violates the country's format we drop it from both the
// display address and the emitted payload so we don't surface bad data.
//
// India PINs are 6 digits and the first digit indicates the postal region. We
// cross-check the leading digit against the resolved state name to catch the
// common "wrong neighbouring postcode" case (e.g. an 8xxxxx Bihar PIN tagged
// onto a place in Telangana).
const INDIA_PIN_FIRST_DIGIT_BY_STATE = {
  1: ['delhi', 'haryana', 'punjab', 'himachal pradesh', 'jammu and kashmir', 'ladakh', 'chandigarh'],
  2: ['uttar pradesh', 'uttarakhand'],
  3: ['rajasthan', 'gujarat', 'daman and diu', 'dadra and nagar haveli', 'dadra and nagar haveli and daman and diu'],
  4: ['maharashtra', 'goa', 'madhya pradesh', 'chhattisgarh'],
  5: ['andhra pradesh', 'telangana', 'karnataka'],
  6: ['tamil nadu', 'kerala', 'puducherry', 'lakshadweep'],
  7: [
    'west bengal',
    'odisha',
    'orissa',
    'arunachal pradesh',
    'nagaland',
    'manipur',
    'mizoram',
    'tripura',
    'meghalaya',
    'assam',
    'sikkim',
    'andaman and nicobar islands'
  ],
  8: ['bihar', 'jharkhand']
}

const indiaPinMatchesState = (postcode, state) => {
  if (!postcode || !state) return true // Nothing to disprove.
  const firstDigit = parseInt(postcode[0], 10)
  if (Number.isNaN(firstDigit)) return false
  const allowedStates = INDIA_PIN_FIRST_DIGIT_BY_STATE[firstDigit]
  if (!allowedStates) return false
  const normalized = String(state).toLowerCase().trim()
  return allowedStates.some(s => normalized === s || normalized.includes(s))
}

const isValidPostcode = (postcode, countryCode, state) => {
  if (!postcode) return false
  const cc = (countryCode || '').toUpperCase()
  if (cc === 'IN') {
    if (!/^[1-8]\d{5}$/.test(postcode)) return false
    return indiaPinMatchesState(postcode, state)
  }
  return true
}

// Strip an exact comma-separated token (e.g. a wrong postcode) out of a
// human-readable address string returned by Nominatim's `display_name`.
const stripTokenFromAddress = (address, token) => {
  if (!address || !token) return address || ''
  return address
    .split(',')
    .map(s => s.trim())
    .filter(s => s && s !== token)
    .join(', ')
}

const buildPayloadFromNominatim = (item, fallbackLat, fallbackLng) => {
  if (!item) {
    return { address: '', lat: fallbackLat, lng: fallbackLng }
  }
  const a = item.address || {}
  const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat ?? fallbackLat
  const lng = typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon ?? fallbackLng
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  const countryCode = a.country_code ? String(a.country_code).toUpperCase() : ''
  const rawPostcode = a.postcode || ''
  const stateName = a.state || a.region || ''
  const postcodeIsValid = isValidPostcode(rawPostcode, countryCode, stateName)
  // Drop the postcode from the displayed address when it fails the sanity check.
  const cleanedAddress = postcodeIsValid
    ? item.display_name || ''
    : stripTokenFromAddress(item.display_name || '', rawPostcode)
  return {
    address: cleanedAddress,
    lat,
    lng,
    street: street || a.road || '',
    colony: a.neighbourhood || a.suburb || a.quarter || a.hamlet || '',
    village: a.village || a.town || a.city || '',
    region: a.state || a.region || '',
    country: a.country || '',
    countryCode,
    zipcode: postcodeIsValid ? rawPostcode : ''
  }
}

const fetchNominatim = async (path, params) => {
  const qs = new URLSearchParams({ format: 'json', addressdetails: '1', ...params }).toString()
  const res = await fetch(`${NOMINATIM_BASE}/${path}?${qs}`, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`Nominatim request failed: ${res.status}`)
  return res.json()
}

const OsmMapAddressPicker = ({ value, onChange, height = 320 }) => {
  const [marker, setMarker] = useState(
    value && typeof value.lat === 'number' && typeof value.lng === 'number' ? { lat: value.lat, lng: value.lng } : null
  )
  const [inputValue, setInputValue] = useState(value?.address || '')
  const [options, setOptions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [reverseLoading, setReverseLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (value && typeof value.lat === 'number' && typeof value.lng === 'number') {
      setMarker({ lat: value.lat, lng: value.lng })
      setInputValue(value.address || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng])

  const emit = useCallback(
    payload => {
      onChange?.(payload)
    },
    [onChange]
  )

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      setReverseLoading(true)
      try {
        const data = await fetchNominatim('reverse', { lat: String(lat), lon: String(lng) })
        const payload = buildPayloadFromNominatim(data, lat, lng)
        setInputValue(payload.address || '')
        emit(payload)
      } catch (err) {
        console.error('[OsmMapAddressPicker] reverse geocode failed', err)
        emit({ address: '', lat, lng })
      } finally {
        setReverseLoading(false)
      }
    },
    [emit]
  )

  // Debounced search via Nominatim. The free public endpoint asks callers to
  // stay under ~1 req/sec; 400 ms keystroke debounce comfortably honors that.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = inputValue?.trim()
    if (!q || q.length < 3) {
      setOptions([])
      return
    }

    // Skip refetch if we're just displaying the address that was already selected.
    if (value?.address && q === value.address) {
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const data = await fetchNominatim('search', { q, limit: '5' })
        setOptions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('[OsmMapAddressPicker] search failed', err)
        setOptions([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValue, value?.address])

  const handlePickOption = item => {
    if (!item) return
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    const payload = buildPayloadFromNominatim(item, lat, lng)
    setMarker({ lat, lng })
    setInputValue(payload.address || '')
    emit(payload)
  }

  const handleMapClick = (lat, lng) => {
    setMarker({ lat, lng })
    reverseGeocode(lat, lng)
  }

  const handleMarkerDragEnd = (lat, lng) => {
    setMarker({ lat, lng })
    reverseGeocode(lat, lng)
  }

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setMarker({ lat, lng })
        reverseGeocode(lat, lng)
      },
      err => console.error('[OsmMapAddressPicker] geolocation error:', err)
    )
  }

  const optionLabel = useMemo(
    () => option => (typeof option === 'string' ? option : option?.display_name || ''),
    []
  )

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <MuiAutocomplete
            freeSolo
            disableClearable
            filterOptions={x => x}
            options={options}
            loading={searchLoading}
            getOptionLabel={optionLabel}
            isOptionEqualToValue={(opt, val) => opt?.place_id === val?.place_id}
            inputValue={inputValue}
            onInputChange={(_, newValue, reason) => {
              if (reason === 'input') setInputValue(newValue)
            }}
            onChange={(_, newValue) => {
              if (newValue && typeof newValue !== 'string') handlePickOption(newValue)
            }}
            renderInput={params => (
              <TextField
                {...params}
                size='small'
                placeholder='Search a place or address'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {(searchLoading || reverseLoading) && <CircularProgress size={16} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </Box>
        <Button
          variant='outlined'
          onClick={handleUseCurrentLocation}
          startIcon={<i className='ri-map-pin-2-line' />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Use current location
        </Button>
      </Stack>

      <OsmMapInner marker={marker} onMapClick={handleMapClick} onMarkerDragEnd={handleMarkerDragEnd} height={height} />

      <Typography variant='caption' color='text.secondary'>
        Search for a place, click on the map, or drag the pin to set your exact location. Map data &copy; OpenStreetMap
        contributors.
      </Typography>
    </Stack>
  )
}

export default OsmMapAddressPicker
