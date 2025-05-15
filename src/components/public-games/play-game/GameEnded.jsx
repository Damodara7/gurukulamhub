import { Box, Container, Typography, Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const GameEnded = ({ onExit }) => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <EmojiEventsIcon
        color="primary"
        sx={{ fontSize: 100, mb: 3 }}
      />
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Game Ended
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Thank you for participating.
      </Typography>
      <Button variant="outlined" size="large" onClick={onExit} sx={{ px: 5 }}>
        Explore Available Games
      </Button>
    </Container>
  );
};

export default GameEnded;
