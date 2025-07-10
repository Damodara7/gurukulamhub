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
import FallBackCard from '../apps/games/FallBackCard'

function AdminForwardPage({ game = null }) {
  const router = useRouter()

  if (!game) return (
    <FallBackCard path='/apps/games' content='You can go Back to All games' btnText='Back To All Games' />
  ) 
  const showParticipatedUsers = game?.status === 'completed'

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

        {!livemode && (
          <Grid xs={12}  sx={{ display:'flex',  justifyContent:'center' ,  mt:2 }}>
          <Button
          component = 'label'
          variant='contained'
          onClick={()=> router.push('/apps/games')}
          sx={{ color:'white'}}
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