'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

const AdminGameStatus = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchRunningGames = async () => {
      try {
        const response = await axios.get('/api/games/running'); // Adjust path as needed
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching running games:', error);
      }
    };

    fetchRunningGames();
    const interval = setInterval(fetchRunningGames, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Game Pin</TableCell>
            <TableCell>Game ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Players</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {games.map(game => (
            <TableRow key={game.gamePin}>
              <TableCell>{game.gamePin}</TableCell>
              <TableCell>{game.gameId}</TableCell>
              <TableCell>{game.gameStatus}</TableCell>
              <TableCell>{new Date(game.startDate).toLocaleString()}</TableCell>
              <TableCell>{game.players?.length || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AdminGameStatus;
