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

const EditUserRoleDialog = ({ open, setOpen, userData, refreshUsers, roles = [], geoRolesData = [] }) => {
  const [roleNames, setRoleNames] = useState(userData?.roles || [])
  const [geoRoleNames, setGeoRoleNames] = useState(userData?.geoRoles || [])
  const [isActive, setIsActive] = useState(userData?.isActive || false)

  const handleRoleChange = event => {
    const { value } = event.target
    setRoleNames(typeof value === 'string' ? value.split(',') : value)
  }

  const handleGeoRoleChange = event => {
    const { value } = event.target
    setGeoRoleNames(typeof value === 'string' ? value.split(',') : value)
  }

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleDeleteChip = chipToDelete => {
    setRoleNames(prevRoles => prevRoles.filter(role => role !== chipToDelete))
  }

  const handleDeleteGeoChip = chipToDelete => {
    setGeoRoleNames(prevRoles => prevRoles.filter(role => role !== chipToDelete))
  }

  // Assuming this is in your component file
  const handleSubmit = async () => {
    try {
      const updatedUserData = {
        email: userData.email, // Ensure user ID is included
        roles: roleNames, // The selected roles
        isActive: isActive // The status toggle
      }

      // Make API request to update userData
      const result = await RestApi.put(`${API_URLS.v0.USER}`, updatedUserData)
      // const result = await clientApi.updateUser(userData.email, { roles: roleNames, isActive: isActive })

      if (result?.status === 'success') {
        console.log('User updated successfully:', result)
        await refreshUsers() // Call parent to refresh user list
      } else {
        console.log('Error updating user:', result)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setOpen(false) // Close the dialog/modal
    }
  }

  useEffect(() => {
    if (open && userData) {
      setRoleNames(userData?.roles || [])
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
                    clickable
                    deleteIcon={
                      <i
                        className='ri-close-circle-fill'
                        onMouseDown={event => event.stopPropagation()} // Prevent closing Select when clicking icon
                      />
                    }
                    size='small'
                    label={value} // Assuming value is the label; adjust if needed
                    onDelete={() => handleDeleteChip(value)} // Call delete handler
                  />
                ))}
              </div>
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
