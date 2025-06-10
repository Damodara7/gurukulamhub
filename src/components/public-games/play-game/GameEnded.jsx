import { Box, Container, Typography, Button } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { TimerOff as TimerIcon } from '@mui/icons-material';
import Leaderboard from './Leaderboard'

const GameEnded = ({ onExit, game = null , isAdmin = false}) => {
  return (
    <Container maxWidth='lg' sx={{ py: 8, textAlign: 'center' }}>
        <Typography
        variant='h2'
        sx={{
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <EmojiEventsIcon color='primary' sx={{ fontSize: 60, mb: 3 }} /> {game.title}
      </Typography>
      <Typography variant='h3' color='error' gutterBottom sx={{ fontWeight: 700 }}>
        Game Ended!
      </Typography>
      {/* <TimerIcon 
        sx={{ 
          fontSize: 60,
          color: 'primary.main',
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: '50%'
        }} 
      /> */}

      {game && <Leaderboard game={game} isAdmin={isAdmin} />}

      <Typography variant='subtitle1' color='text.secondary' sx={{ my: 4 }}>
        Thank you for participating.
      </Typography>
      <Button variant='outlined' size='large' onClick={onExit} sx={{ px: 5 }}>
        Explore Available Games
      </Button>
    </Container>
  )
}

export default GameEnded
