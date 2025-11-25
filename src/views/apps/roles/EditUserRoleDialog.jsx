import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Typography,
  Box
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { toast } from 'react-toastify'

const USER_ROLE = ROLES_LOOKUP.USER
import IconButtonTooltip from '@/components/IconButtonTooltip'

const EditUserRoleDialog = ({ open, setOpen, userData, refreshUsers, roles = [], geoRolesData = [] }) => {
  // Helper function to ensure USER role is always included
  const ensureUserRole = roles => {
    const rolesArray = Array.isArray(roles) ? roles : []
    if (!rolesArray.includes(USER_ROLE)) {
      return [USER_ROLE, ...rolesArray]
    }
    return rolesArray
  }

  const [roleNames, setRoleNames] = useState(() => ensureUserRole(userData?.roles || []))
  const theme = useTheme()
  const [geoRoleNames, setGeoRoleNames] = useState(userData?.geoRoles || [])
  const [isActive, setIsActive] = useState(userData?.isActive || false)

  const handleRoleChange = event => {
    const { value } = event.target
    const newRoles = typeof value === 'string' ? value.split(',') : value
    // Ensure USER role is always included
    setRoleNames(ensureUserRole(newRoles))
  }

  const handleGeoRoleChange = event => {
    const { value } = event.target
    setGeoRoleNames(typeof value === 'string' ? value.split(',') : value)
  }

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleDeleteChip = chipToDelete => {
    // Prevent deletion of USER role
    if (chipToDelete === USER_ROLE) {
      return
    }
    setRoleNames(prevRoles => {
      const filtered = prevRoles.filter(role => role !== chipToDelete)
      // Ensure USER role is still present
      return ensureUserRole(filtered)
    })
  }

  const handleDeleteGeoChip = chipToDelete => {
    setGeoRoleNames(prevRoles => prevRoles.filter(role => role !== chipToDelete))
  }

  // Assuming this is in your component file
  const handleSubmit = async () => {
    try {
      // Ensure USER role is included before submitting
      const finalRoles = ensureUserRole(roleNames)
      const updatedUserData = {
        email: userData.email, // Ensure user ID is included
        roles: finalRoles, // The selected roles (always includes USER)
        isActive: isActive // The status toggle
      }

      // Make API request to update userData
      const result = await RestApi.put(`${API_URLS.v0.USER}`, updatedUserData)
      // const result = await clientApi.updateUser(userData.email, { roles: roleNames, isActive: isActive })

      if (result?.status === 'success') {
        console.log('User updated successfully:', result)
        toast.success(result?.message || 'User roles updated successfully')
        await refreshUsers() // Call parent to refresh user list
        setOpen(false) // Close the dialog/modal
      } else {
        console.log('Error updating user:', result)
        toast.error(result?.message || 'Failed to update user roles')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error?.message || 'An unexpected error occurred while updating user roles')
    }
  }

  useEffect(() => {
    if (open && userData) {
      // Ensure USER role is always included when dialog opens
      setRoleNames(ensureUserRole(userData?.roles || []))
      setGeoRoleNames(userData?.geoRoles || [])
      setIsActive(userData?.isActive || false)
    }
  }, [open, userData])

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth='sm'
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2.5, sm: 0 },
          my: { xs: 4, sm: 6 },
          maxHeight: { xs: '80dvh', sm: '86dvh' },
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 18px 44px ${alpha(theme.palette.common.black, 0.5)}`
              : '0 18px 44px rgba(15,15,45,0.18)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
        }
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.75, sm: 3.25 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper
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
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.35rem' },
              letterSpacing: '-0.01em',
              color: theme.palette.text.primary,
              textAlign: 'center',
              flex: 1
            }}
          >
            Edit User Roles
          </Typography>
          <IconButtonTooltip
            title='Close'
            onClick={() => setOpen(false)}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover i': { color: theme.palette.text.primary }
            }}
          >
            <i className='ri-close-line text-xl' />
          </IconButtonTooltip>
        </Box>
        <Typography
          variant='body2'
          sx={{
            mt: 1.5,
            color: theme.palette.text.secondary,
            textAlign: 'center',
            fontSize: { xs: '0.92rem', sm: '0.95rem' }
          }}
        >
          Update role assignments and activation status for this user.
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Role Access
          </Typography>
          <FormControl fullWidth>
            <InputLabel id='roles-multi-select-label'>Roles</InputLabel>
            <Select
              label='Roles'
              labelId='roles-multi-select-label'
              multiple
              name='roles'
              value={roleNames}
              onChange={handleRoleChange}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selected.map(value => (
                    <Chip
                      key={value}
                      clickable
                      deleteIcon={
                        <i
                          className='ri-close-circle-fill'
                          onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                        />
                      }
                      size='small'
                      label={value}
                      onDelete={() => handleDeleteChip(value)}
                    />
                  ))}
                </Box>
              )}
            >
              {roles.map(role => (
                <MenuItem key={role._id} value={role.name}>
                  <Checkbox checked={roleNames.includes(role.name)} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Geographical Roles
          </Typography>
          <FormControl fullWidth>
            <InputLabel id='geo-roles-multi-select-label'>Geographical Roles</InputLabel>
            <Select
              label='Geographical Roles'
              labelId='geo-roles-multi-select-label'
              multiple
              name='geoRoles'
              value={geoRoleNames}
              onChange={handleGeoRoleChange}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selected.map(value => (
                    <Chip
                      key={value}
                      clickable
                      deleteIcon={<i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />}
                      size='small'
                      label={value}
                      onDelete={() => handleDeleteGeoChip(value)}
                    />
                  ))}
                </Box>
              )}
            >
              {geoRolesData.map(role => (
                <MenuItem key={role._id} value={role.name}>
                  <Checkbox checked={geoRoleNames.includes(role.name)} />
                  <ListItemText primary={role.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            gap: 2
          }}
        >
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Account Status
            </Typography>
            <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
              Toggle to activate or suspend this account.
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
            label={isActive ? 'Active' : 'Inactive'}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 2, sm: 0 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}
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
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleSubmit}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditUserRoleDialog
