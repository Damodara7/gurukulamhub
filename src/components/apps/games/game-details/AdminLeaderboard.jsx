import React, { useEffect, useState } from 'react'
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
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { EmojiEvents, CheckCircle, Cancel, People } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

function AdminLeaderboard({
  game,
  duringPlay = false,
  headerIcon = <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />,
  headerTitle = 'Leaderboard',
  description = '',
  maxheight = 300
}) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          const sortedLeaderboard = res.result?.sort((p1, p2) => {
            if (game?.gameMode === 'live') {
              return p2.fffPoints - p1.fffPoints
            } else {
              // self-paced: sort by score desc, then totalAnswerTime asc, then finishedAt asc
              if (p2.score !== p1.score) {
                return p2.score - p1.score
              }
              if (p1.totalAnswerTime !== p2.totalAnswerTime) {
                return p1.totalAnswerTime - p2.totalAnswerTime
              }
              return new Date(p1.finishedAt) - new Date(p2.finishedAt)
            }
          })
          setLeaderboard(sortedLeaderboard)
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
      }
    }
    if (game?._id) fetchLeaderboard()
  }, [game?._id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
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
                <TableCell align='right'>Answer Time</TableCell>
                {game.gameMode === 'live' && (
                  <TableCell align='right'>
                    <Tooltip title="Fastest Finger First Points" placement="top">FFF Points</Tooltip>
                  </TableCell>
                )}
                {game.gameMode === 'self-paced' && (
                  <TableCell align='right'>Finished At</TableCell>
                )}
                <TableCell align='right'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard
                  .slice(0, duringPlay ? 5 : leaderboard.length)
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
                          {formatTime((user.totalAnswerTime || user.answers?.reduce((sum, a) => sum + a.answerTime, 0) || 0) / 1000)}
                        </Typography>
                      </TableCell>
                      {game.gameMode === 'live' && (
                        <TableCell align='right'>
                          <Typography variant='body1' fontWeight='medium'>
                            {user?.fffPoints?.toFixed(3)}
                          </Typography>
                        </TableCell>
                      )}
                      {game.gameMode === 'self-paced' && (
                        <TableCell align='right'>
                          <Typography variant='body1' fontWeight='medium'>
                            {user.finishedAt ? new Date(user.finishedAt).toLocaleString() : '--'}
                          </Typography>
                        </TableCell>
                      )}
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
