'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'

const GOOGLE_MAPS_LIBRARIES = ['places']

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }

const pickComponent = (components, type, useShortName = false) => {
  const c = components?.find(x => x.types?.includes(type))
  if (!c) return ''
  return useShortName ? c.short_name : c.long_name
}

const parseAddressComponents = (components = []) => ({
  street: pickComponent(components, 'route') || pickComponent(components, 'street_address'),
  colony:
    pickComponent(components, 'sublocality_level_1') ||
    pickComponent(components, 'sublocality') ||
    pickComponent(components, 'neighborhood'),
  village:
    pickComponent(components, 'locality') ||
    pickComponent(components, 'administrative_area_level_3') ||
    pickComponent(components, 'postal_town'),
  region: pickComponent(components, 'administrative_area_level_1'),
  country: pickComponent(components, 'country'),
  countryCode: pickComponent(components, 'country', true),
  zipcode: pickComponent(components, 'postal_code')
})

const GoogleMapAddressPicker = props => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[GoogleMapAddressPicker] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Google Maps picker is disabled.'
      )
    }
    return (
      <Box
        sx={{
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'action.hover'
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          The map picker is temporarily unavailable. You can still continue by filling in the address fields below.
        </Typography>
      </Box>
    )
  }

  return <GoogleMapAddressPickerInner {...props} apiKey={apiKey} />
}

const GoogleMapAddressPickerInner = ({ value, onChange, height = 320, apiKey }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'gmaps-script-loader',
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES
  })

  const [marker, setMarker] = useState(
    value && typeof value.lat === 'number' && typeof value.lng === 'number' ? { lat: value.lat, lng: value.lng } : null
  )
  const [search, setSearch] = useState(value?.address || '')
  const [reverseLoading, setReverseLoading] = useState(false)

  const autocompleteRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (value && typeof value.lat === 'number' && typeof value.lng === 'number') {
      setMarker({ lat: value.lat, lng: value.lng })
      setSearch(value.address || '')
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
      if (!isLoaded || !window.google) return
      setReverseLoading(true)
      try {
        const geocoder = new window.google.maps.Geocoder()
        const { results } = await geocoder.geocode({ location: { lat, lng } })
        if (results && results.length > 0) {
          const result = results[0]
          const components = parseAddressComponents(result.address_components)
          const payload = {
            address: result.formatted_address,
            lat,
            lng,
            ...components
          }
          setSearch(result.formatted_address || '')
          emit(payload)
        } else {
          emit({ address: '', lat, lng })
        }
      } catch (err) {
        console.error('Reverse geocode failed', err)
        emit({ address: '', lat, lng })
      } finally {
        setReverseLoading(false)
      }
    },
    [isLoaded, emit]
  )

  const handleAutocompleteLoad = ac => {
    autocompleteRef.current = ac
  }

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    if (!place || !place.geometry?.location) return
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    setMarker({ lat, lng })
    if (mapRef.current) mapRef.current.panTo({ lat, lng })
    const components = parseAddressComponents(place.address_components)
    const payload = {
      address: place.formatted_address || place.name || '',
      lat,
      lng,
      ...components
    }
    setSearch(payload.address)
    emit(payload)
  }

  const handleMapClick = e => {
    if (!e.latLng) return
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setMarker({ lat, lng })
    reverseGeocode(lat, lng)
  }

  const handleMarkerDragEnd = e => {
    if (!e.latLng) return
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
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
        if (mapRef.current) mapRef.current.panTo({ lat, lng })
        reverseGeocode(lat, lng)
      },
      err => console.error('Geolocation error:', err)
    )
  }

  if (loadError) {
    if (typeof window !== 'undefined') {
      console.error('[GoogleMapAddressPicker] Google Maps failed to load:', loadError)
    }
    return (
      <Box
        sx={{
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'action.hover'
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          We couldn&apos;t load the map right now. Please check your connection and try again, or fill in the address
          fields manually below.
        </Typography>
      </Box>
    )
  }

  if (!isLoaded) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Box sx={{ flex: 1, '& > div': { width: '100%' } }}>
          <Autocomplete
            onLoad={handleAutocompleteLoad}
            onPlaceChanged={handlePlaceChanged}
            options={{ fields: ['address_components', 'geometry', 'formatted_address', 'name'] }}
          >
            <TextField
              fullWidth
              size='small'
              placeholder='Search a place or address'
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: reverseLoading ? <CircularProgress size={16} /> : null
              }}
            />
          </Autocomplete>
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

      <GoogleMap
        mapContainerStyle={{ width: '100%', height, borderRadius: 8 }}
        center={marker || DEFAULT_CENTER}
        zoom={marker ? 15 : 5}
        onLoad={m => {
          mapRef.current = m
        }}
        onClick={handleMapClick}
        options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {marker && <Marker position={marker} draggable onDragEnd={handleMarkerDragEnd} />}
      </GoogleMap>

      <Typography variant='caption' color='text.secondary'>
        Search for a place, click on the map, or drag the pin to set your exact location.
      </Typography>
    </Stack>
  )
}

export default GoogleMapAddressPicker
