import React from 'react';
import {
  Card,
  Box,
  Avatar,
  Typography,
  Chip
} from '@mui/material';
import {
  Schedule,
  People
} from '@mui/icons-material';
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

const statusColors = {
  created: 'default',
  reg_open: 'success',
  reg_closed: 'warning',
  lobby: 'info',
  live: 'error',
  completed: 'primary',
  cancelled: 'error'
}

function GameHeader({game}) {
  return (
    <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', p: 3 }}>
          <Avatar
            variant='rounded'
            component='image'
            src={game?.thumbnailPoster || imagePlaceholder?.src}
            sx={{
              width: 150,
              height: 150,
              mr: 3,
              borderRadius: 2
            }}
            onError={e => (e.target.src = imagePlaceholder?.src)}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 2
              }}
            >
              <Typography variant='h4' component='h1'>
                {game.title}
              </Typography>
              <Chip label={game.status.toUpperCase()} color={statusColors[game.status]} variant='outlined' size='medium' />
            </Box>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
              {game.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                icon={<Schedule />}
                label={`Start Time: ${new Date(game.startTime).toLocaleString()}`}
                variant='outlined'
              />
              <Chip
                icon={<People />}
                label={`Players: ${game.participatedUsers.length}/${game.maxPlayers}`}
                variant='outlined'
              />
            </Box>
          </Box>
        </Box>
      </Card>
  )
}

export default GameHeader