import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box } from '@mui/material';
//import { io } from 'socket.io-client';

// Connect to WebSocket server
//const socket = io('http://localhost:5000'); // Change to your server URL

const Leaderboard = ({pLeaderboard}) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [animationQueue, setAnimationQueue] = useState([]);
//console.log(pLeaderboard,"----> leaderboard data.....------<")
  // Function to update the leaderboard with animation effects
  const updateLeaderboardWithAnimation = (newLeaderboard) => {
    // Compare the current leaderboard with the new one
    const updatedLeaderboard = newLeaderboard.map((player, index) => {
      const previousScore = leaderboard[index]?.score || 0;
      const scoreChange = player.score - previousScore;

      return {
        ...player,
        change: scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'none', // 'up' or 'down' for animations
      };
    });

    // Apply the animation to the leaderboard items
    setLeaderboard([...newLeaderboard]);
    setAnimationQueue(updatedLeaderboard);
  };

  useEffect(() => {
    console.log("LLLLLLLLLLLLLLLLLLLLLeaderboard updateddddddddddddddd")

    updateLeaderboardWithAnimation(pLeaderboard)
    // Cleanup on component unmount

  }, [pLeaderboard]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Top 10 Leaderboard
        </Typography>
      </Box>

      <List>
        {leaderboard.map((player, index) => {
          const animationClass = animationQueue[index]?.change;
         // console.log("Player is",player)
          return (
            <ListItem
              key={player.playerId}
              sx={{
                backgroundColor:
                  animationClass === 'up' ? '#d4edda' : animationClass === 'down' ? '#f8d7da' : 'transparent',
                transition: 'all 1s ease-in-out',
                transform: animationClass === 'up' ? 'translateY(-10px)' : animationClass === 'down' ? 'translateY(10px)' : 'none',
                padding: '10px',
              }}
            >
              <ListItemAvatar>
                <Avatar>{player.playerId.charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${player.playerId}`} secondary={`Score: ${player.score}`} />
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
};

export default Leaderboard;
