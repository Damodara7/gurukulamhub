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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Typography>Filters : </Typography>
          {(!isMobile || showFilters) && (
            <>
              <Button variant='outlined' size='small' onClick={() => handleOpenDialog('quiz')}>
                By quiz
              </Button>
              <Button variant='outlined' size='small' onClick={() => handleOpenDialog('location')}>
                By Location
              </Button>
            </>
          )}
        </Stack>
        {isMobile && (
          <IconButton onClick={toggleFilters} size='small'>
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
                <Typography variant='body2' sx={{ flexShrink: 0 }}>
                  Quizzes:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    flexGrow: 1,
                    py: 1
                  }}
                >
                  {selectedQuizzes.map(quiz => (
                    <Chip
                      key={quiz._id}
                      label={quiz.title}
                      onDelete={() => handleDeleteChip('quiz', quiz)}
                      deleteIcon={<CloseIcon />}
                      size='small'
                      sx={{
                        flexShrink: 0, // Prevent chips from shrinking
                        whiteSpace: 'nowrap' // Keep text in one line
                      }}
                    />
                  ))}
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
                <Typography variant='body2' sx={{ flexShrink: 0 }}>
                  Locations:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    flexGrow: 1,
                    py: 1
                  }}
                >
                  {selectedLocations.map((location, index) => (
                    <Chip
                      key={`${location.country}-${location.region}-${location.city}-${index}`}
                      label={[location.city, location.region, location.country].filter(Boolean).join(', ')}
                      onDelete={() => handleDeleteChip('location', location)}
                      deleteIcon={<CloseIcon />}
                      size='small'
                      sx={{
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
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
            width: '400px',
            maxHeight: 'calc(100vh - 64px)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          Select Quiz
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('quiz')}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading.fetchQuizzes ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color='error'>{error}</Typography>
          ) : (
            <List
              sx={{
                overflowY: 'auto',
                maxHeight: '300px'
              }}
            >
              {quiz.map(item => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleQuizSelect(item.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemAvatar>{getAvatarContent(item)}</ListItemAvatar>
                    <Stack direction='column' sx={{ ml: 2 }}>
                      <Typography variant='body1'>{item.title}</Typography>
                      <Typography variant='caption' color='text.secondary'>
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
            width: '400px',
            maxHeight: 'calc(100vh - 64px)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          Select Location
          <IconButton
            aria-label='close'
            onClick={() => handleCloseDialog('location')}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 2 }}>
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
                {loading.fetchCities && <Typography>Loading cities...</Typography>}
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
