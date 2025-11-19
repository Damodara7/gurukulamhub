import React, { useState, useEffect, useRef } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Avatar,
  ListItemAvatar,
  Grid,
  FormControl,
  TextField,
  Autocomplete,
  useMediaQuery,
  useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown' // Make sure to import this component
const ReusableFiltersList = ({
  selectedLocations = [],
  setSelectedLocations = () => {},
  selectedQuizzes = [],
  setSelectedQuizzes = () => {}
}) => {
  // Quiz states
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showFilters, setShowFilters] = useState(!isMobile) // Show by default on desktop

  const containerRef = useRef(null)
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState({
    fetchQuizzes: true,
    fetchCities: false
  })
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState({
    quiz: false,
    location: false
  })

  // Location states
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cityOptions, setCityOptions] = useState([])

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Auto-expand filters section when chips are added on mobile
  useEffect(() => {
    if ((selectedQuizzes.length > 0 || selectedLocations.length > 0) && !showFilters && isMobile) {
      setShowFilters(true)
    }
  }, [selectedQuizzes.length, selectedLocations.length, isMobile, showFilters])

  // Fetch quizzes
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
        if (res.status === 'success') {
          setQuiz(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(prev => ({ ...prev, fetchQuizzes: false }))
      }
    }

    fetchQuiz()
  }, [])

  console.log('quiz data ', quiz)
  // Fetch cities when region changes
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      const result = await RestApi.get(`/api/cities?state=${region}`)
      if (result?.status === 'success') {
        setCityOptions(result?.result?.map(each => each.city))
      }
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  const handleOpenDialog = type => {
    setOpenDialog(prev => ({ ...prev, [type]: true }))
  }

  const handleCloseDialog = type => {
    setOpenDialog(prev => ({ ...prev, [type]: false }))
  }

  const handleQuizSelect = quizId => {
    const quizToAdd = quiz.find(q => q.id === quizId)
    if (quizToAdd && !selectedQuizzes.some(q => q.id === quizId)) {
      setSelectedQuizzes([...selectedQuizzes, quizToAdd])
    }
    handleCloseDialog('quiz')
  }

  // Update the handleLocationSelect function
  const handleLocationSelect = () => {
    // Create location object with whatever fields are available
    const location = {
      ...(selectedCountryObject && { country: selectedCountryObject.country }),
      ...(selectedRegion && { region: selectedRegion }),
      ...(selectedCity && { city: selectedCity })
    }

    // Only add if at least one field is selected
    if (selectedCountryObject || selectedRegion || selectedCity) {
      // Check if this exact combination already exists
      const exists = selectedLocations.some(
        loc => loc.country === location.country && loc.region === location.region && loc.city === location.city
      )

      if (!exists) {
        setSelectedLocations([...selectedLocations, location])
      }

      // Reset selections
      setSelectedCountryObject(null)
      setSelectedRegion('')
      setSelectedCity('')
      setCityOptions([])
      handleCloseDialog('location')
    }
  }

  const handleDeleteChip = (type, itemToDelete) => {
    if (type === 'quiz') {
      setSelectedQuizzes(selectedQuizzes.filter(q => q.id !== itemToDelete.id))
    } else {
      setSelectedLocations(
        selectedLocations.filter(
          loc =>
            !(
              loc.country === itemToDelete.country &&
              loc.region === itemToDelete.region &&
              loc.city === itemToDelete.city
            )
        )
      )
    }
  }

  const getAvatarContent = (quizItem, sx = {}) => {
    if (quizItem.thumbnail) {
      return <Avatar src={quizItem.thumbnail} alt={quizItem.title} sx={sx} />
    }
    return <Avatar sx={sx}>{quizItem.title.charAt(0).toUpperCase()}</Avatar>
  }

  const handleChangeCountry = country => {
    setSelectedCountryObject(country)
    setSelectedRegion('')
    setSelectedCity('')
    setCityOptions([])
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: { xs: 0.5, sm: 1 }
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Stack direction='row' spacing={{ xs: 1, sm: 2 }} alignItems='center' sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
              flexShrink: 0
            }}
          >
            Filters:
          </Typography>
          {(!isMobile || showFilters) && (
            <Stack
              direction='row'
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1, sm: 0 }
              }}
            >
              <Button
                variant='contained'
                component='label'
                size='small'
                color='primary'
                onClick={() => handleOpenDialog('quiz')}
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  whiteSpace: 'nowrap'
                }}
              >
                📚 By Quiz
              </Button>
              <Button
                variant='contained'
                component='label'
                size='small'
                color='primary'
                onClick={() => handleOpenDialog('location')}
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  whiteSpace: 'nowrap'
                }}
              >
                📍 By Location
              </Button>
            </Stack>
          )}
        </Stack>
        {isMobile && (
          <IconButton
            onClick={toggleFilters}
            size='small'
            sx={{
              flexShrink: 0
            }}
          >
            {showFilters ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
      </Box>
      {/* Always show chips if filters are selected, regardless of showFilters state */}
      {(selectedQuizzes.length > 0 || selectedLocations.length > 0) && (
        <>
          {/* Selected quizzes chips */}
          {selectedQuizzes.length > 0 && (
            <Box sx={{ width: '100%', mt: { xs: 0.5, sm: 1 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    flexShrink: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                >
                  Quizzes:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 0.75, sm: 1 },
                    overflowX: 'auto',
                    flexGrow: 1,
                    py: { xs: 0.5, sm: 1 },
                    width: '100%',
                    '&::-webkit-scrollbar': {
                      height: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '2px'
                    }
                  }}
                >
                  {selectedQuizzes.map(quiz => (
                    <Chip
                      key={quiz._id}
                      label={quiz.title}
                      onDelete={() => handleDeleteChip('quiz', quiz)}
                      deleteIcon={<CloseIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                      size='small'
                      color='primary'
                      sx={{
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        color: 'white',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 28 },
                        '& .MuiChip-label': {
                          px: { xs: 1, sm: 1.5 }
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          '&:hover': {
                            color: 'white'
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Selected locations chips */}
          {selectedLocations.length > 0 && (
            <Box sx={{ width: '100%', mt: { xs: 0.5, sm: 1 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    flexShrink: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                >
                  Locations:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 0.75, sm: 1 },
                    overflowX: 'auto',
                    flexGrow: 1,
                    py: { xs: 0.5, sm: 1 },
                    width: '100%',
                    '&::-webkit-scrollbar': {
                      height: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '2px'
                    }
                  }}
                >
                  {selectedLocations.map((location, index) => (
                    <Chip
                      key={`${location.country}-${location.region}-${location.city}-${index}`}
                      label={[location.city, location.region, location.country].filter(Boolean).join(', ')}
                      onDelete={() => handleDeleteChip('location', location)}
                      deleteIcon={<CloseIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                      size='small'
                      color='primary'
                      sx={{
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        color: 'white',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 28 },
                        maxWidth: { xs: '200px', sm: 'none' },
                        '& .MuiChip-label': {
                          px: { xs: 1, sm: 1.5 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          '&:hover': {
                            color: 'white'
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
      {/* Quiz Selection Dialog */}
      <Dialog
        open={openDialog.quiz}
        onClose={() => handleCloseDialog('quiz')}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 32px)', sm: '400px' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '400px' },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' },
            m: { xs: 2, sm: 'auto' },
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            position: 'relative'
          }}
        >
          Select Quiz
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('quiz')}
            size='small'
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: { xs: 8, sm: 12 },
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: { xs: 1.5, sm: 3 },
            py: { xs: 1.5, sm: 2 }
          }}
        >
          {loading.fetchQuizzes ? (
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Loading...</Typography>
          ) : error ? (
            <Typography color='error' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {error}
            </Typography>
          ) : (
            <List
              sx={{
                overflowY: 'auto',
                maxHeight: { xs: '250px', sm: '300px' },
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px'
                }
              }}
            >
              {quiz.map(item => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleQuizSelect(item.id)}
                    sx={{
                      py: { xs: 1, sm: 1.5 },
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      {getAvatarContent(item, {
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 }
                      })}
                    </ListItemAvatar>
                    <Stack direction='column' sx={{ ml: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0 }}>
                      <Typography
                        variant='body1'
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        ID: {item.id}
                      </Typography>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Selection Dialog */}
      <Dialog
        open={openDialog.location}
        onClose={() => handleCloseDialog('location')}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 32px)', sm: '400px' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '400px' },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' },
            m: { xs: 2, sm: 'auto' },
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            position: 'relative'
          }}
        >
          Select Location
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('location')}
            size='small'
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: { xs: 8, sm: 12 },
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: { xs: 1.5, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px'
            }
          }}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ pt: { xs: 1, sm: 2 } }}>
            <Grid item xs={12}>
              <CountryRegionDropdown
                defaultCountryCode=''
                selectedCountryObject={selectedCountryObject}
                setSelectedCountryObject={setSelectedCountryObject}
                onCountryChange={handleChangeCountry}
              />
            </Grid>

            {selectedCountryObject?.country && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    autoHighlight
                    onChange={(e, newValue) => {
                      setSelectedRegion(newValue)
                      getCitiesData(newValue)
                      setSelectedCity('')
                    }}
                    id='autocomplete-region-select'
                    options={selectedCountryObject?.regions || []}
                    getOptionLabel={option => option || ''}
                    renderInput={params => (
                      <TextField
                        {...params}
                        key={params.id}
                        label='Choose a region'
                        size='medium'
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
              <Grid item xs={12}>
                {loading.fetchCities && (
                  <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Loading cities...</Typography>
                )}
                {!loading.fetchCities && (
                  <FormControl fullWidth>
                    <Autocomplete
                      autoHighlight
                      onChange={(e, newValue) => {
                        setSelectedCity(newValue)
                      }}
                      id='autocomplete-city-select'
                      options={cityOptions || []}
                      getOptionLabel={option => option || ''}
                      renderInput={params => (
                        <TextField
                          {...params}
                          key={params.id}
                          label='Choose a City'
                          size='medium'
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'city'
                          }}
                        />
                      )}
                      value={selectedCity}
                    />
                  </FormControl>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant='contained'
                component='label'
                fullWidth
                onClick={handleLocationSelect}
                disabled={!selectedCountryObject && !selectedRegion && !selectedCity}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1, sm: 1.25 },
                  color: 'white'
                }}
              >
                Add Location
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ReusableFiltersList
