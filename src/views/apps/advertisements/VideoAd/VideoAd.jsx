import React, { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import MuteIcon from '@mui/icons-material/VolumeMute'
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
    <div
      className='video-ad'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: row ? 'row' : 'column',
        minWidth: width,
        minHeight: height,
        gap: '8px' // Add spacing between buttons and video
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
      />
      {!controls && (
        <div className='flex items-center'>
          {showMute && (
            <IconButtonTooltip title={isMuted ? 'Volume On' : 'Volume Off'} onClick={handleMute} color='info' aria-label='Mute/Unmute'>
              {isMuted ? <VolumeOffIcon /> : <MuteIcon />}
            </IconButtonTooltip>
          )}
          {showPause && (
            <IconButtonTooltip title={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause} color='info' aria-label='Play/Pause'>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButtonTooltip>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoAd
