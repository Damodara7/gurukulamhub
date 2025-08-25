'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

const ConfirmationDialog = ({ open, setOpen, type, onConfirm }) => {
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [operationSuccess, setOperationSuccess] = useState(false)
  const [operationError, setOperationError] = useState(false)

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOperationSuccess(false)
    setOperationError(false)
    setOpen(false)
  }

  const handleConfirmation = async value => {
    setUserInput(value)
    setOpen(false)

    if (value) {
      // Perform async operation (like delete request)
      setLoading(true)
      try {
        await onConfirm() // Pass the async operation prop
        setOperationSuccess(true)
      } catch (error) {
        setOperationError(true)
      } finally {
        setLoading(false)
        setSecondDialog(true)
      }
    } else {
      setSecondDialog(true)
    }
  }

  // Message Handling based on Type
  const MESSAGE_CONFIG = {
    'delete-account': {
      title: 'Are you sure you want to deactivate your account?',
      success: 'Your account has been deactivated successfully.',
      cancel: 'Account Deactivation Cancelled!',
      error: 'Failed to deactivate account. Please try again.',
      status: 'Deactivated'
    },
    unsubscribe: {
      title: 'Are you sure to cancel your subscription?',
      success: 'Your subscription was cancelled successfully.',
      cancel: 'Unsubscription Cancelled!',
      error: 'Failed to cancel subscription. Please try again.',
      status: 'Unsubscribed'
    },
    'suspend-account': {
      title: 'Are you sure?',
      success: 'User has been suspended.',
      cancel: 'Suspension Cancelled!',
      error: 'Failed to suspend the user. Please try again.',
      status: 'Suspended!'
    },
    'delete-feature': {
      title: 'Are you sure you want to delete this feature?',
      success: 'Feature has been deleted successfully.',
      cancel: 'Feature Deletion Cancelled!',
      error: 'Failed to delete feature. Please try again.',
      status: 'Feature Deleted!'
    },
    'delete-role': {
      title: 'Are you sure you want to delete this role?',
      success: 'Role has been deleted successfully.',
      cancel: 'Role Deletion Cancelled!',
      error: 'Failed to delete role. Please try again.',
      status: 'Role Deleted!'
    },
    'delete-context': {
      title: 'Are you sure you want to delete this context? All the associated sub-contexts will also be deleted.',
      success: 'Context has been deleted successfully.',
      cancel: 'Context Deletion Cancelled!',
      error: 'Failed to delete context. Please try again.',
      status: 'Context Deleted!'
    },
    'delete-video': {
      title: 'Are you sure you want to delete this video?',
      success: 'Video has been deleted successfully.',
      cancel: 'Video Deletion Cancelled!',
      error: 'Failed to delete video. Please try again.',
      status: 'Video Deleted!'
    },
    'delete-game': {
      title: 'Are you sure you want to delete this game?',
      success: 'Game has been deleted successfully.',
      cancel: 'Game Deletion Cancelled!',
      error: 'Failed to delete game. Please try again.',
      status: 'Game Deleted!'
    },
    'delete-audience': {
      title: 'Are you sure you want to delete this audience?',
      success: 'Audience has been deleted successfully.',
      cancel: 'Audience Deletion Cancelled!',
      error: 'Failed to delete Audience. Please try again.',
      status: 'Audience Deleted!'
    },
    'delete-group': {
      title: 'Are you sure you want to delete this group?',
      success: 'Group has been deleted successfully.',
      cancel: 'Group Deletion Cancelled!',
      error: 'Failed to delete group. Please try again.',
      status: 'Group Deleted!'
    },
    'reject-quiz': {
      title: 'Are you sure you want to reject this quiz?',
      success: 'Quiz has been rejected successfully.',
      cancel: 'Quiz Rejection Cancelled!',
      error: 'Failed to reject quiz. Please try again.',
      status: 'Quiz Rejected!'
    },
    'move-quiz-to-pending': {
      title: 'Are you sure you want to move this quiz to pending?',
      success: 'Quiz has been moved to pending successfully.',
      cancel: 'Moving Quiz To Pending Cancelled!',
      error: 'Failed to move quiz to pending. Please try again.',
      status: 'Quiz Moved To Pending!'
    },
    // Add other types as needed
    default: {
      title: 'Are you sure?',
      success: 'Action completed successfully.',
      cancel: 'Action Cancelled!',
      error: 'Action failed. Please try again.',
      status: 'Action Completed!'
    }
  }

  const getMessage = (type, messageType) => {
    const messages = MESSAGE_CONFIG[type] || MESSAGE_CONFIG.default
    return messages[messageType]
  }

  return (
    <>
      {/* Main Confirmation Dialog */}
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)}>
        <DialogContent className='flex items-center flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-5'
            })}
          >
            <Typography variant='h5'>{getMessage(type, 'title')}</Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>You won&#39;t be able to revert this action!</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            component={'label'}
            style={{ color: 'white' }}
            onClick={() => handleConfirmation(true)}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color='inherit' />
            ) : type === 'suspend-account' ? (
              'Yes, Suspend!'
            ) : (
              'Yes'
            )}
          </Button>
          <Button
            variant='outlined'
            component={'button'}
            color='secondary'
            onClick={() => handleConfirmation(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Failure Dialog */}
      <Dialog open={secondDialog} onClose={handleSecondDialogClose}>
        <DialogContent className='flex items-center flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'>
          {loading ? (
            <CircularProgress size={88} className='mbe-8' />
          ) : (
            <i
              className={classnames('text-[88px] mbe-8', {
                'ri-checkbox-circle-line': operationSuccess,
                'text-success': operationSuccess,
                'ri-close-circle-line': operationError,
                'text-error': operationError
              })}
            />
          )}
          <Typography variant='h4' className='mbe-5'>
            {operationSuccess ? getMessage(type, 'status') : operationError ? 'Failed' : 'Cancelled'}
          </Typography>
          <Typography color='text.primary'>
            {operationSuccess
              ? getMessage(type, 'success')
              : operationError
                ? getMessage(type, 'error')
                : getMessage(type, 'cancel')}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            color={operationSuccess ? 'success' : 'error'}
            component={'label'}
            style={{ color: 'white' }}
            onClick={handleSecondDialogClose}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmationDialog
