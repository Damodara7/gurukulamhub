import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { Box, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const FullscreenComponent = forwardRef(({ children }, ref) => {
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = () => {
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen()
    } else if (containerRef.current.mozRequestFullScreen) {
      /* Firefox */
      containerRef.current.mozRequestFullScreen()
    } else if (containerRef.current.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      containerRef.current.webkitRequestFullscreen()
    } else if (containerRef.current.msRequestFullscreen) {
      /* IE/Edge */
      containerRef.current.msRequestFullscreen()
    }
    if (isFullscreen) {
      setIsFullscreen(false)
      exitFullscreen()
      return
    }
    setIsFullscreen(true)
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari & Opera */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen()
    }
    setIsFullscreen(false)
  }

  // Expose the fullscreen methods to parent or child components via ref
  useImperativeHandle(ref, () => ({
    enterFullscreen,
    exitFullscreen
  }))

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        position: 'relative'
      }}
    >
      {isFullscreen && (
        <IconButtonTooltip
        title={"ExitFullScreen"}
          onClick={exitFullscreen}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
          }}
        >
          <CloseIcon />
        </IconButtonTooltip>
      )}

      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {children}
      </Box>
    </Box>
  )
})

export default FullscreenComponent
