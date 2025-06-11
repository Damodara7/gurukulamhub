import React from 'react';
import { useEffect, useState } from 'react';
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

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

function AdminLeaderboard({ game, duringPlay = false }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
console.log('inside the game' , game);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          console.log(res.result)
          const sortedLeaderBoard = res.result.sort((a, b) => {
            if (b.score > a.score) return 1
            if (b.score < a.score) return -1

            //if scores are eqaul , compare by time (lower time comes first)
            if (a.totalTime > b.totalTime) return 1
            if (a.totalTime < b.totalTime) return -1

            return 0
          })
          setLeaderboard(sortedLeaderBoard)
          setLoading(false)
        } else {
          console.log('Error while updating score: ', res.message)
          setLoading(false)
        }
      } catch (error) {
        console.log('Error while updating score: ', error.message)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchLeaderboard()
  }, [game._id])

  
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
                <TableCell align='right'>Time</TableCell>
                <TableCell align='right'>Accuracy</TableCell>
                <TableCell align='right'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, duringPlay ? 5 : leaderboard.length).map((player, index) => {
                  //finding the matching player in the participatedUser 
                  const participated = game?.participatedUsers?.find(
                    user => user._id === player._id);
                  
                  const isCompleted = participated?.completed || false;

                  return (
                    <TableRow key={player._id} hover>
                      <TableCell>
                        <Typography variant='subtitle1' color='text.secondary'>
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={player.email}>
                            {player.email[0].toUpperCase()}
                          </Avatar>
                          <Typography variant='body1'>{player.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {player.score.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {formatTime(player.totalTime)}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body1' fontWeight='medium'>
                          {parseFloat(player.accuracy || 0)
                            .toFixed(2)
                            .replace(/\.?0+$/, '')}
                          %
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        {isCompleted ? (
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
                  )
              })
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

export default AdminLeaderboard
