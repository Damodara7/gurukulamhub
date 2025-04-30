import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useImportLocations } from './ImportContext';
import IconButtonTooltip from '@/components/IconButtonTooltip'

const ImportManager = ({ setImportLocations }) => {
  const importLocations = useImportLocations();
  const [showPopup, setShowPopup] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleAddLocation = () => {
    if (newLocation.trim() !== '') {
      setImportLocations(prevLocations => [...prevLocations, newLocation]);
      setNewLocation('');
    }
  };

  const handleDeleteLocation = (index) => {
    setImportLocations(prevLocations => prevLocations.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenPopup} sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        Manage Imports
      </Button>
      <Dialog open={showPopup} onClose={handleClosePopup}>
        <DialogTitle>Manage Import Directories</DialogTitle>
        <DialogContent>
          <TextField
            label="New Import Directory"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleAddLocation} startIcon={<AddIcon />} sx={{ mt: 2 }}>
            Add Location
          </Button>
          <List sx={{ mt: 2 }}>
            {importLocations.map((location, index) => (
              <ListItem key={location}>
                <ListItemText primary={location} />
                <ListItemSecondaryAction>
                  <IconButtonTooltip title='Delete' edge="end" onClick={() => handleDeleteLocation(index)}><DeleteIcon /></IconButtonTooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImportManager;
