
import { Box, Typography } from "@mui/material";
import MediaViewerPopup from "./MediaViewerPopup"
import VideoPlayer from "./VideoPlayer"

const MediaViewer = ({ mediaUrl, mediaType, showUrl }) => {

  return (
    <Box sx={{ border: '1px solid gray', padding: 1, marginTop: 1 }}>
      <div className='flex flex-col items-center gap-2'>
        {showUrl ?
          <Typography className='capitalize' color='text.primary'>
            {mediaUrl}
          </Typography>
          : ''
        }

        {mediaType === 'video' && (
          <>
            <VideoPlayer url={mediaUrl} showPause autoPlay={false}></VideoPlayer>
            <MediaViewerPopup imageUrl={mediaUrl} mediaType={mediaType} />
          </>
        )}
        {mediaType === 'image' && (
          <MediaViewerPopup imageUrl={mediaUrl} mediaType={mediaType} />
        )}
        {mediaType === 'none' && (
          <p>Please set the Media url & Media Type</p>
        )}
      </div>
    </Box>
  )
}

export default MediaViewer


