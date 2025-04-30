import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import OpenIcon from '@mui/icons-material/OpenInFull'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import MinimizeIcon from '@mui/icons-material/Minimize'
import MaximizeIcon from '@mui/icons-material/Maximize'
const MinimizableComponent = ({
  children,
  maximizePanelName = 'Panel',
  isMinimizedBool = false,
  setIsMinimizedBool,
  containerStyles = {},
  buttonStyles = {}
}) => {
  console.log('isMinimizedBool', isMinimizedBool)
  // const [isMinimized, setIsMinimized] = useState(isMinimizedBool)

  useEffect(() => {
    const timer = setTimeout(() => {
      // setIsMinimized(true)
      setIsMinimizedBool(true)
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  const handleMaximize = bool => {
    // setIsMinimized(val)
    setIsMinimizedBool(!bool)
  }

  return (
    <Box
      variant='outlined'
      sx={{
        transition: 'height 1.6s ease-in-out',
        // height: isMinimizedBool ? 40 : 'auto',
        // height: isMinimized ? 40 : 'auto',
        overflow: 'hidden',
        ...containerStyles
      }}
    >
      <Button size='small' color='secondary' sx={{ ...buttonStyles }} onClick={() => handleMaximize(!!isMinimizedBool)}>
        {`${isMinimizedBool ? 'Show' : 'Hide'}`} {maximizePanelName} &nbsp;{' '}
        {isMinimizedBool ? <OpenIcon /> : <CloseFullscreenIcon />}
      </Button>
      {!isMinimizedBool && <>{children}</>}
    </Box>
  )
}

export default MinimizableComponent
