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
  HowToReg,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

function RegisteredPlayersTable({registeredUsers, participatedUsers, game}) {
  return (
    <Grid item xs={12} lg={6}>
          <Card style={{height: '100%'}}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <HowToReg sx={{ mr: 1, verticalAlign: 'middle' }} />
                Registered Players ({registeredUsers.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Player</TableCell>
                      <TableCell align='right'>Registered At</TableCell>
                      <TableCell align='right'>Participated?</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registeredUsers.length > 0 ? (
                      registeredUsers.map(user => {
                        const hasParticipated = participatedUsers.some(p => p.user === user.user)
                        return (
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
                              <Typography variant='body2'>{new Date(user.registeredAt).toLocaleString()}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Chip
                                icon={hasParticipated ? <CheckCircle fontSize='small' /> : <Cancel fontSize='small' />}
                                label={
                                  hasParticipated
                                    ? 'Yes'
                                    : Date.now() < new Date(game.startTime).getTime() + game.duration * 1000
                                      ? 'Not Yet'
                                      : 'No'
                                }
                                color={
                                  hasParticipated
                                    ? 'success'
                                    : Date.now() < new Date(game.startTime).getTime() + game.duration * 1000
                                      ? 'warning'
                                      : 'error'
                                }
                                size='small'
                                variant='outlined'
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })
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
                            <HowToReg fontSize='large' color='disabled' />
                            <Typography variant='body1' color='text.secondary'>
                              No registered players yet
                            </Typography>
                            <Typography variant='caption' color='text.disabled'>
                              Player registrations will appear here once they sign up
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

export default RegisteredPlayersTable