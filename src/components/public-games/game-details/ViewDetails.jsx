'use client'

import React from 'react'
import { Typography, Box, Card, CardContent, Divider, Chip, Stack } from '@mui/material'

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
      <Card>
        <CardContent>
          <Typography variant='h4'>{game.title}</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography>
            <strong>Pin:</strong> {game.pin}
          </Typography>
          <Typography>
            <strong>Description:</strong> {game.description}
          </Typography>
          <Typography>
            <strong>Quiz ID:</strong> {game.quiz}
          </Typography>
          <Typography>
            <strong>Start Time:</strong> {new Date(game.startTime).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Duration:</strong> {game.duration} seconds
          </Typography>
          <Typography>
            <strong>Promotional Video:</strong> {game.promotionalVideoUrl}
          </Typography>
          <Typography>
            <strong>Thumbnail Poster:</strong> {game.thumbnailPoster}
          </Typography>
          <Typography>
            <strong>Require Registration:</strong> {game.requireRegistration ? 'Yes' : 'No'}
          </Typography>
          <Typography>
            <strong>Registration End Time:</strong> {new Date(game.registrationEndTime).toLocaleString()}
          </Typography>
          <Typography>
            <strong>Max Players:</strong> {game.maxPlayers}
          </Typography>

          <Typography mt={2}>
            <strong>Location:</strong>
          </Typography>
          <Typography>Country: {game.location?.country}</Typography>
          <Typography>Region: {game.location?.region}</Typography>
          <Typography>City: {game.location?.city}</Typography>

          <Typography mt={2}>
            <strong>Tags:</strong>
          </Typography>
          <Stack direction='row' spacing={1} mt={1}>
            {game.tags?.map(tag => (
              <Chip key={tag} label={tag} />
            ))}
          </Stack>

          <Typography mt={2}>
            <strong>Status:</strong> {game.status}
          </Typography>
          <Typography>
            <strong>Total Reward Value:</strong> {game.totalRewardValue}
          </Typography>
          <Typography>
            <strong>Winners Declared:</strong> {game.winnersDeclared ? 'Yes' : 'No'}
          </Typography>
          <Typography>
            <strong>Created By:</strong> {game.creatorEmail}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ViewDetails
