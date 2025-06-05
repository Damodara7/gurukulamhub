import React from 'react';
import {
  Typography,
  Grid,
  FormControl,
  Autocomplete,
  TextField
} from '@mui/material';
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown';
import Loading from '@/components/Loading';

const LocationSelection = ({
  selectedCountryObject,
  setSelectedCountryObject,
  selectedRegion,
  setSelectedRegion,
  city,
  setCity,
  cityOptions,
  loading,
  getCitiesData
}) => {
  return (
    <>
      <Typography variant='h6' gutterBottom sx={{ mb: 1 }}>
        Sponsorship Location
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Applies to any location if none are specifically selected
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <CountryRegionDropdown
            defaultCountryCode=''
            selectedCountryObject={selectedCountryObject}
            setSelectedCountryObject={setSelectedCountryObject}
            onCountryChange={() => {
              setSelectedRegion('');
              setCity('');
            }}
          />
        </Grid>

        {selectedCountryObject?.country && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Autocomplete
                autoHighlight
                onChange={(e, newValue) => {
                  setSelectedRegion(newValue);
                  getCitiesData(newValue);
                  setCity('');
                }}
                id='autocomplete-region-select'
                options={selectedCountryObject?.regions || []}
                getOptionLabel={option => option || ''}
                renderInput={params => (
                  <TextField
                    {...params}
                    key={params.id}
                    label='Choose a region'
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'region'
                    }}
                  />
                )}
                value={selectedRegion}
              />
            </FormControl>
          </Grid>
        )}

        {selectedRegion && (
          <Grid item xs={12} md={6}>
            {loading.fetchCities && <Loading />}
            {!loading.fetchCities && (
              <FormControl fullWidth>
                <Autocomplete
                  autoHighlight
                  onChange={(e, newValue) => setCity(newValue)}
                  id='autocomplete-city-select'
                  options={cityOptions}
                  getOptionLabel={option => option || ''}
                  renderInput={params => (
                    <TextField
                      {...params}
                      key={params.id}
                      label='Choose a City'
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'city'
                      }}
                    />
                  )}
                  value={city}
                />
              </FormControl>
            )}
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default LocationSelection;