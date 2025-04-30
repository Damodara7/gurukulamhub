import { Box } from '@mui/material'
import React from 'react'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import MediaPopup from './MediaPopup'

function MediaPreviewPopup({
  url = '',
  mediaType = 'image',
  height = '60px',
  width = '100%',
  row = true,
  controls = false,
  showMute = true,
  showPause = true,
  showPopup = true
}) {
  return (
    <Box className='flex w-full flex-col gap-1 items-start'>
      <Box className='flex w-full flex-col gap-1 items-center'>
        <VideoAd
          height={height}
          controls={controls}
          width={width}
          url={url}
          showMute={showMute}
          showPause={showPause}
          autoPlay={false}
          row={row}
        />
        {showPopup && <MediaPopup url={url} mediaType={mediaType} controls={controls} />}
      </Box>
    </Box>
  )
}

export default MediaPreviewPopup
