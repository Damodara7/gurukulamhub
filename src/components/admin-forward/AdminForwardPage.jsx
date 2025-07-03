import { Card, CardContent, Typography, Chip, Divider, Box, Stack, Grid } from '@mui/material'
import React from 'react'
import AdminForwardHeader from './AdminForwardHeader'
import AdminForwardLocationInfo from './AdminForwardLocationinfo'
import { EmojiEvents } from '@mui/icons-material'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import AdminForwardRegisteredUsersCard from './AdminForwardRegisterUsersCard'
import AdminForwardQuizCard from './AdminForwardQuizCard'
import AdminForwardParticipatedUserCard from './AdminForwardParticipatedUserCard'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'

function AdminForwardPage({ game = null }) {
  if (!game) return <Typography variant='body1'>No game data available</Typography>

  const showParticipatedUsers = game?.status === 'completed' || game?.status === 'live'

  return (
    <>
      <AdminForwardHeader game={game} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* First Row - Info Cards */}
        <Grid item xs={12} container spacing={3}>
          
            <AdminForwardLocationInfo game={game} />
          
            <AdminForwardRegisteredUsersCard game={game} />
          
            <AdminForwardQuizCard game={game} />
          
          {showParticipatedUsers && <AdminForwardParticipatedUserCard game={game} /> }
        </Grid>

        {/* Second Row - Leaderboard */}
        <Grid item xs={12}>
          {showParticipatedUsers && <AdminLeaderboard
            game={game}
            sx={{
              width: '100%',
              '& .MuiCardContent-root': {
                p: 0,
                '& > :not(style)': { m: 2 } // Add margin to all direct children except style
              }
            }}
          />}
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
      </Grid>
    </>
  )
}

export default AdminForwardPage