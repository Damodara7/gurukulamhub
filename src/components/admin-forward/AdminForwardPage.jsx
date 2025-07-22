import { Card, CardContent, Typography, Chip, Divider, Box, Stack, Button, Grid } from '@mui/material'
import React, { useState } from 'react'
import AdminForwardHeader from './AdminForwardHeader'
import AdminForwardLocationInfo from './AdminForwardLocationinfo'
import { EmojiEvents } from '@mui/icons-material'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import AdminForwardRegisteredUsersCard from './AdminForwardRegisterUsersCard'
import AdminForwardQuizCard from './AdminForwardQuizCard'
import AdminForwardParticipatedUserCard from './AdminForwardParticipatedUserCard'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'
import AdminInstructions from './AdminInstructions'
import { useRouter } from 'next/navigation'
import FallBackCard from '../apps/games/FallBackCard'
import CancelIcon from '@mui/icons-material/Cancel'
function AdminForwardPage({ game = null }) {
  const router = useRouter()
  console.log('cancel reason ', game)
  if (!game)
    return <FallBackCard path='/management/games' content='You can go Back to All games' btnText='Back To All Games' />
  const showParticipatedUsers = game?.status === 'completed'
  const cancel = game?.status === 'cancelled'
  const admininstructions = game?.status === 'lobby'
  const livemode = game?.status === 'live'
  return (
    <>
      <AdminForwardHeader game={game} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* First Row - Info Cards */}
        <Grid item xs={12} container spacing={3}>
          <AdminForwardLocationInfo game={game} />

          <AdminForwardRegisteredUsersCard game={game} />

          <AdminForwardQuizCard game={game} />

          {showParticipatedUsers && <AdminForwardParticipatedUserCard game={game} />}
        </Grid>

        {/* Second Row - Leaderboard */}
        <Grid item xs={12}>
          {showParticipatedUsers && (
            <AdminLeaderboard
              game={game}
              sx={{
                width: '100%',
                '& .MuiCardContent-root': {
                  p: 0,
                  '& > :not(style)': { m: 2 } // Add margin to all direct children except style
                }
              }}
            />
          )}
        </Grid>

        {/* Third Row - Rewards (if any) */}
        {game.rewards.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant='h6'>
                    <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Rewards
                  </Typography>
                </Box>
                <RewardsList rewards={game?.rewards} />
              </CardContent>
            </Card>
          </Grid>
        )}
        {admininstructions && <AdminInstructions game={game} />}

        {cancel && (
          <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} gap={1}>
            <Card sx={{ maxWidth: 600, p: 1, textAlign: 'center' }}>
              <CardContent>
                <Typography
                  variant='h5'
                  gutterBottom
                  color='error'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}
                >
                  <CancelIcon color='error' sx={{ fontSize: 30 }} />
                  Game Cancellation Notice
                </Typography>
                <Typography
                  variant='h4'
                  sx={{
                    color: 'primary.main', // Use theme color or replace with a hex
                    fontWeight: 700, // Bold weight
                    letterSpacing: 1, // Slight spacing between letters
                    mb: 1, // Bottom margin
                    textTransform: 'capitalize' // Optional: Capitalizes each word
                  }}
                >
                  {game?.title}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  <Typography variant='h6' color='error' gutterBottom>
                    ⚠️ This game has been cancelled
                  </Typography>
                  <Typography variant='body1'>
                    {game?.cancellationReason || 'Please provide cancellation details for registered players'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {!livemode && (
          <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              component='label'
              variant='contained'
              onClick={() => router.push('/management/games')}
              sx={{ color: 'white' }}
            >
              Back To All Games
            </Button>
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default AdminForwardPage
