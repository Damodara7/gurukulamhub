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
    const quizToAdd = quiz.find(q => q.id === quizId || q._id === quizId)
    if (quizToAdd && !selectedQuizzes.some(q => (q.id === quizId || q._id === quizId))) {
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
      const deleteId = itemToDelete.id || itemToDelete._id
      setSelectedQuizzes(selectedQuizzes.filter(q => {
        const quizId = q.id || q._id
        return quizId !== deleteId
      }))
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

  const getAvatarContent = quizItem => {
    if (quizItem.thumbnail) {
      return <Avatar src={quizItem.thumbnail} alt={quizItem.title} />
    }
    return <Avatar>{quizItem.title.charAt(0).toUpperCase()}</Avatar>
  }

  const handleChangeCountry = country => {
    setSelectedCountryObject(country)
    setSelectedRegion('')
    setSelectedCity('')
    setCityOptions([])
  }

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      gap: { xs: 0.5, sm: 0.75 }
    }}>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 0 }
      }}>
        <Stack 
          direction='row' 
          spacing={{ xs: 1, sm: 2 }} 
          alignItems='center'
          flexWrap='wrap'
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
              color: 'text.primary'
            }}
          >
            Filters:
          </Typography>
          {(!isMobile || showFilters) && (
            <>
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
                  minWidth: 'auto'
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
                  minWidth: 'auto'
                }}
              >
                📍 By Location
              </Button>
            </>
          )}
        </Stack>
        {isMobile && (
          <IconButton 
            onClick={toggleFilters} 
            size='small'
            sx={{ 
              color: 'text.primary',
              flexShrink: 0
            }}
          >
            {showFilters ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
      </Box>
      {showFilters && (
        <>
          {/* Selected quizzes chips */}
          {selectedQuizzes.length > 0 && (
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Typography 
                  variant='body2' 
                  sx={{ 
                    flexShrink: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.primary'
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
                    py: { xs: 0.75, sm: 1 },
                    '&::-webkit-scrollbar': {
                      height: 4
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)',
                      borderRadius: 2
                    }
                  }}
                >
                  {selectedQuizzes.map(quiz => {
                    const quizId = quiz._id || quiz.id
                    return (
                      <Chip
                        key={quizId}
                        label={quiz.title}
                        onDelete={() => handleDeleteChip('quiz', quiz)}
                        deleteIcon={<CloseIcon />}
                        size='small'
                        color='primary'
                        sx={{
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          color: 'white',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 },
                          '& .MuiChip-deleteIcon': {
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: { xs: 16, sm: 18 },
                            '&:hover': {
                              color: 'white'
                            }
                          }
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )}

          {/* Selected locations chips */}
          {selectedLocations.length > 0 && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography 
                  variant='body2' 
                  sx={{ 
                    flexShrink: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.primary'
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
                    py: { xs: 0.75, sm: 1 },
                    '&::-webkit-scrollbar': {
                      height: 4
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'rgba(0,0,0,0.2)',
                      borderRadius: 2
                    }
                  }}
                >
                  {selectedLocations.map((location, index) => (
                    <Chip
                      key={`${location.country}-${location.region}-${location.city}-${index}`}
                      label={[location.city, location.region, location.country].filter(Boolean).join(', ')}
                      onDelete={() => handleDeleteChip('location', location)}
                      deleteIcon={<CloseIcon />}
                      size='small'
                      color='primary'
                      sx={{
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        color: 'white',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        height: { xs: 24, sm: 28 },
                        maxWidth: { xs: 200, sm: 'none' },
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: { xs: 16, sm: 18 },
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
            width: { xs: '90%', sm: '400px' },
            maxWidth: { xs: '90%', sm: '400px' },
            maxHeight: 'calc(100vh - 64px)',
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            pb: { xs: 1, sm: 1.5 }
          }}
        >
          Select Quiz
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('quiz')}
            sx={{
              position: 'absolute',
              right: { xs: 4, sm: 8 },
              top: { xs: 4, sm: 8 },
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 }
          }}
        >
          {loading.fetchQuizzes ? (
            <Typography 
              sx={{ 
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Loading...
            </Typography>
          ) : error ? (
            <Typography 
              color='error'
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {error}
            </Typography>
          ) : (
            <List
              sx={{
                overflowY: 'auto',
                maxHeight: { xs: '250px', sm: '300px' },
                '&::-webkit-scrollbar': {
                  width: 6
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(0,0,0,0.2)',
                  borderRadius: 3
                }
              }}
            >
              {quiz.map(item => {
                const quizId = item.id || item._id
                return (
                  <ListItem key={quizId} disablePadding>
                    <ListItemButton
                      onClick={() => handleQuizSelect(quizId)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemAvatar>{getAvatarContent(item)}</ListItemAvatar>
                      <Stack direction='column' sx={{ ml: 2 }}>
                        <Typography 
                          variant='body1'
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {item.title}
                        </Typography>
                        <Typography 
                          variant='caption' 
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          ID: {quizId}
                        </Typography>
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                )
              })}
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
            width: { xs: '90%', sm: '400px' },
            maxWidth: { xs: '90%', sm: '400px' },
            maxHeight: 'calc(100vh - 64px)',
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            pb: { xs: 1, sm: 1.5 }
          }}
        >
          Select Location
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('location')}
            sx={{
              position: 'absolute',
              right: { xs: 4, sm: 8 },
              top: { xs: 4, sm: 8 },
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2.5 }
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
                  <Typography 
                    sx={{ 
                      textAlign: 'center',
                      py: 2,
                      color: 'text.secondary',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Loading cities...
                  </Typography>
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
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: 'city'
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }
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
                fullWidth
                onClick={handleLocationSelect}
                disabled={!selectedCountryObject && !selectedRegion && !selectedCity}
                sx={{
                  py: { xs: 1, sm: 1.25 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none'
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
