import React from 'react';
import {
  Grid,
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
  People,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

function ParticipatedPlayersTable({participatedUsers}) {
  return (
    <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Participated Players ({participatedUsers.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Player</TableCell>
                      <TableCell align='right'>Joined At</TableCell>
                      <TableCell align='right'>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participatedUsers.length > 0 ? (
                      participatedUsers.map(user => (
                        <TableRow key={user._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 32, height: 32 }} alt={user.email}>
                                {user.email[0].toUpperCase()}
                              </Avatar>
                              <Typography variant='body1'>{user.email}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2'>{new Date(user.joinedAt).toLocaleString()}</Typography>
                          </TableCell>
                          <TableCell align='right'>
                            {user.completed ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Chip
                                  icon={<CheckCircle fontSize='small' />}
                                  label='Completed'
                                  color='success'
                                  size='small'
                                  variant='outlined'
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {new Date(user.finishedAt).toLocaleString()}
                                </Typography>
                              </Box>
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
                        <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
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
                              No participants yet
                            </Typography>
                            <Typography variant='caption' color='text.disabled'>
                              Player activity will appear here once they join the game
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
        </Grid>
  )
}

export default ParticipatedPlayersTable