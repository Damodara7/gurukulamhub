import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenIcon from '@mui/icons-material/OpenInFull';

const MinimizableComponent = ({
  children,
  panelName = 'Panel', // Default name for the panel
  defaultMinimized = false, // Default minimized state
  autoMinimizeAfter = null, // Time in ms after which the panel auto minimizes (null to disable)
  containerStyles = {}, // Custom styles for the container
  buttonStyles = {} // Custom styles for the button
}) => {
  // Internal state for managing minimized state
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);

  // Auto-minimize effect
  useEffect(() => {
    if (autoMinimizeAfter !== null) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, autoMinimizeAfter);

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [autoMinimizeAfter]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <Box
      variant="outlined"
      sx={{
        transition: 'height 0.6s ease-in-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...containerStyles,
      }}
    >
      <Button
        // size="small"
        color="secondary"
        sx={{ ...buttonStyles }}
        onClick={toggleMinimized}
      >
        {isMinimized ? `Show` : `Hide`} {panelName} &nbsp;{' '}
        {isMinimized ? <OpenIcon /> : <CloseFullscreenIcon />}
      </Button>
      {!isMinimized && <Box>{children}</Box>}
    </Box>
  );
};

export default MinimizableComponent;
