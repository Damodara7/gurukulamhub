'use client'
import React, { useState, useEffect } from 'react';
import { Tooltip, Icon, Button, Chip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import io from 'socket.io-client';
import { styled, keyframes } from '@mui/material';

const SOCKET_URL = 'http://localhost:4000'; // Replace with your WebSocket server URL
let socket;

const StatusIndicator = ({ gameData, isJoined }) => {
  const [networkStatus, setNetworkStatus] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const gameStatus = gameData?.currentStatus;

  // Define a keyframes animation for the blinking effect
  const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
  `;

  // Styled component with the blinking animation
  const BlinkingIcon = styled('div')({
    animation: `${blinkAnimation} 1s infinite`,
  });

  const spinnerAnimation = keyframes`
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg)}
  `
  const SpinnerIcon = styled('div')({
    animation: `${spinnerAnimation} 1s infinite`
  })


  const BlinkingIcon2 = styled('div')({
    animation: `fadeIn 5s infinite`,
  });

  useEffect(() => {
    // Check if running in the browser environment
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {


      // Function to update network status on change
      const updateNetworkStatus = () => {
        try {
          setNetworkStatus(navigator.onLine);
        } catch (e) { }
      };

      // Set the initial network status
      updateNetworkStatus();

      // Add event listeners for online and offline events
      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);

      // Clean up event listeners on component unmount
      return () => {
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
      };
    }
  }, []);

  useEffect(() => {
    // Create WebSocket connection
      socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_SERVER,
      {
        query: {connectionId: "StatusIndicator"}
      }
    );

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('StatusIndicator:Connected to server',socket.id);
      console.log('Socket Rooms',socket.rooms)
    })

    socket.on('disconnect', () => {
      console.log('StatusIndicator:Disconnected from server');
      setSocketConnected(false); // Update the connection status

    });
    socket.on('connect_error', (error) => {
      console.error('StatusIndicator: Connection error:', error);
      setSocketConnected(false); // Update the connection status
    });

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const getGameStatusIcon = () => {
    const iconStyle = { animation: `${blinkAnimation} 1s infinite` };

    switch (gameStatus) {
      case 'running':
        return <PlayArrowIcon style={{ color: 'green', ...iconStyle }} />;
      case 'pending':
        return <PendingIcon style={{ color: 'yellow', ...iconStyle }} />;
      case 'paused':
        return <PauseIcon style={{ color: 'orange', ...iconStyle }} />;
      case 'stopped':
        return <StopIcon style={{ color: 'red', ...iconStyle }} />;
      default:
        return <FiberManualRecordIcon style={{ color: 'gray' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", alignContent: "center", gap: '16px' }}>
      {/* Network Status */}
      <Tooltip title={networkStatus ? 'Online' : 'Offline'}>
        {networkStatus ? (
          <WifiIcon style={{ color: 'green' }} />
        ) : (
          <WifiOffIcon style={{ color: 'red' }} />
        )}
      </Tooltip>

      {/* Socket Connection Status */}
      <Tooltip title={socketConnected ? 'Socket Connected' : 'Socket Disconnected'}>
        <Icon>
          <BlinkingIcon>
            <FiberManualRecordIcon style={{ color: socketConnected && isJoined ? 'green' : socketConnected && !isJoined ? 'yellow' : 'red' }} />
          </BlinkingIcon>
        </Icon>
      </Tooltip>
      <Chip icon={getGameStatusIcon()} sx={{backgroundColor:"white"}} label={gameStatus?.toUpperCase()} variant="outlined" />
        {/* Game Status */}

        <></>
    </div>
  );
};

export default StatusIndicator;
