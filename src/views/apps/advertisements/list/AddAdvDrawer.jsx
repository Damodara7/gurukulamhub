/********** Standard imports.*********************/
import React, { useEffect, useState, useRef } from 'react'
import Grid from '@mui/material/Grid'
import {
  TextField,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Link,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box
} from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
//import { Box } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'
import { FEATURES_LOOKUP } from '@/configs/features-lookup'
/********************************************/

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import StartAndEndDatePicker from './StartAndEndDatePicker'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import Loading from '@/components/Loading'
import MultiSelect from '@/components/MultiSelect'
import { toast } from 'react-toastify'
import { checkFeaturePermission } from '@/libs/checkPermissions'
import MediaPreviewPopup from '@/components/videos/MediaPreviewPopup'
import { Close, Delete, Upload, Visibility } from '@mui/icons-material'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Vars
const initialData = {
  userName: '',
  email: '',
  contact: '',
  company: '',
  website: '',
  industry: '',
  otherIndustry: '',
  organizationType: '',
  description: '',
  imageUrl: '',
  actionUrl: '',
  runType: '',
  status: '',
  startDate: new Date(),
  endDate: new Date(),
  advtCategory: '',
  tagline: '',
  bounds: {
    geoGraphy: {
      country: '',
      region: '',
      city: ''
    },
    quizzes: []
  }
}

const AddAdvDrawer = ({ open, handleClose, mode = 'add', data = null, onRefresh = {} }) => {
  // States
  const [formData, setFormData] = useState(data || initialData)
  const [selectedCountry, setSelectedCountry] = useState(data?.country || '')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(data?.region || '')
  const [city, setCity] = useState(data?.city || '')
  const [cityOptions, setCityOptions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState({ fetchCities: false, submit: false, fetchQuizzes: false })

  const [logoImage, setLogoImage] = useState(null)
  const [logoFileName, setLogoFileName] = useState('')
  const [viewLogoImage, setViewLogoImage] = useState(false)
  const logoFileInputRef = useRef(null)

  console.log('data', data)

  function handleChangeCountry(countryValue) {
    setSelectedRegion('') // Reset region when country changes
  }

  const handleSubmit = async e => {
    console.log('Submitting advt save...')
    let geoGraphy = { country: selectedCountry }
    if (selectedRegion) {
      geoGraphy.region = selectedRegion
    }
    if (city) {
      geoGraphy.city = city
    }

    const payload = {
      ...formData,
      bounds: {
        ...formData.bounds,
        geoGraphy: geoGraphy,
        quizzes: formData.bounds.quizzes.length === 0 ? 'all' : formData.bounds.quizzes
      }
    }
    if (mode == 'add') {
      // try {
      //   const featurePermissionResult = await checkFeaturePermission(
      //     FEATURES_LOOKUP.MANAGE_ADVT, PERMISSIONS_LOOKUP.CREATE);

      //     console.log("featurePermission",featurePermissionResult)
      //   if (featurePermissionResult.status === 'error') {
      //     return { status: 'error', message: featurePermissionResult.message, result: null };
      //   }
      // }catch(error){
      //    console.log("Error while fetching auth info.");
      //    return
      // }
      const result = await RestApi.post(API_URLS.v0.ADMIN_ADD_ADVERTISEMENT, payload)
      setLoading(prev => ({ ...prev, submit: true }))
      if (result.status === 'success') {
        console.log('Advt added result', result.result)
        // toast.success('Advt added .')
        setLoading(prev => ({ ...prev, submit: false }))
        handleClose()
        onRefresh()
      } else {
        toast.error('Error:' + result.message)
        setLoading(prev => ({ ...prev, submit: false }))
      }
    } else {
      console.log('Updating the advt.')
      const result = await RestApi.put(API_URLS.v0.ADMIN_ADD_ADVERTISEMENT, { ...payload, id: payload._id })
      setLoading(prev => ({ ...prev, submit: true }))
      if (result.status === 'success') {
        console.log('Updated  result', result.result)
        // toast.success('Advt Updated .')
        setLoading(prev => ({ ...prev, submit: false }))
        handleClose()
        onRefresh()
      } else {
        toast.error('Error:' + result.message)
        setLoading(prev => ({ ...prev, submit: false }))
      }
    }
  }

  const handleReset = () => {
    setFormData(initialData)
  }

  // Fetch Cities from DB
  const getCitiesData = async (region = '') => {
    setLoading(prev => ({ ...prev, fetchCities: true }))
    try {
      console.log('Fetching Cities Data now...')
      // const result = await clientApi.getAllCities()
      const result = await RestApi.get(`/api/cities?state=${region}`)
      if (result?.status === 'success') {
        console.log('Cities Fetched result', result)
        setCityOptions(result?.result?.map(each => each.city)) // Store the fetched cities
      } else {
        console.log('Error Fetching cities:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  async function getQuizData() {
    //// toast.success('Fetching My Quiz Data now...')
    setLoading(prev => ({ ...prev, fetchQuizzes: true }))
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      //// toast.success('Quizzes Fetched Successfully .')
      setLoading(prev => ({ ...prev, fetchQuizzes: false }))
      setQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(prev => ({ ...prev, fetchQuizzes: false }))
      setQuizzes([])
    }
  }

  useEffect(() => {
    getQuizData()
  }, [])

  useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        bounds: { ...data?.bounds, quizzes: data?.bounds?.quizzes === 'all' ? [] : data?.bounds?.quizzes }
      })
      if (data?.bounds?.country) {
        setSelectedCountry(data?.bounds.country)
      }
      if (data?.bounds?.region) {
        setSelectedRegion(data?.bounds.region)
        getCitiesData(data?.bounds.region)
      }
      if (data?.bounds?.city) {
        setCity(data?.bounds.city)
      }
    }
  }, [data])

  const handleLogoImageUpload = event => {
    const file = event.target.files[0]
    if (file) {
      setLogoFileName(file.name)
      const reader = new FileReader()
      reader.onload = () => setLogoImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteLogoImage = () => {
    setLogoImage(null)
    setLogoFileName('')
  }
  const handleOpenLogoImage = () => setViewLogoImage(true)
  const handleCloseLogoImage = () => setViewLogoImage(false)

  return (
    <Dialog
      open={open}
      // anchor='right'
      // variant='temporary'
      onClose={handleClose}
      maxWidth='lg'
      fullWidth
      // ModalProps={{ keepMounted: true }}
      // sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <DialogTitle>
        <div className='flex items-center justify-between'>
          <Typography variant='h4'>{mode == 'add' ? 'Add' : 'Edit'} Advertisement</Typography>
          <IconButtonTooltip title='Close' onClick={handleClose}>
            <i className='ri-close-line' />
          </IconButtonTooltip>
        </div>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4} className='pt-1'>
          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Email'
              fullWidth
              placeholder='pvr@gmail.com'
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </Grid>

          {/* User Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='User name'
              fullWidth
              required
              placeholder='pvr'
              value={formData.userName}
              onChange={e => setFormData({ ...formData, userName: e.target.value })}
            />
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Name/Company/Organization'
              fullWidth
              placeholder='Company PVT LTD'
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
          </Grid>

          {/* Website Url */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Website'
              type='text'
              fullWidth
              placeholder='https://example.com'
              value={formData.website}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
            />
          </Grid>

          {/* Industry */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='industry'>Select Industry</InputLabel>
              <Select
                fullWidth
                id='industry'
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                label='Select Industry'
                inputProps={{ placeholder: 'Select Industry' }}
              >
                <MenuItem value=''>Select Industry</MenuItem>
                <MenuItem value='agriculture'>Agriculture</MenuItem>
                <MenuItem value='education'>Education</MenuItem>
                <MenuItem value='it-and-developnent'>IT & Development</MenuItem>
                <MenuItem value='health-care'>Healthcare</MenuItem>
                <MenuItem value='finance'>Finance</MenuItem>
                <MenuItem value='retail'>Retail</MenuItem>
                <MenuItem value='manufacturing'>Manufacturing</MenuItem>
                <MenuItem value='services'>Services</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Other Industry */}
          {formData.industry === 'other' && (
            <Grid item xs={12} sm={6}>
              <TextField
                label='Specify Industry'
                fullWidth
                placeholder='Other'
                value={formData.otherIndustry}
                onChange={e => setFormData({ ...formData, otherIndustry: e.target.value })}
              />
            </Grid>
          )}

          {/* Organization Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='organizationType'>Select Organization Type</InputLabel>
              <Select
                fullWidth
                id='organizationType'
                value={formData.organizationType}
                onChange={e => setFormData({ ...formData, organizationType: e.target.value })}
                label='Select Organization Type'
                inputProps={{ placeholder: 'Select Organization Type' }}
              >
                <MenuItem value=''>Select Organization Type</MenuItem>
                <MenuItem value='public-company'>Public Company</MenuItem>
                <MenuItem value='self-employed'>Self-employed</MenuItem>
                <MenuItem value='government-agency'>Government Agency</MenuItem>
                <MenuItem value='non-profit'>Non-profit</MenuItem>
                <MenuItem value='sole-proprietorship'>Sole proprietorship</MenuItem>
                <MenuItem value='privately-held'>Privately held</MenuItem>
                <MenuItem value='partnership'>Partnership</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Contact'
              type='number'
              required
              minLength={10}
              fullWidth
              placeholder='(397) 294-5153'
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Description'
              type='text'
              fullWidth
              placeholder='About Add'
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>

          {/* Image Url */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Image Url'
              type='text'
              fullWidth
              placeholder='http://example.com/image.png'
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </Grid>

          {/* Action Url */}
          <Grid item xs={12} sm={6}>
            <TextField
              label='Action Url'
              type='text'
              fullWidth
              placeholder='https://example.com'
              value={formData.actionUrl}
              onChange={e => setFormData({ ...formData, actionUrl: e.target.value })}
              helperText='This link will be opened when user clicks on this advertisement.'
            />
          </Grid>

          {/* Start and End Date Picker */}
          <Grid item xs={12} sm={6}>
            <StartAndEndDatePicker
              formData={formData}
              setFormData={setFormData}
              startDate={formData.startDate}
              endDate={formData.endDate}
            />
          </Grid>

          {/* Select Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='select-status'>Select Status</InputLabel>
              <Select
                fullWidth
                id='select-status'
                required
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                label='Select Status'
                labelId='status-select'
                inputProps={{ placeholder: 'Select Status' }}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>In Active</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Select Media Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='select-mediaType'>Select Media Type</InputLabel>
              <Select
                fullWidth
                id='select-mediaType'
                required
                value={formData.mediaType}
                onChange={e => setFormData({ ...formData, mediaType: e.target.value })}
                label='Select Media Type'
                labelId='status-mediaType'
                inputProps={{ placeholder: 'Select Media Type' }}
              >
                <MenuItem value='video'>Video</MenuItem>
                <MenuItem value='image'>Image</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Select Run Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='select-runtype'>Select Run Type</InputLabel>
              <Select
                required
                fullWidth
                id='select-runtype'
                value={formData.runType}
                onChange={e => setFormData({ ...formData, runType: e.target.value })}
                label='Select Run Type'
                labelId='status-runtype'
                inputProps={{ placeholder: 'Select Run Type' }}
              >
                <MenuItem value='animate__shakeX'>Shake X</MenuItem>
                <MenuItem value='flashing-ad'>Flashing</MenuItem>
                <MenuItem value='animate__animated animate__bounce'>Bounce</MenuItem>
                <MenuItem value='animate__animated animate__rubberBand'>Rubber Band</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Select Advt Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='select-advtCategory'>Select Advt Category</InputLabel>
              <Select
                fullWidth
                required
                id='select-advtCategory'
                value={formData.advtCategory}
                onChange={e => setFormData({ ...formData, advtCategory: e.target.value })}
                label='Select Advt Category'
                labelId='status-category'
                inputProps={{ placeholder: 'Select Advt Category' }}
              >
                <MenuItem value='top'>Top Rolling Banner</MenuItem>
                <MenuItem value='bottom'>Bottom Banner</MenuItem>
                <MenuItem value='login'>Login Screen</MenuItem>
                <MenuItem value='landing'>Landing Page (My Progress)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='body1' gutterBottom>
              Logo
            </Typography>
            <input type='file' accept='image/*' ref={logoFileInputRef} hidden onChange={handleLogoImageUpload} />

            <Box display='flex' alignItems='center' gap={2}>
              {logoImage ? (
                <Box
                  display='flex'
                  alignItems='center'
                  gap={2}
                  className='pr-2'
                  style={{ background: 'rgba(240, 240, 240, 0.8)', borderRadius: '4px' }}
                >
                  <Box position='relative' width={150} height={100}>
                    <img
                      src={logoImage}
                      alt='Uploaded'
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant='body1' color='textSecondary'>
                      {logoFileName}
                    </Typography>
                    <div className='text-right'>
                      <IconButtonTooltip title='Open' color='primary' size='small' onClick={handleOpenLogoImage}>
                        <Visibility color='primary' fontSize='small' />
                      </IconButtonTooltip>
                      <IconButtonTooltip title='Delete' size='small' onClick={handleDeleteLogoImage}>
                        <Delete fontSize='small' color='error' />
                      </IconButtonTooltip>
                    </div>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant='outlined'
                  // fullWidth
                  onClick={() => logoFileInputRef.current.click()}
                  startIcon={<Upload />}
                  sx={{ width: 150, height: 100 }}
                >
                  Upload
                </Button>
              )}
            </Box>

            <Dialog open={viewLogoImage} onClose={handleCloseLogoImage} maxWidth='sm' fullWidth>
              <DialogTitle className='pb-2'>
                <Box className='flex justify-between items-center'>
                  <Typography variant='h5'>Preview Logo</Typography>
                  <IconButtonTooltip title='Close' onClick={handleCloseLogoImage}>
                    <Close />
                  </IconButtonTooltip>
                </Box>
              </DialogTitle>
              <DialogContent>
                {logoImage && <img src={logoImage} alt='Preview' style={{ width: '100%' }} />}
              </DialogContent>
            </Dialog>
          </Grid>

          {/* Tagline */}
          <Grid item xs={12}>
            <TextField
              label='Tagline'
              type='text'
              fullWidth
              placeholder='Tagline'
              value={formData.tagline}
              onChange={e => setFormData({...formData, tagline: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant='h5' gutterBottom>
              Restrict Advertisement by Geographical Area
            </Typography>

            <Typography variant='body1'>
              Define the target group for advertisements based on their geographical location:
            </Typography>

            <ul>
              <li>
                <Typography variant='body2'>
                  <strong>Country:</strong> Advertisements will be visible to users across the entire country.
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  <strong>State:</strong> Advertisements will be shown only to users within the specified state.
                </Typography>
              </li>
              <li>
                <Typography variant='body2'>
                  <strong>City:</strong> Advertisements will be targeted to users in the specified city.
                </Typography>
              </li>
            </ul>
          </Grid>

          <Grid item xs={12} md={6}>
            <CountryRegionDropdown
              setSelectedCountry={setSelectedCountry}
              selectedCountryObject={selectedCountryObject}
              setSelectedCountryObject={setSelectedCountryObject}
              onCountryChange={handleChangeCountry}
            />
          </Grid>

          {selectedCountryObject?.country && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Autocomplete
                  autoHighlight
                  onChange={(e, newValue) => {
                    setSelectedRegion(newValue)
                    getCitiesData(newValue)
                    setCity('')
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
                    onChange={(e, newValue) => {
                      setCity(newValue)
                    }}
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

          <Grid item xs={12}>
            <Alert icon={false} color='info'>
              <Typography className='w-full text-center' variant='h6'>
                {city
                  ? `Restricted to "${city.value}" city.`
                  : selectedRegion
                    ? `Restricted to "${selectedRegion}" Region.`
                    : selectedCountryObject
                      ? `Restricted to "${selectedCountryObject.country}" country.`
                      : ''}
              </Typography>
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='h5' gutterBottom>
              Select Quizzes for which Advertisement should run
            </Typography>

            <Typography variant='body1'>
              Advertisements will be visible for all selected Quizzes within the geographical area mentioned above.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <MultiSelect
              label='Select Quizzes'
              placeholder='Select Quizzes'
              selectedValues={formData?.bounds?.quizzes}
              onChange={values => {
                // Update the form data
                setFormData({
                  ...formData,
                  bounds: {
                    ...formData.bounds,
                    quizzes: values
                  }
                })
              }}
              defaultAll={true} // Enable "All" behavior
              options={quizzes.map(quiz => ({
                value: quiz._id,
                optionLabel: (
                  <>
                    <Grid container alignItems='center' spacing={2}>
                      {/* Quiz Thumbnail on the Left */}
                      <Grid item>
                        <img
                          src={quiz.thumbnail || 'https://via.placeholder.com/150'}
                          alt={quiz.title}
                          style={{ width: 50, height: 50, borderRadius: '50%' }}
                        />
                      </Grid>

                      {/* Title and ID on the Right, stacked */}
                      <Grid item>
                        <Typography variant='body1' fontWeight='bold'>
                          {quiz.title}
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                          {quiz.details}
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                ),
                selectedLabel: quiz.title
              }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className='flex items-center justify-center gap-4'>
        <Button variant='outlined' color='error' disabled={loading.submit} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant='contained'
          component='label'
          sx={{ color: 'white' }}
          disabled={loading.submit}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddAdvDrawer
