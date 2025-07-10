import { Card, CardContent, Typography, Chip, Divider, Box, Stack, Button,Grid } from '@mui/material'
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

function AdminForwardPage({ game = null }) {
  const router = useRouter()

  if (!game) return (
    <Box display='flex' flexDirection='column' alignItems='center' bgcolor='#f5f5f5' px={2} py={4} gap={4}>
      <Card sx={{ maxWidth: 500, p: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            🎮 Game is Not Available
          </Typography>

          <Typography variant='body1' sx={{ mt: 2 }}>
            You can go back to the all games
          </Typography>
          <Typography variant='h6' color='primary' sx={{ mt: 1 }}></Typography>

          <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'>
            <Button
              component='label'
              size='small'
              variant='contained'
              onClick={() => router.push('/apps/games')}
              sx={{ color: 'white' }}
            >
              Back To All Games
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  ) 

  const showParticipatedUsers = game?.status === 'completed' || game?.status === 'live'

  const admininstructions = game?.status === 'lobby'

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
      </Grid>
    </>
  )
}

export default AdminForwardPage