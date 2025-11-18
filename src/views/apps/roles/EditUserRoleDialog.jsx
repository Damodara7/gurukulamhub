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
  Typography
} from '@mui/material'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { toast } from 'react-toastify'

const USER_ROLE = ROLES_LOOKUP.USER

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
    <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={() => setOpen(false)}>
      <DialogTitle className='flex flex-col gap-2 text-center'>
        Edit Roles
        <Typography component='span' className='flex flex-col text-center'>
          Edit roles & status
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='normal' style={{ minWidth: '270px' }}>
          <InputLabel id='roles-multi-select-label'>Roles</InputLabel>
          <Select
            label='Roles'
            labelId='roles-multi-select-label'
            multiple
            name='roles'
            value={roleNames}
            onChange={handleRoleChange}
            renderValue={selected => (
              <div className='flex flex-wrap gap-2'>
                {selected.map(value => (
                  <Chip
                    key={value}
                    clickable={value !== USER_ROLE}
                    deleteIcon={
                      value === USER_ROLE ? null : (
                        <i
                          className='ri-close-circle-fill'
                          onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                        />
                      )
                    }
                    size='small'
                    label={value} // Assuming value is the label; adjust if needed
                    onDelete={value === USER_ROLE ? undefined : () => handleDeleteChip(value)} // Prevent deletion of USER role
                    sx={{
                      ...(value === USER_ROLE && {
                        opacity: 0.7,
                        cursor: 'not-allowed'
                      })
                    }}
                  />
                ))}
              </div>
            )}
          >
            {roles.map(role => (
              <MenuItem
                key={role._id}
                value={role.name}
                disabled={role.name === USER_ROLE} // Disable USER role checkbox (it's always selected)
              >
                <Checkbox
                  checked={roleNames.includes(role.name)}
                  disabled={role.name === USER_ROLE} // USER role is always checked and disabled
                />
                <ListItemText
                  primary={role.name}
                  secondary={role.name === USER_ROLE ? 'Required for all users' : undefined}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin='normal' style={{ minWidth: '270px' }}>
          <InputLabel id='geo-roles-multi-select-label'>Geographical Roles</InputLabel>
          <Select
            label='Geographical Roles'
            labelId='geo-roles-multi-select-label'
            multiple
            name='geoRoles'
            value={geoRoleNames}
            disabled
            onChange={handleGeoRoleChange}
            renderValue={selected => (
              <div className='flex flex-wrap gap-2'>
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
                    label={value} // Assuming value is the label; adjust if needed
                    onDelete={() => handleDeleteGeoChip(value)} // Call delete handler
                  />
                ))}
              </div>
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
        <FormControl margin='normal'>
          <FormControlLabel
            control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
            label={isActive ? 'Active' : 'Inactive'}
          />
        </FormControl>
      </DialogContent>
      <DialogActions className='gap-2 justify-center'>
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleSubmit}>
          Save
        </Button>
        <Button variant='outlined' tye='reset' color='secondary' onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditUserRoleDialog
