// 'use client'
// MUI Imports
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
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { useSession } from 'next-auth/react'
import { FormControl, FormControlLabel, Switch } from '@mui/material'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// AddContent Component
const AddContent = ({ handleClose, onCreate }) => {
  const [accountTypeName, setAccountTypeName] = useState('')

  const handleCreateAccountType = () => {
    onCreate({ name: accountTypeName.toUpperCase().replace(/\s+/g, '_') })
    handleClose()
  }

  return (
    <>
      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
        <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
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
        />
      </DialogContent>
      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button
          component='label'
          color='primary'
          style={{ color: 'white' }}
          variant='contained'
          onClick={handleCreateAccountType}
          disabled={!accountTypeName.trim()}
        >
          Create Account Type
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
    <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
      <IconButtonTooltip title='Close' onClick={handleClose} className='absolute block-start-4 inline-end-4'>
        <i className='ri-close-line text-textSecondary' />
      </IconButtonTooltip>
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
      />
      <FormControl margin='normal'>
        <FormControlLabel
          control={<Switch checked={isActive} onChange={handleStatusChange} name='statusSwitch' color='primary' />}
          label={isActive ? 'Active' : 'Inactive'}
        />
      </FormControl>
      <DialogActions className='gap-2 justify-center'>
        <Button variant='contained' component='label' style={{ color: 'white' }} onClick={handleUpdateAccountType}>
          Update
        </Button>
      </DialogActions>
    </DialogContent>
  )
}

// Main AccountType Dialog Component
const AccountTypeDialog = ({ open, setOpen, data, onSuccess }) => {
  const { data: session } = useSession()
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
      } else {
        console.error('Error creating account type:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while creating the account type:', error)
      // Handle the error (e.g., show a notification)
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
        await onSuccess() // Call the success handler
      } else {
        console.error('Error updating account type:', result?.message)
        // Optionally, show a user-friendly error message here
      }
    } catch (error) {
      console.error('An error occurred while updating the account type:', error)
      // Handle the error (e.g., show a notification)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        {data ? 'Edit Account Type' : 'Add New Account Type'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit account type as per your requirements.' : 'Account types you may use for your users.'}
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

