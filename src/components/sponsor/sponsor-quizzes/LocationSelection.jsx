import React from 'react';
import {
  Typography,
  Grid,
  FormControl,
  Autocomplete,
  TextField,
  alpha,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          mb: 1,
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
        }}
      >
        Sponsorship Location
      </Typography>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{
          mb: { xs: 1.5, sm: 2 },
          fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
        }}
      >
        Applies to any location if none are specifically selected
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: { xs: 2.5, sm: 3 } }}>
        <Grid item xs={12} sm={12} md={6}>
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
          <Grid item xs={12} sm={12} md={6}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        ...(isDarkMode && {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.3)
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        })
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? theme.palette.text.primary : undefined
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
                      }
                    }}
                  />
                )}
                value={selectedRegion}
              />
            </FormControl>
          </Grid>
        )}

        {selectedRegion && (
          <Grid item xs={12} sm={12} md={6}>
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          ...(isDarkMode && {
                            '& fieldset': {
                              borderColor: alpha(theme.palette.divider, 0.3)
                            },
                            '&:hover fieldset': {
                              borderColor: alpha(theme.palette.primary.main, 0.5)
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main
                            }
                          })
                        },
                        '& .MuiInputBase-input': {
                          color: isDarkMode ? theme.palette.text.primary : undefined
                        },
                        '& .MuiInputLabel-root': {
                          color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
                        }
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