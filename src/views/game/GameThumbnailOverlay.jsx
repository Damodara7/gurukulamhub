import React from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VideoPlayer from '@/components/media-viewer/VideoPlayer';

function GameThumbnailOverlay({ thumbnailUrl, promoVideoUrl, slogan, onClose }) {
  return (
    <Box
      onClick={onClose} // Close overlay on click
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white', // Dark background overlay
        zIndex: 1000, // Ensure it's on top of other content
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container sx={{ minHeight: '90vh',
       display: 'flex', 
       backgroundColor: "black",
       border:"8px dashed white",
       borderRadius:"20",
       marginTop:10,
       justifyContent: "space-around",
        flexDirection: 'column' }}>
        
         {/* Video or other component at the bottom */}
         <Box sx={{ marginBottom: '2rem', textAlign: 'center' }}>
          {/* <Typography variant="h6">Watch the Promo Video Below:</Typography> */}
          <VideoPlayer
            url={promoVideoUrl} // Replace with your video URL
            controls
            height=''
            style={{
              width: '100%',
              height: "100%",
              minWidth: '80vw',
              maxWidth: '800px', // Adjust based on your preference
            }}
          />
        </Box>
        {/* Centered Thumbnail/Poster */}
        <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <img
            src={thumbnailUrl} // Replace with the actual image path
            alt="Thumbnail"
            style={{
              maxWidth: '100%',
              maxHeight: '70vh', // Adjust based on how large you want the image to be
              objectFit: 'contain',
            }}
          />
        </Box>

       
      </Container>

      {/* Slogan Text */}
      <Typography
        variant="h4"
        sx={{
          color: '#fff',
          position: 'absolute',
          top: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        {slogan}
      </Typography>


    </Box>
  );
}

export default GameThumbnailOverlay;
