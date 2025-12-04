'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  MenuItem,
  Stack,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material'
import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import { useSession } from 'next-auth/react'
import { updateUserAlertByAlertId } from '../../actions/userAlerts'

const EditContent = ({ handleClose, data, onUpdate }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    <DialogContent
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 },
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* User Email */}
        <Grid item xs={12}>
          <TextField
            label='User Email'
            value={formData.email}
            fullWidth
            required
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                bgcolor: alpha(theme.palette.action.selected, isDarkMode ? 0.08 : 0.04)
              }
            }}
          />
        </Grid>

        {/* Active Status */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Active Status'
            select
            value={formData.status}
            onChange={e => handleSetFormValue('status', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }
            }}
          >
            {['active', 'inactive'].map(status => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Completion Status */}
        <Grid item xs={12} sm={6}>
          <TextField
            label='Completion Status'
            select
            value={formData.completionStatus}
            onChange={e => handleSetFormValue('completionStatus', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }
            }}
          >
            {['pending', 'completed'].map(status => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent='flex-end'
            sx={{ pt: { xs: 1, sm: 2 } }}
          >
            <Button
              onClick={handleClose}
              variant='outlined'
              color='primary'
              fullWidth={isMobile}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.1, sm: 1.25 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.9375rem', sm: '1rem' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              component='label'
              onClick={handleUpdateRow}
              fullWidth={isMobile}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                py: { xs: 1.1, sm: 1.25 },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'white',
                boxShadow: isDarkMode
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Update Status
            </Button>
          </Stack>
        </Grid>
      </Grid>
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

  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3, md: 4 },
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          backgroundImage: 'none',
          boxShadow: isDarkMode
            ? `0 24px 48px ${alpha(theme.palette.common.black, 0.5)}`
            : '0 24px 48px rgba(15, 23, 42, 0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          pt: { xs: 3, sm: 4 },
          pb: { xs: 2, sm: 2.5 },
          px: { xs: 2.5, sm: 3, md: 4 },
          position: 'relative',
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: { xs: 12, sm: 16 },
            top: { xs: 12, sm: 16 },
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: theme.palette.error.main
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1 }}>
          <Box
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.15 : 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.info.main
            }}
          >
            <PersonIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </Box>
          <Box>
            <Typography
              variant='h5'
              fontWeight={700}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              Edit Alert Status
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                mt: 0.5
              }}
            >
              Update active and completion status for this user alert.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <EditContent handleClose={handleClose} data={data} onUpdate={handleUpdateRow} />
    </Dialog>
  )
}

export default AlertUsersDialog
