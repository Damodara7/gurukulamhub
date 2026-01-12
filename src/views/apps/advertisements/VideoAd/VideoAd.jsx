import React, { useState } from 'react'
import { Box, Stack, useTheme, alpha } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import ReactPlayer from 'react-player'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const VideoAd = ({
  url,
  showPause = false,
  width = '100%', // Default width
  height = '60px', // Default height
  showMute = false,
  muted = true,
  autoPlay = true,
  row = true,
  loop = true,
  controls = false,
  onEnded = () => {} // Default empty callback
}) => {
  const theme = useTheme()
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)

  const handlePlayPause = () => setIsPlaying(prev => !prev)
  const handleMute = () => setIsMuted(prev => !prev)

  const handleOnVideoEnd = () => {
    setIsPlaying(false)
    setIsMuted(false) // Reset muted state on video end to prevent sound glitching
    onEnded() // Call provided callback on video end
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: row ? 'row' : 'column',
        gap: 2,
        width: '100%',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: width,
          height: height,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.8) : alpha(theme.palette.common.black, 0.9),
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.5)'
              : '0 4px 12px rgba(0,0,0,0.2)',
          border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(0,0,0,0.6)'
                : '0 8px 24px rgba(0,0,0,0.3)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <ReactPlayer
          playsinline
          width={width}
          height={height}
          url={url}
          playing={isPlaying}
          loop={loop}
          controls={controls}
          muted={isMuted}
          onError={e => console.error('Video error occurred:', e)}
          onEnded={handleOnVideoEnd}
          style={{
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </Box>
      {!controls && (showMute || showPause) && (
        <Stack
          direction={row ? 'row' : 'column'}
          spacing={1}
          sx={{
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {showMute && (
            <IconButtonTooltip
              title={isMuted ? 'Unmute' : 'Mute'}
              onClick={handleMute}
              color={isMuted ? 'default' : 'primary'}
              aria-label='Mute/Unmute'
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: isMuted
                    ? alpha(theme.palette.grey[500], 0.1)
                    : alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isMuted
                      ? alpha(theme.palette.grey[500], 0.2)
                      : alpha(theme.palette.primary.main, 0.2),
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {isMuted ? (
                  <VolumeOffIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                ) : (
                  <VolumeUpIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                )}
              </Box>
            </IconButtonTooltip>
          )}
          {showPause && (
            <IconButtonTooltip
              title={isPlaying ? 'Pause' : 'Play'}
              onClick={handlePlayPause}
              color={isPlaying ? 'primary' : 'default'}
              aria-label='Play/Pause'
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: isPlaying
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isPlaying
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.success.main, 0.2),
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {isPlaying ? (
                  <PauseIcon
                    sx={{
                      fontSize: 20,
                      color: theme.palette.primary.main
                    }}
                  />
                ) : (
                  <PlayArrowIcon
                    sx={{
                      fontSize: 20,
                      color: theme.palette.success.main
                    }}
                  />
                )}
              </Box>
            </IconButtonTooltip>
          )}
        </Stack>
      )}
    </Box>
  )
}

export default VideoAd
