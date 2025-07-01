// components/Leaderboard.jsx
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export default function Leaderboard({ game, duringPlay = false, isAdmin = false }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          console.log(res.result)

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
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const hasMilliseconds = secs % 1 !== 0
    const formattedSecs = hasMilliseconds ? secs.toFixed(3) : secs.toFixed(0)

    const parts = []
    if (mins > 0) parts.push(`${mins}m`)
    if (secs > 0 || hasMilliseconds) parts.push(`${formattedSecs}s`)
    return parts.length === 0 ? '0s' : parts.join(' ')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!leaderboard || (leaderboard && leaderboard.length === 0)) {
    return null
  }

  return (
    <Box sx={{ mx: 'auto', maxWidth: duringPlay || !isAdmin ? 'md' : 'md', px: { md: 10, xs: 3 }, my: 5 }}>
      <Typography
        variant='h6'
        sx={{
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <EmojiEvents color='primary' /> Leaderboard
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table size={duringPlay ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align='right'>Score</TableCell>
              {!duringPlay && <TableCell align='right'>Answer Time</TableCell>}
              {game?.gameMode === 'live' && (
                <TableCell align='right'>
                  <Tooltip title='Fastest Finger First Points' placement='top'>
                    FFF Points{' '}
                    <span style={{ fontSize: '0.8em', color: '#888' }}>{`(out of ${
                      1000 * game?.questionsCount
                    })`}</span>
                  </Tooltip>
                </TableCell>
              )}
              {game.gameMode === 'self-paced' && <TableCell align='right'>Completed At</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.slice(0, duringPlay ? 5 : leaderboard.length).map((player, index) => (
              <TableRow key={player._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.email}</TableCell>
                <TableCell align='right'>{player.score.toFixed(2)}</TableCell>
                {!duringPlay && <TableCell align='right'>{formatTime(player.totalAnswerTime / 1000)}</TableCell>}
                {game?.gameMode === 'live' && <TableCell align='right'>{player?.fffPoints?.toFixed(3)}</TableCell>}
                {game?.gameMode === 'self-paced' && (
                  <TableCell align='right'>{new Date(player?.finishedAt)?.toLocaleString()}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
