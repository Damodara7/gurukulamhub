import React from 'react'
import { Typography, Box } from '@mui/material'

const ViewDetails = ({ game }) => {
  if (!game) {
    return (
      <Box p={4}>
        <Typography>Game not found</Typography>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Typography variant='h4'>{game.name}</Typography>
      <Typography mt={2}>
        <strong>Live Date:</strong> {game.liveDate}
      </Typography>
      <Typography mt={2}>
        <strong>Details:</strong> {game.details}
      </Typography>
    </Box>
  )
}

export default ViewDetails
