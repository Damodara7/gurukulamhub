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
import MenuItem from '@mui/material/MenuItem'
import { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { useSession } from 'next-auth/react'
import * as clientApi from '../../../app/api/client/client.api'
import { Box, FormControl, FormControlLabel, Switch, Tooltip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { toast } from 'react-toastify'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'

// AddContent Component
const AddContent = ({ handleClose, onCreate }) => {
  const theme = useTheme()
  const permissionOptions = Object.values(PERMISSIONS_LOOKUP)
  const [featureName, setFeatureName] = useState('')
  const [permissionChips, setPermissionChips] = useState([])
  const [featureNameError, setFeatureNameError] = useState('')
  const [permissionsError, setPermissionsError] = useState('')
  const [featureNameTouched, setFeatureNameTouched] = useState(false)
  const [permissionsTouched, setPermissionsTouched] = useState(false)

  const handleRemoveChip = chipToRemove => {
    const updatedChips = permissionChips.filter(chip => chip !== chipToRemove)
    setPermissionChips(updatedChips)
    // Re-validate permissions if field was touched
    if (permissionsTouched && updatedChips.length === 0) {
      setPermissionsError('At least one permission is required')
    } else {
      setPermissionsError('')
    }
  }

  const handleCreateFeature = () => {
    onCreate({ name: featureName.toUpperCase().replace(/\s+/g, '_'), permissions: permissionChips })
    handleClose()
  }

  const handleFeatureNameBlur = () => {
    setFeatureNameTouched(true)
    if (!featureName.trim()) {
      setFeatureNameError('Feature name is required')
    } else {
      setFeatureNameError('')
    }
  }

  const handlePermissionsBlur = () => {
    setPermissionsTouched(true)
    if (permissionChips.length === 0) {
      setPermissionsError('At least one permission is required')
    } else {
      setPermissionsError('')
    }
  }

  // Check if form is valid
  const isFormValid = featureName.trim() !== '' && permissionChips.length > 0 && !featureNameError && !permissionsError

  return (
    <>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <TextField
          sx={{ mt: 2 }}
          fullWidth
          label='Feature Name'
          variant='outlined'
          placeholder='Enter Feature Name'
          value={featureName}
          error={!!featureNameError}
          helperText={featureNameError}
          onChange={e => {
            const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_')
            setFeatureName(formattedName)
            if (featureNameTouched && formattedName.trim()) {
              setFeatureNameError('')
            }
          }}
          onBlur={handleFeatureNameBlur}
          required
        />
        <TextField
          fullWidth
          select
          label='Permissions'
          variant='outlined'
          value={permissionChips}
          error={!!permissionsError}
          helperText={permissionsError}
          onChange={e => {
            const selectedPermissions = e.target.value
            setPermissionChips(typeof selectedPermissions === 'string' ? selectedPermissions.split(',') : selectedPermissions)
            if (permissionsTouched && selectedPermissions.length > 0) {
              setPermissionsError('')
            }
          }}
          onBlur={handlePermissionsBlur}
          required
          SelectProps={{
            multiple: true,
            renderValue: selected => selected.join(', ')
          }}
        >
          {permissionOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        {permissionChips.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              borderRadius: 2,
              p: 1
            }}
          >
            {permissionChips.map(chip => (
              <Chip
                key={chip}
                label={chip}
                onDelete={() => handleRemoveChip(chip)}
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.grey[300], 0.8)
                }}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 2, sm: 2 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button
          onClick={handleClose}
          variant='outlined'
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
          component='label'
          color='primary'
          style={{ color: 'white' }}
          variant='contained'
          onClick={handleCreateFeature}
          disabled={!isFormValid}
        >
          Submit
        </Button>
      </DialogActions>
    </>
  )
}

// EditContent Component
const EditContent = ({ handleClose, data, onUpdate }) => {
  const theme = useTheme()
  const permissionOptions = Object.values(PERMISSIONS_LOOKUP)
  const [featureName, setFeatureName] = useState(data.name)
  const [permissionChips, setPermissionChips] = useState(data.permissions || [])
  const [showTooltip, setShowTooltip] = useState(false)
  const [isActive, setIsActive] = useState(data?.isActive || false)

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
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

  return (
    <>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 4.5 },
          py: { xs: 3, sm: 4 },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <Alert severity='warning'>
          <AlertTitle>Warning!</AlertTitle>
          By editing the feature name, you might break the system functionality. Please ensure you are absolutely
          certain before proceeding.
        </Alert>
        <Tooltip open={showTooltip} placement='top' title='Only super admin can edit the feature names' arrow>
          <TextField
            fullWidth
            label='Feature Name'
            variant='outlined'
            placeholder='Enter Feature Name'
            value={featureName}
            onClick={() => {
              setShowTooltip(true)
              setTimeout(() => setShowTooltip(false), 2000)
            }}
            InputProps={{
              readOnly: true
            }}
          />
        </Tooltip>
        <TextField
          fullWidth
          select
          label='Permissions'
          variant='outlined'
          value={permissionChips}
          onChange={e => {
            const selectedPermissions = e.target.value
            setPermissionChips(typeof selectedPermissions === 'string' ? selectedPermissions.split(',') : selectedPermissions)
          }}
          SelectProps={{
            multiple: true,
            renderValue: selected => selected.join(', ')
          }}
        >
          {permissionOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        {permissionChips.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              borderRadius: 2,
              p: 1
            }}
          >
            {permissionChips.map(chip => (
              <Chip
                key={chip}
                label={chip}
                onDelete={() => handleRemoveChip(chip)}
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.grey[300], 0.8)
                }}
              />
            ))}
          </Box>
        )}
        <FormControl margin='normal'>
          <FormControlLabel
            control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
            label={isActive ? 'Active' : 'Inactive'}
          />
        </FormControl>
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 2, sm: 2 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          '& > .MuiButton-root': {
            minWidth: 120,
            justifyContent: 'center'
          }
        }}
      >
        <Button
          onClick={handleClose}
          variant='outlined'
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
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleUpdateFeature}>
          Update
        </Button>
      </DialogActions>
    </>
  )
}

// Main Features Dialog Component
const FeatureDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
  const theme = useTheme()

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
        toast.success('Feature created successfully')
        await onSuccess() // Call the success handler
      } else {
        console.error('Error creating feature:', result?.message)
        toast.error('Error creating feature')
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while creating the feature:', error)
      // Handle the error (e.g., show a notification)
      toast.error('Error creating feature')
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
        toast.success('Feature updated successfully')
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating feature:', result?.message)
        toast.error('Error updating feature')
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      // Handle the error (e.g., show a notification)
      toast.error('Error updating feature')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2.5, sm: 0 },
          my: { xs: 4, sm: 6 },
          maxHeight: { xs: '72dvh', sm: '82dvh' },
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
            {data ? 'Edit Geo-Feature' : 'Add New Geo-Feature'}
          </Typography>
          <IconButtonTooltip
            title='Close'
            onClick={handleClose}
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
          {data ? 'Edit Geo-feature as per your requirements.' : 'Geo-features you may use and assign to your users.'}
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
