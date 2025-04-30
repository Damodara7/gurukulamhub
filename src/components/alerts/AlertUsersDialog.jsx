import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Grid,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material'
import { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { updateUserAlertByAlertId } from '../../actions/userAlerts'
import IconButtonTooltip from '../IconButtonTooltip'

const EditContent = ({ handleClose, data, onUpdate }) => {
  const [formData, setFormData] = useState({
    email: data?.email || '',
    status: data?.status || '',
    completionStatus: data?.completionStatus || ''
  })

  const handleSetFormValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateRow = () => {
    onUpdate({
      ...formData
    })
    handleClose()
  }

  return (
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>
      <Grid container spacing={2}>
        {/* User Email */}
        <Grid item xs={12}>
          <TextField
            label='User Email'
            value={formData.email}
            fullWidth
            margin='dense'
            required
            InputProps={{ readOnly: true }}
          />
        </Grid>

        {/* Active Status */}
        <Grid item xs={12}>
          <TextField
            label='Active Status'
            select
            value={formData.status}
            onChange={e => handleSetFormValue('status', e.target.value)}
            fullWidth
            margin='dense'
            required
          >
            {['active', 'inactive'].map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Completion Status */}
        <Grid item xs={12}>
          <TextField
            label='Completion Status'
            select
            value={formData.completionStatus}
            onChange={e => handleSetFormValue('completionStatus', e.target.value)}
            fullWidth
            margin='dense'
            required
          >
            {['pending', 'completed'].map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <DialogActions className='gap-2 justify-center'>
        <Button onClick={handleClose} variant='outlined' color='primary'>
          Cancel
        </Button>
        <Button component='label' variant='contained' style={{ color: 'white' }} onClick={handleUpdateRow}>
          Update
        </Button>
      </DialogActions>
    </DialogContent>
  )
}

// Main Video Dialog Component
const AlertUsersDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()

  const handleClose = () => {
    setOpen(false)
  }

  const handleUpdateRow = async updatingRow => {
    try {
      const result = await updateUserAlertByAlertId({
        email: data.email,
        alertId: data.alertId,
        data: {
          ...updatingRow
          // updatedBy: session?.user?.email
        }
      })

      if (result?.status === 'success') {
        console.log('Row updated successfully:', result)
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating Row:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      // Handle the error (e.g., show a notification)
    }
  }

  console.log({ data: data })

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={handleClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Alert Status
        <Typography component='span' className='flex flex-col text-center'>
          Edit active status and completion status of alert as per your requirements.
        </Typography>
      </DialogTitle>
      <EditContent handleClose={handleClose} data={data} onUpdate={handleUpdateRow} />
    </Dialog>
  )
}

export default AlertUsersDialog
