import React, { useState } from 'react';

import { Button, Dialog, Select, MenuItem, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { useImportLocations, ImportProvider } from './ImportContext';
import ImportManager from './ImportManager';
import ToolBar from '../quizbuilder/02_QuestionBuilder/QuestionTemplatesToolBar';
import SingleChoiceRadio from '../quizbuilder/03_QuestionTemplates/TrueFalseRadio'
import RunLogics from './RunLogics';

const LogicComponentClone = ({ availableComponents, setParentState }) => {
  const importLocations = useImportLocations();
  const [showPopup, setShowPopup] = useState(false);
  const [elementName, setElementName] = useState('ToolBar');
  const [elementOrder, setElementOrder] = useState(0);
  const [elementPurpose, setElementPurpose] = useState(0);
  const [selectedElement, setSelectedElement] = useState('');

  const [foundComponents, setFoundComponents] = useState([]);

  const handleClone = () => {
    setShowPopup(true);
  };

  const handlePopupSubmit = async () => {
    if (availableComponents && availableComponents.hasOwnProperty(elementName)) {
      // If the component is available in the provided list, use it directly
      handleComponentSelect(availableComponents[selectedElement]);
    } else {
      // Search for components in import locations
      const found = [];

      for (const location of importLocations) {
        console.log("Current Search Location is:" + location)

        try {
          const { default: Component } = await import(`${location}/${elementName}`);

          found.push({ location, component: Component });
        } catch (error) {
          // Component not found in this location
          console.log(error)
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

    setParentState(newDynamicComponent);
    console.log("Setting the state of parentt with new component", newDynamicComponent)

    // Call the callback function provided by the parent to update the parent's state
    //   setParentState(previousState => ({
    //     dynamicComponents: [...(previousState?.dynamicComponents || []), newDynamicComponent]
    //   }));
    setShowPopup(false);
  };

  return (
    <div className='flex gap-4'>
      <Select value={selectedElement} onChange={(e) => {
        setSelectedElement(e.target.value);
        setElementName(e.target.value);
      }} displayEmpty>
        <MenuItem value="" disabled>Select an Element</MenuItem>
        {Object.keys(availableComponents).map((element, index) => (
          <MenuItem key={index} value={element}>{element}</MenuItem>
        ))}
      </Select>
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
          <TextField
            autoFocus
            margin="dense"
            id="elementOrder"
            label="Element Order"
            type="number"
            value={elementOrder}
            onChange={(e) => setElementOrder(e.target.value)}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="elementOrder"
            label="Element Purpose"
            type="text"
            value={elementPurpose}
            onChange={(e) => setElementPurpose(e.target.value)}
            fullWidth
          />
          <Button onClick={handlePopupSubmit} variant="contained" color="primary" sx={{ mt: 2 }}>
            Add / Search Components
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

const LogicComponentWithImportManager = ({ setParentState }) => {

  // Define available components with their paths
  var availableElements = {
    ToolBar: <ToolBar />,
    SingleChoiceRadio: <SingleChoiceRadio />,
    RunLogic: <RunLogics />,
    Component2: './components/Component2',

    // Add more components as needed
  };

  return (

    <ImportProvider>
      <div>
        {/* Pass availableElements to LogicComponentClone */}
        <LogicComponentClone availableComponents={availableElements} setParentState={setParentState} />
        <ImportManager />
      </div>
    </ImportProvider>
  );
}

export default LogicComponentWithImportManager;
