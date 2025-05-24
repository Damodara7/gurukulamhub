'use client'

import React, { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { Place, People, EmojiEvents, Videocam, HowToReg, CheckCircle, Cancel } from '@mui/icons-material'
import ReactPlayer from 'react-player'
import RewardsList from '@/components/apps/games/game-details/RewardsList'
import Leaderboard from '@/components/apps/games/game-details/Leaderboard'
import GameHeader from '@/components/apps/games/game-details/GameHeader'

export default function GameDetailsPage({ game = null }) {
  if (!game)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>No game data available</Typography>
      </Box>
    )

  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header Section */}
      <GameHeader game={game} />

      {/* Promotional Video Section */}
      {game.promotionalVideoUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
              Promotional Video
            </Typography>
            <Box
              sx={{
                position: 'relative',
                pt: '40.25%', // 16:9 aspect ratio
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <ReactPlayer
                url={game.promotionalVideoUrl}
                width='100%'
                height='100%'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                controls
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Game Information Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Location Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <Place sx={{ mr: 1, verticalAlign: 'middle' }} />
                Location Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Place color='action' />
                  </ListItemIcon>
                  <ListItemText primary='Country' secondary={game.location?.country || 'Not specified'} />
                </ListItem>
                <Divider component='li' />
                <ListItem>
                  <ListItemIcon>
                    <Place color='action' />
                  </ListItemIcon>
                  <ListItemText primary='Region' secondary={game.location?.region || 'Not specified'} />
                </ListItem>
                <Divider component='li' />
                <ListItem>
                  <ListItemIcon>
                    <Place color='action' />
                  </ListItemIcon>
                  <ListItemText primary='City' secondary={game.location?.city || 'Not specified'} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Game Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.registeredUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Registered Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.participatedUsers.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Participants
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.duration / 60}min</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Duration
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4'>{game.rewards.length}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Reward Tiers
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Registration & Participation Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Registered Players */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <HowToReg sx={{ mr: 1, verticalAlign: 'middle' }} />
                Registered Players ({game.registeredUsers.length})
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Player</TableCell>
                      <TableCell align='right'>Registered At</TableCell>
                      <TableCell align='right'>Participated?</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {game.registeredUsers.length > 0 ? (
                      game.registeredUsers.map(user => {
                        const hasParticipated = game.participatedUsers.some(p => p.user === user.user)
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

        {/* Participated Players */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Participated Players ({game.participatedUsers.length})
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
                    {game.participatedUsers.length > 0 ? (
                      game.participatedUsers.map(user => (
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
      </Grid>

      {/* Leaderboard Section */}
      <Leaderboard participatedUsers={game?.participatedUsers} />

      {/* Rewards Section */}
      {game.rewards.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Rewards
              </Typography>
            </Box>

            {/* Rewards List */}
            <RewardsList rewards={game?.rewards} />
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
