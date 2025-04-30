import React, { useEffect, useState } from 'react';
import { Box, Typography, Modal, Card } from '@mui/material';

const CountdownPopup = ({ onCountdownEnd, startCountdown }) => {
  const [countdown, setCountdown] = useState(10);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (startCountdown) {
      setCountdown(10);  // Reset countdown
      setOpen(true);

    }
  }, [startCountdown]);

  useEffect(() => {
    // Handle the countdown timer
    let timer;
    if (open && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      // Close the modal and trigger the end function when countdown reaches 0
      setOpen(false);
      onCountdownEnd();
    }

    return () => clearTimeout(timer);  // Cleanup timer
  }, [countdown, open, onCountdownEnd]);


  return (
    <Modal open={open}>
      <Box
        sx={{
          position: 'fixed',
          top: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          p: 2,
zIndex:100,
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center',
          borderRadius: '4px',
        }}
      >
        <Typography variant="h5">Game Launches In: {countdown}s</Typography>
      </Box>
    </Modal>
  );
};

export default CountdownPopup;
