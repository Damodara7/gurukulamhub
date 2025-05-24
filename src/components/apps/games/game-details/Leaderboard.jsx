import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  People
} from '@mui/icons-material';

function Leaderboard({ participatedUsers = [] }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
          Leaderboard
        </Typography>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align='right'>Score</TableCell>
                <TableCell align='right'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participatedUsers.length > 0 ? (
                [...participatedUsers]
                  .sort((a, b) => b.score - a.score)
                  .map((user, index) => (
                    <TableRow key={user._id || index} hover>
                      <TableCell>
                        <Typography variant='subtitle1' color='text.secondary'>
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={user.email}>
                            {user.email[0].toUpperCase()}
                          </Avatar>
                          <Typography variant='body1'>{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {user.score}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {user.completed ? (
                          <Chip
                            icon={<CheckCircle fontSize='small' />}
                            label='Completed'
                            color='success'
                            size='small'
                            variant='outlined'
                          />
                        ) : (
                          <Chip
                            icon={<Cancel fontSize='small' />}
                            label='In Progress'
                            color='warning'
                            size='small'
                            variant='outlined'
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <People fontSize='large' color='disabled' />
                      <Typography variant='body1' color='text.secondary'>
                        No players have participated yet
                      </Typography>
                      <Typography variant='body2' color='text.disabled'>
                        Player results will appear here once the game starts.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default Leaderboard
