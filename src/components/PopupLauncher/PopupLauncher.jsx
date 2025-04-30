import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import VerifyEmailV1 from '@views/pages/auth/VerifyEmailV1'
const FormComponents = [
  {
    name: 'Form1', component: () => (
      <div>
        {/* Form 1 components */}
        <p>This is Form 1 content.</p>
      </div>
    )
  },

  { name: 'VerifyEmailV1', component: VerifyEmailV1 },
];


const PopupLauncher = ({ lookupForms }) => {
  const [open, setOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const handleClickOpen = (formName) => {
    setSelectedForm(formName);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const renderForm = () => {
    const form = lookupForms.find(form => form.name === selectedForm);
    if (!form) return null;
    const FormComponent = form.component;
    // Define shared methods to pass as props
    const sharedMethods = {
      // Define your shared methods here
      someMethod: () => {
        console.log('This is a shared method');
      }
    };
    // Render the form component with shared methods as props
    return <FormComponent {...sharedMethods} />;
  };

  if (!lookupForms) lookupForms = FormComponents;

  return (
    <div>
      <h2>Popup Launcher</h2>
      {lookupForms?.map((form, index) => (
        <Button key={index} variant="contained" onClick={() => handleClickOpen(form.name)}>
          Open {form.name} Form
        </Button>
      ))}
      <Dialog open={open} onClose={handleClose}>
        {/* <DialogTitle>{selectedForm} Form</DialogTitle> */}
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PopupLauncher;
