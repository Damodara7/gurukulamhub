import React from 'react'
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
} from '@mui/material'
import { EmojiEvents, CheckCircle, Cancel, People } from '@mui/icons-material'

function AdminLeaderboard({
  game,
  duringPlay = false,
  headerIcon = <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />,
  headerTitle = 'Leaderboard',
  description = '',
  maxheight = 300       
}) {
  const formatTime = seconds => {
    // Handle edge cases
    if (seconds === 0) return '0s'
    if (!seconds && seconds !== 0) return '--'

    const hours = Math.floor(seconds / 3600)
    const remainingAfterHours = seconds % 3600
    const mins = Math.floor(remainingAfterHours / 60)
    const secs = remainingAfterHours % 60

    // Check for milliseconds (decimal part)
    const hasMilliseconds = secs % 1 !== 0
    const milliseconds = hasMilliseconds ? (secs - Math.floor(secs)).toFixed(3).slice(2) : null
    const wholeSecs = Math.floor(secs)

    const parts = []

    // Add hours if present
    if (hours > 0) parts.push(`${hours}h`)

    // Add minutes if present (but only if we're showing hours or minutes are > 0)
    if (mins > 0 || hours > 0) parts.push(`${mins}m`)

    // Handle seconds and milliseconds
    if (wholeSecs > 0 || hasMilliseconds) {
      let secondsPart = ''
      if (wholeSecs > 0) {
        secondsPart += `${wholeSecs}`
      }

      // Add milliseconds if they exist and we're not showing hours or minutes
      if (hasMilliseconds && hours === 0 && mins === 0) {
        secondsPart += `.${milliseconds}`
      }

      if (secondsPart !== '') {
        parts.push(`${secondsPart}s`)
      }
    }

    // Special case: if we have only milliseconds (time < 1s)
    if (parts.length === 0 && hasMilliseconds) {
      return `${secs.toFixed(3)}s` // e.g., "0.500s"
    }

    return parts.length === 0 ? '0s' : parts.join(' ')
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 1 }}>
          {headerIcon}
          {headerTitle}
        </Typography>
        {description && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}
        <TableContainer component={Paper} sx={{ maxHeight: maxheight, overflow: 'auto' }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align='right'>Score</TableCell>
                <TableCell align='right'>Time</TableCell>
                <TableCell align='right'>Accuracy</TableCell>
                <TableCell align='right'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {game?.participatedUsers?.length > 0 ? (
                [...game.participatedUsers]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, duringPlay ? 5 : game.participatedUsers.length)
                  .map((user, index) => (
                    <TableRow key={user._id} hover>
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
                          {user.score?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {formatTime(user.answers.reduce((sum, a) => sum + a.answerTime, 0))}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {parseFloat((user.score / user.answers.length) * 100 || 0)
                            .toFixed(2)
                            .replace(/\.?0+$/, '')}
                          %
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
                  <TableCell colSpan={6} align='center' sx={{ py: 4 }}>
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
                        {game?.status === 'cancelled'
                          ? 'Game was cancelled'
                          : game?.status === 'completed'
                            ? 'No players participated in this game'
                            : 'No players have participated yet'}
                      </Typography>
                      <Typography variant='body2' color='text.disabled'>
                        {game?.status === 'cancelled'
                          ? 'This game has been cancelled and no results are available.'
                          : game?.status === 'completed'
                            ? 'The game has ended with no participants.'
                            : 'Player results will appear here once they start playing.'}
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

export default AdminLeaderboard
