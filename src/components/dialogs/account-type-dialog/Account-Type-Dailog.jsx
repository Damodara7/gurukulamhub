'use client'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { Box, FormControl, FormControlLabel, Switch } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { toast } from 'react-toastify'

// AddContent Component
const AddContent = ({ handleClose, onCreate }) => {
  const theme = useTheme()
  const [accountTypeName, setAccountTypeName] = useState('')

  const handleCreateAccountType = () => {
    onCreate({ name: accountTypeName.toUpperCase().replace(/\s+/g, '_') })
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
          gap: 4
          // background: `linear-gradient(155deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(
          //   theme.palette.secondary.light,
          //   0.08
          // )} 100%)`
        }}
      >
        <TextField
          fullWidth
          label='Account Type Name'
          variant='outlined'
          placeholder='Enter Account Type Name'
          className='mbe-2'
          value={accountTypeName}
          onChange={e => {
            const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_')
            setAccountTypeName(formattedName)
          }}
          // InputLabelProps={{
          //   shrink: true
          // }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          alignItems: 'center',
          px: { xs: 3, sm: 4.5 },
          py: { xs: 2.5, sm: 3 },
          mt: { xs: 1, sm: 1.5 },
          gap: { xs: 1.5, sm: 2 },
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
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
          onClick={handleCreateAccountType}
          disabled={!accountTypeName.trim()}
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
  const [accountTypeName, setAccountTypeName] = useState(data.name)
  const [isActive, setIsActive] = useState(data?.isActive || false)

  const handleStatusChange = event => {
    setIsActive(event.target.checked)
  }

  const handleUpdateAccountType = () => {
    onUpdate({
      _id: data._id,
      name: accountTypeName.toUpperCase().replace(/\s+/g, '_'),
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
          gap: 3
          // background: `linear-gradient(155deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(
          //   theme.palette.secondary.light,
          //   0.08
          // )} 100%)`
        }}
      >
        <TextField
          fullWidth
          label='Account Type Name'
          variant='outlined'
          placeholder='Enter Account Type Name'
          value={accountTypeName}
          onChange={e => {
            const formattedName = e.target.value.toUpperCase().replace(/\s+/g, '_')
            setAccountTypeName(formattedName)
          }}
          InputLabelProps={{
            shrink: true
          }}
          sx={{ mt: 1 }}
        />
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
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleUpdateAccountType}>
          Update
        </Button>
      </DialogActions>
    </>
  )
}

// Main AccountType Dialog Component
const AccountTypeDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
  const theme = useTheme()

  const handleClose = () => {
    setOpen(false)
  }

  const handleCreateAccountType = async newAccountType => {
    try {
      const result = await RestApi.post(API_URLS.v0.ACCOUNT_TYPE, {
        ...newAccountType,
        createdBy: session?.user?.name || session?.user?.email,
        creatorEmail: session?.user?.email
      })

      if (result?.status === 'success') {
        console.log('Account Type created successfully:', result)
        await onSuccess() // Call the success handler
        toast.success('Account Type created successfully')
      } else {
        console.error('Error creating account type:', result?.message)
        // Optionally, show a user-friendly error message here
        toast.error('Error creating account type')
      }
    } catch (error) {
      console.error('An error occurred while creating the account type:', error)
      // Handle the error (e.g., show a notification)
      toast.error('Error creating account type')
    }
  }

  const handleUpdateAccountType = async updatedAccountType => {
    try {
      const result = await RestApi.put(API_URLS.v0.ACCOUNT_TYPE, {
        ...updatedAccountType,
        updatedBy: session?.user?.name || session?.user?.email,
        updaterEmail: session?.user?.email
      })

      if (result?.status === 'success') {
        console.log('Account Type updated successfully:', result)
        toast.success('Account Type updated successfully')
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating account type:', result?.message)
        toast.error('Error updating account type')
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while updating the account type:', error)
      toast.error('Error updating account type')
      // Handle the error (e.g., show a notification)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          mx: { xs: 2.5, sm: 0 },
          my: { xs: 4, sm: 6 },
          px: { xs: 0, sm: 0 },
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
            {data ? 'Update Account Type' : 'Create Account Type'}
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
          {data ? 'Modify account type details below.' : 'Provide details for the new account type.'}
        </Typography>
      </DialogTitle>
      {data ? (
        <EditContent handleClose={handleClose} data={data} onUpdate={handleUpdateAccountType} />
      ) : (
        <AddContent handleClose={handleClose} onCreate={handleCreateAccountType} />
      )}
    </Dialog>
  )
}

export default AccountTypeDialog
