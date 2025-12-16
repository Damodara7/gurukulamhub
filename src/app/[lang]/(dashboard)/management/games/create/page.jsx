import React from 'react'
import CreateGamePage from '@/views/apps/games/create-game';
import { Box } from '@mui/material';

function page({ params,searchParams }) {

  return (
    <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Box sx={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <CreateGamePage />
      </Box>
    </Box>
  )
}

export default page
