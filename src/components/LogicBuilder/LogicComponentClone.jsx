import React, { useState } from 'react';
import { useImportLocations } from './ImportContext';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';

const LogicComponentClone = ({ availableComponents, setParentState }) => {
  const importLocations = useImportLocations();
  const [showPopup, setShowPopup] = useState(false);
  const [elementName, setElementName] = useState('');
  const [foundComponents, setFoundComponents] = useState([]);

  const handleClone = () => {
    setShowPopup(true);
  };

  const handlePopupSubmit = async () => {
    if (availableComponents.hasOwnProperty(elementName)) {
      // If the component is available in the provided list, use it directly
      handleComponentSelect(availableComponents[elementName]);
    } else {
      // Search for components in import locations
      const found = [];
      for (const location of importLocations) {
        try {
          const { default: Component } = await import(`${location}/${elementName}`);
          found.push({ location, component: Component });
        } catch (error) {
          // Component not found in this location
        }
      }
      // Update state with found components
      setFoundComponents(found);
      setShowPopup(true);
    }
  };

  const handleComponentSelect = (component) => {
    // Create the dynamic component with metadata
    const newDynamicComponent = {
      name: elementName,
      order: elementOrder,
      purpose: elementPurpose,
      component: component
    };
    // Call the callback function provided by the parent to update the parent's state
    setParentState(previousState => ({
      dynamicComponents: [...previousState.dynamicComponents, newDynamicComponent]
    }));
    setShowPopup(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleClone}>Clone Element</Button>
      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>Clone Element</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="elementName"
            label="Element Name"
            type="text"
            value={elementName}
            onChange={(e) => setElementName(e.target.value)}
            fullWidth
          />
          <Button onClick={handlePopupSubmit} variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Search Components
          </Button>
          <List>
            {foundComponents.map(({ location, component }) => (
              <ListItem key={location} button onClick={() => handleComponentSelect(component)}>
                <ListItemText primary={location} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LogicComponentClone;
