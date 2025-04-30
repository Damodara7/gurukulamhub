import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const GameStatusTable = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Fetch the game status from the backend
    const fetchGameStatus = async () => {
      const response = await axios.get('/api/gamestatus'); // Your API endpoint
      setGames(response.data);
    };
    fetchGameStatus();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Game Status
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game Title</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Players Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map(game => (
              <TableRow key={game.pin}>
                <TableCell>{game.title}</TableCell>
                <TableCell>{new Date(game.startDateTime).toLocaleString()}</TableCell>
                <TableCell>{game.status}</TableCell>
                <TableCell>
                  {game.players?.length ? game.players.join(', ') : 'No players yet'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default GameStatusTable;
