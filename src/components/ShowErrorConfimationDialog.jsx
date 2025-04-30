'use client'
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

// Utility function to show a Material-UI Dialog with error message and prompt to proceed
 const ShowErrorConfirmationDialog = (errorMessage,
  nextPage, onConfirm, router , open ,setOpen) => {
  // State to control dialog visibility
  //const [open, setOpen] = useState(false);

  // Function to handle dialog close and navigation
  const handleClose = (confirmed) => {
    setOpen(false);
    if (confirmed) {
      // Navigate to the next page if confirmed
      onConfirm && onConfirm(nextPage,router);
    }
  };

  return (
    <Dialog open={open} onClose={() => handleClose(false)}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <div>{errorMessage}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} color="primary">
          Proceed to Next Page
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ShowErrorConfirmationDialog;
