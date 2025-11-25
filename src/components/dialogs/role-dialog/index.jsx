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
  Box,
  Stack,
  AlertTitle,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { toast } from 'react-toastify'

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

const RoleDialog = ({ open, setOpen, roleData = null, refreshRoles }) => {
  const { data: session } = useSession()
  const theme = useTheme()
  const [roleName, setRoleName] = useState(roleData?.title || '')
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState(false)
  const [data, setData] = useState([])
  const [expanded, setExpanded] = useState(false) // State for expanded panels
  const [showTooltip, setShowTooltip] = useState(false)
  const [isActive, setIsActive] = useState(roleData?.isActive || false)
  const [existingRoles, setExistingRoles] = useState([]) // Store all existing roles
  const [roleNameError, setRoleNameError] = useState('') // Error message for role name
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false) // Loading state for availability check
  const [availabilityStatus, setAvailabilityStatus] = useState(null) // 'available', 'unavailable', or null
  const [availabilityChecked, setAvailabilityChecked] = useState(false) // Whether availability has been checked

  console.log('data', data)

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  // Fetch Features from API
  const getFeatureData = async () => {
    try {
      console.log('Fetching Features Data now...')
      // const result = await clientApi.getAllFeatures()
      const result = await RestApi.get(`${API_URLS.v0.FEATURE}`)
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

  // Fetch all existing roles from API
  const getAllRoles = async () => {
    try {
      const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
      if (result?.status === 'success') {
        setExistingRoles(result?.result || [])
      } else {
        console.log('Error Fetching roles:', result)
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }

  // Check if role name already exists
  const checkRoleNameExists = (name) => {
    if (!name || !name.trim()) {
      return false
    }
    // Normalize the input name (remove spaces, hyphens, underscores, convert to uppercase)
    // This matches how we normalize existing role names for comparison
    const normalizedInput = name.toUpperCase().replace(/[\s\-_]+/g, '')
    
    // For create: check if any role with this name exists
    if (!roleData) {
      return existingRoles.some(role => {
        if (!role.name) return false
        // Normalize existing role name (remove spaces, hyphens, underscores, convert to uppercase)
        const normalizedRoleName = role.name.toUpperCase().replace(/[\s\-_]+/g, '')
        return normalizedRoleName === normalizedInput
      })
    }
    
    // For update: check if any role with this name exists AND it's not the current role
    return existingRoles.some(role => {
      if (!role.name || role._id === roleData._id) return false
      // Normalize existing role name (remove spaces, hyphens, underscores, convert to uppercase)
      const normalizedRoleName = role.name.toUpperCase().replace(/[\s\-_]+/g, '')
      return normalizedRoleName === normalizedInput
    })
  }

  // Handle check availability button click
  const handleCheckAvailability = async () => {
    if (!roleName || !roleName.trim()) {
      setRoleNameError('Please enter a role name first')
      return
    }

    setIsCheckingAvailability(true)
    setAvailabilityStatus(null)
    setRoleNameError('')

    // Simulate a small delay for better UX (optional)
    await new Promise(resolve => setTimeout(resolve, 300))

    const exists = checkRoleNameExists(roleName)
    
    setIsCheckingAvailability(false)
    setAvailabilityChecked(true)
    
    if (exists) {
      setAvailabilityStatus('unavailable')
      setRoleNameError('Role name already exists')
    } else {
      setAvailabilityStatus('available')
      setRoleNameError('')
    }
  }

  useEffect(() => {
    if (open) {
      getFeatureData() // Fetch data when the dialog opens
      getAllRoles() // Fetch all existing roles to check for duplicates
      setRoleNameError('') // Reset error when dialog opens
      setAvailabilityStatus(null) // Reset availability status
      setAvailabilityChecked(false) // Reset availability checked flag
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
    setRoleNameError('') // Reset error when closing
    setAvailabilityStatus(null) // Reset availability status
    setAvailabilityChecked(false) // Reset availability checked flag
  }

  async function handleCreateRole() {
    // Validate role name
    if (!roleName || !roleName.trim()) {
      setRoleNameError('Role name is required')
      toast.error('Role name is required')
      return
    }

    // Check if availability has been checked
    if (!availabilityChecked) {
      setRoleNameError('Please check role name availability first')
      toast.error('Please check role name availability before creating')
      return
    }

    // Check if role name is available
    if (availabilityStatus === 'unavailable' || checkRoleNameExists(roleName)) {
      setRoleNameError('Role name already exists')
      toast.error('Role name already exists. Please choose a different name.')
      return
    }

    const formattedName = roleName.toUpperCase().replace(/\s+/g, '-')

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

      const payload = {
        name: formattedName,
        createdBy: session?.user?.email,
        features
      }

      // const result = await clientApi.addRole(payload)
      const result = await RestApi.post(`${API_URLS.v0.ROLE}`, { ...payload })
      if (result?.status === 'success') {
        console.log('Role Created Successfully:', result)
        toast.success(result?.message || 'Role created successfully')
        await refreshRoles() // Refresh roles data after creating a role
        toast.success('Role created successfully')
        handleClose()
      } else {
        console.log('Error Creating Role:', result)
        toast.error(result?.message || 'Failed to create role')
      }
    } catch (error) {
      console.log('Error:', error)
      toast.error(error?.message || 'An unexpected error occurred while creating role')
    }
  }

  async function handleUpdateRole() {
    // Validate role name
    if (!roleName || !roleName.trim()) {
      setRoleNameError('Role name is required')
      toast.error('Role name is required')
      return
    }

    // Check if availability has been checked (only if role name changed)
    const currentFormattedName = roleName.toUpperCase().replace(/\s+/g, '_')
    const originalFormattedName = roleData?.name?.toUpperCase().replace(/\s+/g, '_') || ''
    
    if (currentFormattedName !== originalFormattedName) {
      if (!availabilityChecked) {
        setRoleNameError('Please check role name availability first')
        toast.error('Please check role name availability before updating')
        return
      }

      // Check if role name is available
      if (availabilityStatus === 'unavailable' || checkRoleNameExists(roleName)) {
        setRoleNameError('Role name already exists')
        toast.error('Role name already exists. Please choose a different name.')
        return
      }
    }

    const formattedName = roleName.toUpperCase().replace(/\s+/g, '_')

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

      const payload = {
        ...roleData,
        name: formattedName, // Make sure `roleName` is set with the updated role name
        updatedBy: session?.user?.email,
        isActive: isActive,
        features
      }

      // const result = await clientApi.updateRole(payload._id, payload) // Assuming roleData has an id field
      const result = await RestApi.put(`${API_URLS.v0.ROLE}`, { ...payload })
      if (result?.status === 'success') {
        console.log('Role Updated Successfully:', result)
        toast.success(result?.message || 'Role updated successfully')
        await refreshRoles() // Refresh roles data after updating a role
        handleClose()
      } else {
        console.log('Error Updating Role:', result)
        toast.error(result?.message || 'Failed to update role')
      }
    } catch (error) {
      console.log('Error:', error)
      toast.error(error?.message || 'An unexpected error occurred while updating role')
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
              {roleData ? 'Edit Role' : 'Add Role'}
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
            <Box>
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
          </Stack>

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
export default RoleDialog
