import React, { useState } from 'react';
import { Box, IconButton, Typography, Collapse } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import IconButtonTooltip from '@/components/IconButtonTooltip'

const ChevronToggleComponent = ({minimizedSubHeading, heading,children}) => {
  const [isOpen, setIsOpen] = useState(false); // State to track if the component is open or closed

  // Toggle function
  const toggleComponent = () => {
    setIsOpen((prevOpen) => !prevOpen);
  };

  return (
    <Box sx={{ position: 'relative',  marginTop: 2,border: '0.5px solid #ccc', padding:1, borderRadius: 1 }}>
      <Box sx={{display:"flex", alignItems:"center"}}>
      {/* Chevron button at the top-left corner */}
      <IconButtonTooltip title={isOpen ? 'Close': 'Open'}
        onClick={toggleComponent}
        sx={{
          zIndex: 1,
          backgroundColor: 'blue',
          '&:hover': {
            backgroundColor: '#f0f0f0'
          },
        }}
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </IconButtonTooltip>
      <Typography variant="h6">{heading}</Typography>
      </Box>

      {/* Collapsible content */}
      <Collapse in={isOpen}>
        <Box sx={{ margin: 2 }}>
          {children}
        </Box>
      </Collapse>

      {/* Optional text if you want to show when closed */}
      {!isOpen && (
        <Typography sx={{ marginTop: 4, marginBottom: 2}} variant="body2">
         {minimizedSubHeading}
        </Typography>
      )}
    </Box>
  );
};

export default ChevronToggleComponent;
