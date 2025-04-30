import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, Button } from '@mui/material';

 const GameLaunchCountdown = ({ onCountdownComplete,startCountdown }) => {
  const [countdown, setCountdown] = useState(10);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Countdown timer effect
    let timer;
    if (open && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Close modal and trigger end callback
      setOpen(false);
      onCountdownComplete();
    }

    return () => clearInterval(timer);  // Cleanup interval on component unmount or countdown end
  }, [open, countdown]);



  useEffect(() => {
    if (startCountdown) {
      setCountdown(10);  // Reset countdown
      setOpen(true);      // Open modal when countdown starts
    }
  }, [startCountdown]);


  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h5" gutterBottom>
          Game starting in...
        </Typography>
        <Typography variant="h1" color="primary" style={{ margin: '1rem 0' }}>
          {countdown}
        </Typography>
        <Typography variant="body1">
          Get ready! The game will launch soon.
        </Typography>
        <Button onClick={() => setOpen(false)} color="secondary">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}


export default GameLaunchCountdown;
