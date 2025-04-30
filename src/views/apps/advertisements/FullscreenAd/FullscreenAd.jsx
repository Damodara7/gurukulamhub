// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'


const FullscreenAd = () => {
  // States
  const [open, setOpen] = useState(true)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <>
    {/* <Button variant='outlined' onClick={handleClickOpen}>
      Open dialog
    </Button> */}
    <Dialog className="animate__animated animate__backInDown " 
      sx={{ margin:"5vw",maxWidth:"90vw", backgroundColor:"red !important"}} fullScreen onClose={handleClose} 
       aria-labelledby='full-screen-dialog-title' open={open}>
      <DialogTitle className='' id='alert-dialog-title'>Use Nalanda LMS service?</DialogTitle>
      <DialogContent sx={{backgroundColor:"red"}} className=''>
        <DialogContentText id='alert-dialog-description'>
          Nalanda Learning services - Nalanda LMS will help you to get things done with your learning.
          open learning platform, where you can find mentors and community resources for knowledge
          hungry people.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant='outlined' color='secondary'>
          Not Interested        </Button>
        <Button onClick={handleClose} variant='contained'>
          Will Consider it
        </Button>
        <Button onClick={handleClose} variant='contained'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
};

export default FullscreenAd;
