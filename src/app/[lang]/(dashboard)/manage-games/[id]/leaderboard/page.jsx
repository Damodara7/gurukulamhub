import GameLeaderboardPage from '@/views/apps/games/game-leaderboard'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, Alert, Typography } from '@mui/material'

async function getGameData(gameId) {
  try {
    const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${gameId}`)
    if (result?.status === 'success') {
      return result.result
    }
    console.error('Error Fetching game:', result.message)
    return null
  } catch (error) {
    console.error('Error fetching game:', error)
    return null
  }
}

export default async function page({ params }) {
  const { id } = params
  const [gameData] = await Promise.all([getGameData(id)])

  if (!gameData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        p: 3
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            maxWidth: '600px',
            '& .MuiAlert-message': {
              textAlign: 'center'
            }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Game Not Found
          </Typography>
          <Typography variant="body2">
            The game with ID {id} could not be found in our system.
          </Typography>
        </Alert>
      </Box>
    )
  }

  if (gameData.status !== 'live' && gameData.status !== 'completed') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        p: 3
      }}>
        <Alert 
          severity="info" 
          sx={{ 
            width: '100%', 
            maxWidth: '600px',
            '& .MuiAlert-message': {
              textAlign: 'center'
            }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Leaderboard Not Available
          </Typography>
          <Typography variant="body2">
            The leaderboard is only available for live or completed games. This game is currently in {gameData.status} status.
          </Typography>
        </Alert>
      </Box>
    )
  }

  return <GameLeaderboardPage gameId={id} game={gameData} isSuperUser={true} />
} 