import React from 'react'
import GameDetailsPage from '@/views/public-games/GameDetailsPage';
import { Box } from '@mui/material';
function page({ params }) {
  return <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <GameDetailsPage params={params} />
  </Box>
}

export default page
