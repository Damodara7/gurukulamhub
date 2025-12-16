import React from 'react'
import MyGroupPage from '@/views/apps/mygroups/MyGroupPage'
import { Box } from '@mui/material'
function page(){
  return(
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <MyGroupPage/>
    </Box>
  )
}
export default page