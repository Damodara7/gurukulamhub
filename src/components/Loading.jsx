import { Box, CircularProgress } from '@mui/material'
import React from 'react'
import CenterBox from './CenterBox'

function Loading() {
  return (
    <CenterBox>
      <CircularProgress />
    </CenterBox>
  )
}

export default Loading
