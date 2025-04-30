import React from 'react'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'

const DeleteConfirmationDialog = ({
  open,
  handleClose,
  handleConfirm,
  title,
  description,
  confirmText = 'Proceed',
  closeText = 'Cancel'
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          {closeText}
        </Button>
        <Button onClick={handleConfirm} color='error' autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmationDialog
