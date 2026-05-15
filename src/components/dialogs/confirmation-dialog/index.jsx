'use client'

// React Imports
import { Fragment, useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

const ConfirmationDialog = ({ open, setOpen, type, onConfirm, affectedUserCount, roleName }) => {
  const theme = useTheme()
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [operationSuccess, setOperationSuccess] = useState(false)
  const [operationError, setOperationError] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOpen(false)
    // Do not reset operationSuccess/operationError here - otherwise during MUI Dialog exit
    // animation the second dialog re-renders with both false and briefly shows "Cancelled"
  }

  // Reset result state when the first dialog is opened again (so next use starts clean)
  useEffect(() => {
    if (open) {
      setOperationSuccess(false)
      setOperationError(false)
      setUserInput(false)
      setRejectionReason('')
    }
  }, [open])

  const handleConfirmation = async value => {
    setUserInput(value)
    setOpen(false)

    if (value) {
      // Perform async operation (like delete request)
      setLoading(true)
      try {
        if (type === 'reject-quiz') {
          await onConfirm({ rejectionReason: rejectionReason.trim() })
        } else {
          await onConfirm() // Pass the async operation prop
        }
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
    'delete-role-with-users': {
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
    'delete-account-type': {
      title: 'Are you sure you want to delete this account type?',
      success: 'Account type has been deleted successfully.',
      cancel: 'Account Type Deletion Cancelled!',
      error: 'Failed to delete account type. Please try again.',
      status: 'Account Type Deleted!'
    },
    'delete-advertisement': {
      title: 'Are you sure you want to delete this advertisement?',
      success: 'Advertisement has been deleted successfully.',
      cancel: 'Advertisement Deletion Cancelled!',
      error: 'Failed to delete advertisement. Please try again.',
      status: 'Advertisement Deleted!'
    },
    'delete-admin-notification': {
      title: 'Are you sure you want to delete this notification?',
      success: 'Notification has been deleted successfully.',
      cancel: 'Deletion cancelled.',
      error: 'Failed to delete notification. Please try again.',
      status: 'Notification Deleted!'
    },
    'delete-admin-announcement': {
      title: 'Are you sure you want to delete this announcement?',
      success: 'Announcement has been deleted for all recipients.',
      cancel: 'Deletion cancelled.',
      error: 'Failed to delete announcement. Please try again.',
      status: 'Announcement Deleted!'
    },
    'delete-all-notifications': {
      title: 'Delete ALL notifications for every user?',
      success: 'All notifications have been cleared from the system.',
      cancel: 'Bulk deletion cancelled.',
      error: 'Failed to clear notifications. Please try again.',
      status: 'Notifications Cleared!'
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
      <Dialog
        fullWidth
        maxWidth='xs'
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
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
            {type === 'reject-quiz' && (
              <TextField
                fullWidth
                multiline
                minRows={3}
                label='Rejection reason'
                placeholder='Enter reason for rejecting this quiz'
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
                sx={{ mt: 2, textAlign: 'left' }}
              />
            )}
            {(type === 'delete-role' || type === 'delete-role-with-users') && affectedUserCount > 0 && (
              <Typography color='warning.main' sx={{ mt: 2, fontWeight: 600 }}>
                ⚠️ Warning: This role is assigned to {affectedUserCount} user{affectedUserCount !== 1 ? 's' : ''}.
                {affectedUserCount > 0 && ' The role will be removed from all affected users.'}
              </Typography>
            )}
            {type === 'delete-admin-announcement' && affectedUserCount > 0 && (
              <Typography color='text.secondary' sx={{ mt: 2 }}>
                This will remove the announcement for {affectedUserCount} user{affectedUserCount !== 1 ? 's' : ''}.
              </Typography>
            )}
            {type === 'delete-all-notifications' && (
              <Typography color='error.main' sx={{ mt: 2, fontWeight: 600 }}>
                This permanently removes every notification for all users (game alerts, admin messages, reminders,
                etc.). This cannot be undone.
              </Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button
            variant='contained'
            component={'label'}
            style={{ color: 'white' }}
            onClick={() => handleConfirmation(true)}
            disabled={loading || (type === 'reject-quiz' && !rejectionReason.trim())}
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
        </DialogActions>
      </Dialog>

      {/* Success/Failure Dialog */}
      <Dialog
        open={secondDialog}
        onClose={handleSecondDialogClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
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
