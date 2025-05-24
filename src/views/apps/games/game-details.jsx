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
  CardMedia,
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
  Paper,
  IconButton,
  Button
} from '@mui/material'
import {
  Place,
  Schedule,
  People,
  EmojiEvents,
  Videocam,
  HowToReg,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
  ExitToApp
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import imagePlaceholder from '/public/images/misc/image-placeholder.png'

const statusColors = {
  created: 'default',
  reg_open: 'success',
  reg_closed: 'warning',
  lobby: 'info',
  live: 'error',
  completed: 'primary',
  cancelled: 'error'
}

export default function GameDetailsPage({ game = null }) {
    const [showSponsors, setShowSponsors] = useState(false)
  if (!game)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6'>No game data available</Typography>
      </Box>
    )

  return (
    <Box sx={{ p: 3 }}>
      {/* Game Header Section */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', p: 3 }}>
          <Avatar
            variant='rounded'
            component='image'
            src={game?.thumbnailPoster || imagePlaceholder?.src}
            sx={{
              width: 150,
              height: 150,
              mr: 3,
              borderRadius: 2
            }}
            onError={e => (e.target.src = imagePlaceholder?.src)}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 2
              }}
            >
              <Typography variant='h4' component='h1'>
                {game.title}
              </Typography>
              <Chip label={game.status} color={statusColors[game.status]} variant='outlined' size='medium' />
            </Box>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
              {game.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                icon={<Schedule />}
                label={`${Date.now() > new Date(game.startTime).getTime() ? 'Started' : 'Starts'}: ${new Date(
                  game.startTime
                ).toLocaleString()}`}
                variant='outlined'
              />
              <Chip
                icon={<People />}
                label={`Players: ${game.participatedUsers.length}/${game.maxPlayers}`}
                variant='outlined'
              />
            </Box>
          </Box>
        </Box>
      </Card>

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
                                label={hasParticipated ? 'Participated' : 'Not Yet'}
                                color={hasParticipated ? 'success' : 'default'}
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
                {game.participatedUsers.length > 0 ? (
                  [...game.participatedUsers]
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

      {/* Rewards Section */}
      {game.rewards.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>
                <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reward Structure
              </Typography>
              <Button size='small' startIcon={<People />} onClick={() => setShowSponsors(!showSponsors)}>
                {showSponsors ? 'Hide Sponsors' : 'Show Sponsors'}
              </Button>
            </Box>

            <Grid container spacing={2}>
              {game.rewards.map(reward => (
                <Grid item xs={12} md={6} lg={4} key={reward.position}>
                  <Card variant='outlined'>
                    <CardContent>
                      {/* Reward Position Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          gap: 1
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: positionColors[reward.position],
                            width: 32,
                            height: 32
                          }}
                        >
                          #{reward.position}
                        </Avatar>
                        <Typography variant='h6'>{reward.numberOfWinnersForThisPosition} Winner(s)</Typography>
                      </Box>

                      {/* Reward Details */}
                      <Box sx={{ mb: 2 }}>
                        {reward.sponsors.map((sponsor, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              mb: 1.5,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              display: showSponsors ? 'block' : 'none'
                            }}
                          >
                            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
                              {sponsor.email}
                            </Typography>
                            {sponsor.rewardDetails.rewardType === 'cash' ? (
                              <Typography variant='body2'>
                                Cash Prize: {sponsor.rewardDetails.rewardValue} {sponsor.rewardDetails.currency}
                              </Typography>
                            ) : (
                              <Typography variant='body2'>
                                Physical Gift: {sponsor.rewardDetails.nonCashReward}
                                {sponsor.rewardDetails.numberOfNonCashRewards > 1 &&
                                  ` (x${sponsor.rewardDetails.numberOfNonCashRewards})`}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>

                      {/* Summary Line */}
                      <Typography variant='body2' color='text.secondary'>
                        Total Reward: {reward.rewardValuePerWinner} {reward.sponsors[0]?.rewardDetails?.currency || ''}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Sponsored by {reward.sponsors.length} {reward.sponsors.length === 1 ? 'sponsor' : 'sponsors'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

const positionColors = {
  1: '#ffd700', // Gold
  2: '#c0c0c0', // Silver
  3: '#cd7f32', // Bronze
  4: '#a0a0a0',
  5: '#808080'
}
