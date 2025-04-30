// 'use client'
// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { useSession } from 'next-auth/react'
import * as clientApi from '../../../app/api/client/client.api'
import { FormControl, FormControlLabel, Switch, Tooltip } from '@mui/material'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// AddContent Component
const AddContent = ({ handleClose, onCreate }) => {
  const [featureName, setFeatureName] = useState('')
  const [permissions, setPermissions] = useState('')
  const [permissionChips, setPermissionChips] = useState([])

  const handleAddPermission = () => {
    if (permissions.trim()) {
      setPermissionChips([...permissionChips, permissions.trim()])
      setPermissions('')
    }
  }

  const handleRemoveChip = chipToRemove => {
    setPermissionChips(chips => chips.filter(chip => chip !== chipToRemove))
  }

  const handleCreateFeature = () => {
    onCreate({ name: featureName.toUpperCase().replace(/\s+/g, '_'), permissions: permissionChips })
    handleClose()
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' && permissions.trim()) {
      handleAddPermission()
    }
  }

  return (
    <>
      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
        <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <TextField
          fullWidth
          label='Feature Name'
          variant='outlined'
          placeholder='Enter Feature Name'
          className='mbe-2'
          value={featureName}
          onChange={e => {
            const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_') // Convert to uppercase and replace spaces with hyphens
            setFeatureName(formattedName) // Update state with the formatted name
          }}
        />
        <TextField
          fullWidth
          label='Permissions'
          variant='outlined'
          placeholder='Enter Permission'
          className='mbe-2'
          value={permissions}
          onChange={e => {
            const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_') // Convert to uppercase and replace spaces with hyphens
            setPermissions(formattedName) // Update state with the formatted name
          }}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <Button
                size='small'
                onClick={handleAddPermission}
                color='primary'
                variant='text'
                disabled={!permissions.trim()}
              >
                Add
              </Button>
            )
          }}
        />
        {permissionChips.length > 0 && (
          <div className='flex flex-wrap gap-1 border border-gray-300 rounded p-1'>
            {permissionChips.map(chip => (
              <Chip key={chip} label={chip} onDelete={() => handleRemoveChip(chip)} className='bg-gray-200' />
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button
          // type='submit'
          component='label'
          color='primary'
          style={{ color: 'white' }}
          variant='contained'
          onClick={handleCreateFeature}
        >
          Create Feature
        </Button>
        <Button onClick={handleClose} variant='outlined'>
          Discard
        </Button>
      </DialogActions>
    </>
  )
}

// EditContent Component
const EditContent = ({ handleClose, data, onUpdate }) => {
  const [featureName, setFeatureName] = useState(data.name)
  const [permissions, setPermissions] = useState('')
  const [permissionChips, setPermissionChips] = useState(data.permissions || [])
  const [showTooltip, setShowTooltip] = useState(false)
  const [isActive, setIsActive] = useState(data?.isActive || false)

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleAddPermission = () => {
    if (permissions.trim()) {
      setPermissionChips([...permissionChips, permissions.trim()])
      setPermissions('')
    }
  }

  const handleRemoveChip = chipToRemove => {
    setPermissionChips(chips => chips.filter(chip => chip !== chipToRemove))
  }

  const handleUpdateFeature = () => {
    onUpdate({
      _id: data._id,
      name: featureName.toUpperCase().replace(/\s+/g, '_'),
      permissions: permissionChips?.map(each => each.toUpperCase().replace(/\s+/g, '_')),
      isActive: isActive
    })
    handleClose()
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' && permissions.trim()) {
      handleAddPermission()
    }
  }

  return (
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>
      <Alert severity='warning' className='mbe-8'>
        <AlertTitle>Warning!</AlertTitle>
        By editing the feature name, you might break the system functionality. Please ensure you are absolutely certain
        before proceeding.
      </Alert>
      <Tooltip open={showTooltip} placement='top' title='Only super admin can edit the feature names' arrow>
        <TextField
          fullWidth
          label='Feature Name'
          variant='outlined'
          placeholder='Enter Feature Name'
          className='mbe-2'
          value={featureName}
          onClick={e => {
            // Prevent updating the state since it's read-only
            setShowTooltip(true)

            // Hide the tooltip after a delay
            setTimeout(() => setShowTooltip(false), 2000)
            // const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_') // Convert to uppercase and replace spaces with hyphens
            // setFeatureName(formattedName) // Update state with the formatted name
          }}
          InputProps={{
            readOnly: true // Make the TextField read-only
          }}
        />
      </Tooltip>
      <TextField
        fullWidth
        label='Permissions'
        variant='outlined'
        placeholder='Enter Permission'
        className='mbe-2'
        value={permissions}
        onChange={e => {
          const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_') // Convert to uppercase and replace spaces with hyphens
          setPermissions(formattedName) // Update state with the formatted name
        }}
        onKeyDown={handleKeyDown}
        InputProps={{
          endAdornment: (
            <Button
              size='small'
              onClick={handleAddPermission}
              color='primary'
              variant='text'
              disabled={!permissions.trim()}
            >
              Add
            </Button>
          )
        }}
      />
      {permissionChips.length > 0 && (
        <div className='flex flex-wrap gap-1 border border-gray-300 rounded p-1'>
          {permissionChips.map(chip => (
            <Chip key={chip} label={chip} onDelete={() => handleRemoveChip(chip)} className='bg-gray-200' />
          ))}
        </div>
      )}
      <FormControl margin='normal'>
        <FormControlLabel
          control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
          label={isActive ? 'Active' : 'Inactive'}
        />
      </FormControl>
      <DialogActions className='gap-2 justify-center'>
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleUpdateFeature}>
          Update
        </Button>
      </DialogActions>
    </DialogContent>
  )
}

// Main Features Dialog Component
const FeatureDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
  const handleClose = () => {
    setOpen(false)
  }

  const handleCreateFeature = async newFeature => {
    try {
      // const result = await clientApi.addFeature({
      //   ...newFeature,
      //   createdBy: session?.user?.email
      // })
      const result = await RestApi.post(API_URLS.v0.GEO_FEATURE, {
        ...newFeature,
        createdBy: session?.user?.email
      })

      if (result?.status === 'success') {
        console.log('Feature created successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error creating feature:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while creating the feature:', error)
      // Handle the error (e.g., show a notification)
    }
  }

  const handleUpdateFeature = async updatedFeature => {
    try {
      // const result = await clientApi.updateFeature(updatedFeature._id, {
      //   ...updatedFeature,
      //   updatedBy: session?.user?.email
      // })
      const result = await RestApi.put(API_URLS.v0.GEO_FEATURE, {
        ...updatedFeature,
        updatedBy: session?.user?.email
      })

      if (result?.status === 'success') {
        console.log('Feature updated successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating feature:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      // Handle the error (e.g., show a notification)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {data ? 'Edit Feature' : 'Add New Feature'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit feature as per your requirements.' : 'Features you may use and assign to your users.'}
        </Typography>
      </DialogTitle>
      {data ? (
        <EditContent handleClose={handleClose} data={data} onUpdate={handleUpdateFeature} />
      ) : (
        <AddContent handleClose={handleClose} onCreate={handleCreateFeature} />
      )}
    </Dialog>
  )
}

export default FeatureDialog
