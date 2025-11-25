import { useState, useEffect } from 'react'
import { styled, useTheme, alpha } from '@mui/material/styles'
import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
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
  Autocomplete,
  Box,
  Stack
} from '@mui/material'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import { toast } from 'react-toastify'
// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import CountryRegionDropdown from '@/views/pages/auth/register-multi-steps/CountryRegionDropdown'
import Loading from '@/components/Loading'
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
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, .03)',
    flexDirection: 'row',
    '& .MuiAccordionSummary-expandIconWrapper': {
      order: -1,
      marginRight: theme.spacing(1),
      '&.Mui-expanded': {
        transform: 'rotate(90deg)'
      }
    },
    '& .MuiAccordionSummary-content': {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      margin: 0,
      minWidth: 0,
      '&.Mui-expanded': {
        margin: 0
      }
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
  const theme = useTheme()
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
        geoGraphy.city = typeof city === 'object' && city?.value ? city.value : city
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
        toast.success('Role created successfully')
        handleClose()
      } else {
        console.log('Error Creating Role:', result)
        toast.error('Error creating role')
      }
    } catch (error) {
      console.log('Error:', error)
      toast.error('Error creating role')
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
        geoGraphy.city = typeof city === 'object' && city?.value ? city.value : city
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
        toast.success('Role updated successfully')
        handleClose()
      } else {
        console.log('Error Updating Role:', result)
        toast.error('Error updating role')
      }
    } catch (error) {
      console.log('Error:', error)
      toast.error('Error updating role')
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
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 2 },
          my: { xs: 2, sm: 3 },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' },
          height: { xs: 'calc(100dvh - 32px)', sm: '90dvh' },
          maxHeight: { xs: 'calc(100dvh - 32px)', sm: '90dvh' },
          border: theme => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 5 },
          py: { xs: 2.5, sm: 3 },
          borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ width: 40 }} />
          <Stack spacing={0.5} sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {roleData ? 'Edit Role' : 'Add Geographical Role'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Set role name, permissions and activation status.
            </Typography>
          </Stack>
          <IconButtonTooltip
            title='Close'
            onClick={handleClose}
            sx={{
              color: theme => theme.palette.text.secondary,
              '&:hover i': { color: theme => theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
        </Box>
      </DialogTitle>
      <form
        onSubmit={e => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}
      >
        <DialogContent
          sx={{
            px: { xs: 3, sm: 5 },
            py: { xs: 3, sm: 4 },
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.5)
              }
            }
          }}
        >
          <Stack spacing={3}>
            <Alert severity='warning'>
              <AlertTitle>Warning!</AlertTitle>
              By editing the role name, you might break the system functionality. Please ensure you are absolutely
              certain before proceeding.
            </Alert>
            <Tooltip open={showTooltip} placement='top' title='Only super admin can edit the role names' arrow>
              <TextField
                label='Role Name'
                variant='outlined'
                fullWidth
                placeholder='Enter Role Name'
                value={roleName}
                onChange={e => {
                  const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_')
                  setRoleName(formattedName)
                }}
                onClick={() => {
                  if (roleData) {
                    setShowTooltip(true)
                    setTimeout(() => setShowTooltip(false), 2000)
                  }
                }}
                InputProps={{
                  readOnly: !!roleData
                }}
              />
            </Tooltip>
          </Stack>
          <Grid container spacing={2} sx={{ mt: 2 }}>
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
                <Typography sx={{ textAlign: 'center', width: '100%' }} variant='h6'>
                  {city
                    ? `Restricted to "${typeof city === 'object' && city?.label ? city.label : city}" city.`
                    : selectedRegion
                      ? `Restricted to "${selectedRegion}" Region.`
                      : selectedCountryObject
                        ? `Restricted to "${selectedCountryObject.country}" country.`
                        : ''}
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
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
              sx={{
                mb: 1,
                border: theme => `1px dashed ${theme.palette.divider}`,
                px: 2,
                py: 1,
                borderRadius: 2,
                width: '100%'
              }}
            />
          </Box>

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
                <AccordionSummary
                  aria-controls={`panel${index}d-content`}
                  id={`panel${index}d-header`}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 2
                    }
                  }}
                >
                  <Typography
                    className='font-medium'
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {feature.name}
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={e => {
                      if (expanded === `panel${index}`) {
                        e.stopPropagation()
                      }
                      toggleSelectAll()
                    }}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {feature.permissions.map(permission => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={permission}>
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
        <DialogActions
          sx={{
            px: { xs: 3, sm: 5 },
            py: { xs: 2.5, sm: 3 },
            pt: { xs: 2, sm: 2.5 },
            borderTop: theme => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            flexShrink: 0,
            backgroundColor: theme => theme.palette.background.paper
          }}
        >
          <Stack direction='row' spacing={2} width='100%'>
            <Button
              variant='outlined'
              type='reset'
              color='secondary'
              fullWidth
              onClick={handleClose}
              sx={{
                color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : undefined,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              component='label'
              style={{ color: 'white' }}
              fullWidth
              onClick={roleData ? handleUpdateRole : handleCreateRole}
            >
              {roleData ? 'Update' : 'Submit'}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default GeoRoleDialog
