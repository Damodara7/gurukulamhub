/********** Standard imports.*********************/
import React, {  useState } from 'react'
/********************************************/

import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import MuteIcon from '@mui/icons-material/VolumeMute'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import ReactPlayer from 'react-player'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const VideoPlayer = ({
  onVideoProgress,
  url,
  showPause = false,
  width,
  height = '60px',
  showMute = false,
  muted = false,
  autoPlay = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  const handleMute = () => {
    setIsMuted(prev => !prev)
  }

  return (
    <div
      className='video-ad'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: 'row',
        minWidth: { width },
        height: { height }
      }}
    >
      {showPause ? (
        <IconButtonTooltip title={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause} color='info'>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButtonTooltip>
      ) : (
        <></>
      )}
      <ReactPlayer
        playsinline={isPlaying}
        width={' '}
        height={height}
        maxWidth={width}
        url={url}
        playing={isPlaying}
        loop={true}
        controls={false}
        muted={isMuted}
        onProgress={onVideoProgress}
        onError={() => console.error('Video error occurred')}
      />
      {showMute ? (
        <IconButtonTooltip title={isMuted? 'Volume On' : 'Volume Off'} onClick={handleMute} color='info'>
          {isMuted ? <VolumeOffIcon /> : <MuteIcon />}
        </IconButtonTooltip>
      ) : (
        <></>
      )}
    </div>
  )
}

export default VideoPlayer
