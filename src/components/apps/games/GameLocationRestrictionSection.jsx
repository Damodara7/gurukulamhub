'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material'

import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import AutocompletePincode from '@/views/pages/auth/register-multi-steps/AutocompletePincode'
import AutocompletePostOffice from '@/views/pages/auth/register-multi-steps/AutocompletePostOffice'
import MapAddressPicker from '@/components/google-maps/MapAddressPicker'

async function fetchPinCodesForStateApi(stateName) {
  const res = await fetch(`/api/pincodes/${encodeURIComponent(stateName)}`)
  const data = await res.json().catch(() => ({}))
  return data?.pinCodes || []
}

async function fetchPostOfficesForPin(pin) {
  const res = await fetch(`/api/localities/${encodeURIComponent(pin)}`)
  const data = await res.json().catch(() => ({}))
  return data?.localities || []
}

/**
 * Map + structured address fields (same pattern as profile AddressInfo).
 * When country + region + (India: pincode + post office) or (non-India: zip + locality)
 * are all set on the saved game, the API restricts join/start to profiles that match.
 */
export default function GameLocationRestrictionSection({
  countryObject,
  onCountryObjectChange,
  region,
  onRegionChange,
  location = {},
  onLocationPatch,
  disabled = false,
  showMap = true
}) {
  const [, setCountryLabel] = useState('')
  const [pinCodes, setPinCodes] = useState([])
  const [postOffices, setPostOffices] = useState([])
  const [loadingPins, setLoadingPins] = useState(false)

  const isIndia = countryObject?.country === 'India'

  const mapPickerValue = useMemo(() => {
    if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      return {
        lat: location.coordinates[1],
        lng: location.coordinates[0],
        address: location.address || ''
      }
    }
    if (location.address) {
      return { address: location.address }
    }
    return null
  }, [location.coordinates, location.address])

  const handleMapChange = useCallback(
    picked => {
      if (!picked) {
        onLocationPatch({ address: '', coordinates: [] })
        return
      }
      const patch = {
        address: picked.address || ''
      }
      if (typeof picked.lat === 'number' && typeof picked.lng === 'number') {
        patch.coordinates = [picked.lng, picked.lat]
      }
      if (picked.street) patch.street = picked.street
      if (picked.colony) patch.colony = picked.colony
      if (picked.village) patch.village = picked.village
      onLocationPatch(patch)
    },
    [onLocationPatch]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isIndia || !region) {
        setPinCodes([])
        setPostOffices([])
        return
      }
      setLoadingPins(true)
      try {
        const codes = await fetchPinCodesForStateApi(region)
        if (!cancelled) setPinCodes(codes || [])
      } finally {
        if (!cancelled) setLoadingPins(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isIndia, region])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const pin = location.pincode
      if (!pin || !isIndia) {
        setPostOffices([])
        return
      }
      setLoadingPins(true)
      try {
        const offices = await fetchPostOfficesForPin(pin)
        if (!cancelled) setPostOffices(offices || [])
      } finally {
        if (!cancelled) setLoadingPins(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isIndia, location.pincode])

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
      {showMap ? (
        <Grid item xs={12}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom sx={{ fontWeight: 600 }}>
            Address and map (optional)
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
            Search, use current location, or move the pin. This is saved with the game and should match where it is run.
          </Typography>
          <MapAddressPicker value={mapPickerValue} onChange={handleMapChange} height={280} />
          {location.address ? (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              <strong>Selected on map:</strong> {location.address}
            </Typography>
          ) : null}
        </Grid>
      ) : null}

      <Grid item xs={12} sm={6}>
        <CountryRegionDropdown
          setSelectedCountry={setCountryLabel}
          selectedCountryObject={countryObject}
          setSelectedCountryObject={onCountryObjectChange}
          onCountryChange={onCountryObjectChange}
          defaultCountryCode=''
        />
      </Grid>

      {countryObject?.country ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Autocomplete
              disabled={disabled}
              autoHighlight
              onChange={(e, newValue) => {
                const r = newValue || ''
                onRegionChange(r)
              }}
              id='game-autocomplete-region'
              options={countryObject?.regions || []}
              getOptionLabel={option => option || ''}
              renderInput={params => (
                <TextField
                  {...params}
                  key={params.id}
                  label='Choose a region'
                  inputProps={{ ...params.inputProps, autoComplete: 'region' }}
                />
              )}
              value={region || ''}
              noOptionsText='No regions available'
            />
          </FormControl>
        </Grid>
      ) : null}

      {isIndia && region ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <AutocompletePincode
              fetchPostOffices={pinVal => {
                onLocationPatch({ pincode: pinVal || '', postoffice: '' })
              }}
              loading={loadingPins}
              pinCodes={pinCodes}
              selectedZipcode={location.pincode || ''}
              setSelectedZipcode={pinVal => onLocationPatch({ pincode: pinVal || '', postoffice: '' })}
            />
          </FormControl>
        </Grid>
      ) : null}

      {isIndia && location.pincode ? (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <AutocompletePostOffice
              postOffices={postOffices}
              loading={loadingPins}
              selectedLocality={location.postoffice || ''}
              setSelectedLocality={val => onLocationPatch({ postoffice: val || '' })}
            />
          </FormControl>
        </Grid>
      ) : null}

      {isIndia && location.postoffice ? (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled={disabled}
              name='game-loc-street'
              fullWidth
              label='Street'
              value={location.street || ''}
              placeholder='Street'
              onChange={e => onLocationPatch({ street: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled={disabled}
              name='game-loc-colony'
              fullWidth
              label='Colony'
              value={location.colony || ''}
              placeholder='Colony'
              onChange={e => onLocationPatch({ colony: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled={disabled}
              name='game-loc-village'
              fullWidth
              label='Village'
              value={location.village || ''}
              placeholder='Village'
              onChange={e => onLocationPatch({ village: e.target.value })}
            />
          </Grid>
        </>
      ) : null}

      {!isIndia && countryObject?.country ? (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled={disabled}
              fullWidth
              label='Enter your ZIP code'
              value={location.zipcode || ''}
              onChange={e => {
                onLocationPatch({ zipcode: e.target.value, pincode: '', postoffice: '' })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              disabled={disabled}
              fullWidth
              label='Locality / City / Village'
              value={location.locality || ''}
              onChange={e => onLocationPatch({ locality: e.target.value })}
            />
          </Grid>
        </>
      ) : null}
    </Grid>
  )
}
