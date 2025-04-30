import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const PlayerListMarquee = ({ players }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: 1,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <marquee behavior="scroll" direction="left" scrollamount="5">
        {players.length > 0 ? (
          players.map((player) => (
            <Box key={player.playerId} sx={{ display: 'flex', alignItems: 'center', margin: '0 20px' }}>
              <Avatar src={player.avatarUrl} alt={player.playerId} sx={{ marginRight: 1 }} />
              <Typography sx={{color:"white"}} variant="body1">{player.playerId}({player.score})</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body1">No players available</Typography>
        )}
      </marquee>
    </Box>
  );
};

export default PlayerListMarquee;
