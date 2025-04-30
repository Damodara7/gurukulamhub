import { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  Grid,
  FormControl,
  Switch,
  FormControlLabel,
  Tooltip,
  Button,
  Alert,
  AlertTitle,
  Autocomplete
} from '@mui/material'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import { useSession } from 'next-auth/react'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import Loading from '@/components/Loading'
import { toast } from 'react-toastify'
import select from '@/@core/theme/overrides/select'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Styled Accordion Components
const Accordion = styled(props => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0
  },
  '&::before': {
    display: 'none'
  }
}))

const AccordionSummary = styled(props => <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon />} {...props} />)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center', // Center align items vertically
    backgroundColor: 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse', // Ensure items are in a row
    '& .MuiAccordionSummary-expandIconWrapper': {
      '&.Mui-expanded': {
        transform: 'rotate(90deg)' // Rotate the icon when expanded
      }
    },
    '& .MuiAccordionSummary-content': {
      display: 'flex', // Flexbox for content
      alignItems: 'center', // Center align content vertically
      marginRight: theme.spacing(1) // Optional margin
    },
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255, 255, 255, .05)'
    })
  })
)

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)'
}))

const GeoRoleDialog = ({ open, setOpen, roleData = null, refreshRoles }) => {
  const { data: session } = useSession()
  const [roleName, setRoleName] = useState(roleData?.title || '')
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState(false)
  const [data, setData] = useState([])
  const [expanded, setExpanded] = useState(false) // State for expanded panels
  const [showTooltip, setShowTooltip] = useState(false)
  const [isActive, setIsActive] = useState(roleData?.isActive || false)
  const [selectedCountry, setSelectedCountry] = useState(roleData?.country || '')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(roleData?.region || '')
  const [city, setCity] = useState(roleData?.city || '')
  const [cityOptions, setCityOptions] = useState([])
  const [loading, setLoading] = useState({ fetchCities: false })

  console.log('data', data)

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  function handleChangeCountry(countryValue) {
    setSelectedRegion('') // Reset region when country changes
  }

  // Fetch Features from API
  const getFeatureData = async () => {
    try {
      console.log('Fetching Features Data now...')
      // const result = await clientApi.getAllFeatures()
      const result = await RestApi.get(`${API_URLS.v0.GEO_FEATURE}`)
      if (result?.status === 'success') {
        console.log('Features Fetched result', result)
        setData(result?.result || []) // Store the fetched data
      } else {
        console.log('Error Fetching features:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    }
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
        setCityOptions(result?.result?.map(each => ({ label: each.city, value: each.city }))) // Store the fetched cities
      } else {
        console.log('Error Fetching cities:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(prev => ({ ...prev, fetchCities: false }))
    }
  }

  useEffect(() => {
    if (open) {
      getFeatureData() // Fetch data when the dialog opens
      if (roleData) {
        setRoleName(roleData.name)
        const selectedPermissions = roleData.features.flatMap(feature =>
          feature.permissions.map(permission => `${feature.name}-${permission}`)
        )
        setSelectedCheckbox(selectedPermissions)
      } else {
        setRoleName('') // Reset roleName if no roleData
        setSelectedCheckbox([]) // Reset checkboxes if creating a new role
      }
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
    setSelectedCheckbox([])
    setExpanded(false)
  }

  async function handleCreateRole() {
    if (!roleName) {
      toast.error('Role name is required')
      return
    }
    if (!selectedCountry) {
      toast.error('Country is required')
      return
    }
    try {
      // Build features array from the selected checkboxes
      const features = data
        .map(feature => {
          const permissions = feature.permissions.filter(permission =>
            selectedCheckbox.includes(`${feature.name}-${permission}`)
          )
          return {
            _id: feature._id,
            name: feature.name,
            permissions
          }
        })
        .filter(feature => feature.permissions.length > 0) // Remove features with no selected permissions

      let geoGraphy = { country: selectedCountry }
      if (selectedRegion) {
        geoGraphy.region = selectedRegion
      }
      if (city) {
        geoGraphy.city = city
      }

      const payload = {
        name: roleName.toUpperCase().replace(/\s+/g, '-'),
        createdBy: session?.user?.email,
        features,
        ...geoGraphy
      }

      // const result = await clientApi.addRole(payload)
      const result = await RestApi.post(`${API_URLS.v0.GEO_ROLE}`, { ...payload })
      if (result?.status === 'success') {
        console.log('Role Created Successfully:', result)
        await refreshRoles() // Refresh roles data after creating a role
        handleClose()
      } else {
        console.log('Error Creating Role:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }

  async function handleUpdateRole() {
    if (!roleName) {
      toast.error('Role name is required')
      return
    }
    if (!selectedCountry) {
      toast.error('Country is required')
      return
    }
    try {
      // Build features array from the selected checkboxes
      const features = data
        .map(feature => {
          const permissions = feature.permissions.filter(permission =>
            selectedCheckbox.includes(`${feature.name}-${permission}`)
          )
          return {
            _id: feature._id,
            name: feature.name,
            permissions
          }
        })
        .filter(feature => feature.permissions.length > 0) // Remove features with no selected permissions

      let geoGraphy = { country: selectedCountry }
      if (selectedRegion) {
        geoGraphy.region = selectedRegion
      }
      if (city) {
        geoGraphy.city = city
      }

      const payload = {
        ...roleData,
        name: roleName.toUpperCase().replace(/\s+/g, '_'), // Make sure `roleName` is set with the updated role name
        updatedBy: session?.user?.email,
        isActive: isActive,
        features,
        ...geoGraphy
      }

      // const result = await clientApi.updateRole(payload._id, payload) // Assuming roleData has an id field
      const result = await RestApi.put(`${API_URLS.v0.GEO_ROLE}`, { ...payload })
      if (result?.status === 'success') {
        console.log('Role Updated Successfully:', result)
        await refreshRoles() // Refresh roles data after updating a role
        handleClose()
      } else {
        console.log('Error Updating Role:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const togglePermission = (feature, permission) => {
    const permissionId = `${feature}-${permission}`
    const updatedCheckboxes = selectedCheckbox.includes(permissionId)
      ? selectedCheckbox.filter(item => item !== permissionId)
      : [...selectedCheckbox, permissionId]

    setSelectedCheckbox(updatedCheckboxes)
  }

  const handleSelectAllCheckbox = () => {
    // Determine if all permissions are selected
    const allPermissions = data.flatMap(feature =>
      feature.permissions.map(permission => `${feature.name}-${permission}`)
    )

    // Check if all permissions are selected
    const allSelected =
      allPermissions.length > 0 && allPermissions.every(permission => selectedCheckbox.includes(permission))

    // If all are selected, deselect all; otherwise, select all
    if (allSelected) {
      setSelectedCheckbox([])
    } else {
      setSelectedCheckbox(allPermissions)
    }
  }

  useEffect(() => {
    const allPermissions = data.flatMap(feature =>
      feature.permissions.map(permission => `${feature.name}-${permission}`)
    )
    setIsIndeterminateCheckbox(selectedCheckbox.length > 0 && selectedCheckbox.length < allPermissions.length)
  }, [selectedCheckbox, data])

  return (
    <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={handleClose}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center'>
        {roleData ? 'Edit Role' : 'Add Geographical Role'}
        <Typography component='span' className='flex flex-col text-center'>
          Set Role Features & Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='overflow-visible'>
          <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButtonTooltip>
          <Alert severity='warning' className='mbe-8'>
            <AlertTitle>Warning!</AlertTitle>
            By editing the role name, you might break the system functionality. Please ensure you are absolutely certain
            before proceeding.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Tooltip open={showTooltip} placement='top' title='Only super admin can edit the role names' arrow>
                <TextField
                  label='Role Name'
                  variant='outlined'
                  fullWidth
                  placeholder='Enter Role Name'
                  value={roleName} // Use state value
                  onChange={e => {
                    const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_') // Convert to uppercase and replace spaces with hyphens
                    setRoleName(formattedName) // Update state with the formatted name
                  }}
                  onClick={e => {
                    if (roleData) {
                      setShowTooltip(true)
                      setTimeout(() => setShowTooltip(false), 2000)
                    }
                  }}
                  InputProps={{
                    readOnly: !!roleData // Make the TextField read-only if editing
                  }}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h5' gutterBottom>
                Restrict Geographical Area Permissions
              </Typography>

              <Typography variant='body1'>
                Define the access level for users based on their geographical location:
              </Typography>

              <ul>
                <li>
                  <Typography variant='body2'>
                    <strong>Country:</strong> Users with this role will have access to the entire country.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body2'>
                    <strong>State:</strong> Users with this role will have access restricted to the specified state.
                  </Typography>
                </li>
                <li>
                  <Typography variant='body2'>
                    <strong>City:</strong> Users with this role will have access restricted to the specified city.
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
                      id='autocomplete-region-select'
                      options={cityOptions}
                      getOptionLabel={option => option.label || ''}
                      renderInput={params => (
                        <TextField
                          {...params}
                          key={params.value}
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
          </Grid>

          <Typography variant='h5' className='plb-6'>
            Role Permissions
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                onChange={handleSelectAllCheckbox}
                indeterminate={isIndeterminateCheckbox}
                checked={selectedCheckbox.length === data.flatMap(feature => feature.permissions).length}
              />
            }
            label='Select All Permissions'
          />

          {data.map((feature, index) => {
            const allPermissions = feature.permissions.map(permission => `${feature.name}-${permission}`)
            const allSelected = allPermissions.every(permission => selectedCheckbox.includes(permission))
            const isIndeterminate =
              selectedCheckbox.length > 0 &&
              !allSelected &&
              allPermissions.some(permission => selectedCheckbox.includes(permission))

            const toggleSelectAll = () => {
              if (allSelected) {
                // Deselect all permissions for this feature
                setSelectedCheckbox(selectedCheckbox.filter(item => !allPermissions.includes(item)))
              } else {
                // Select all permissions for this feature
                setSelectedCheckbox([...selectedCheckbox, ...allPermissions])
              }
            }

            return (
              <Accordion key={index} expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                <AccordionSummary aria-controls={`panel${index}d-content`} id={`panel${index}d-header`}>
                  <Typography className='font-medium'>{feature.name}</Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={e => {
                      if (expanded === `panel${index}`) {
                        e.stopPropagation()
                      }
                      toggleSelectAll()
                    }}
                    style={{ marginLeft: 'auto' }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {feature.permissions.map(permission => (
                      <Grid item xs={6} sm={4} md={3} lg={3} key={permission}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              id={`${feature.name}-${permission}`}
                              onChange={() => togglePermission(feature.name, permission)}
                              checked={selectedCheckbox.includes(`${feature.name}-${permission}`)}
                            />
                          }
                          label={permission}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}

          <FormControl margin='normal'>
            <FormControlLabel
              control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
              label={isActive ? 'Active' : 'Inactive'}
            />
          </FormControl>
        </DialogContent>
        <DialogActions className='gap-2 justify-center'>
          <Button
            variant='contained'
            component='label'
            style={{ color: 'white' }}
            onClick={roleData ? handleUpdateRole : handleCreateRole}
          >
            {roleData ? 'Edit' : 'Add'}
          </Button>
          <Button variant='outlined' tye='reset' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GeoRoleDialog
