import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

function GameStatistics({game}) {
  return (
    <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Game Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.registeredUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Registered Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.participatedUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Participants
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.duration / 60}min</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Duration
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.rewards.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Reward Tiers
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
  )
}

export default GameStatistics