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
  CircularProgress
} from '@mui/material'
import { EmojiEvents } from '@mui/icons-material';
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export default function Leaderboard({ game, duringPlay=false, isAdmin=false }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          console.log(res.result);
          const sortedLeaderBoard = res.result.sort((a,b) => {
            if(b.score > a.score) return 1
            if(b.score < a.score) return -1
            
            //if scores are eqaul , compare by time (lower time comes first)
            if(a.totalTime > b.totalTime) return 1
            if(a.totalTime < b.totalTime) return -1
            
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

  if(!leaderboard ||(leaderboard && leaderboard.length === 0)){
    return null
  }

  return (
    <Box sx={{ mx: 'auto', maxWidth: duringPlay || !isAdmin ? 'sm' : 'md', px: { md: 10, xs: 3 } }}>
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
        <Table size={duringPlay ? 'medium' : 'big'}>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align='right'>Score</TableCell>
              {!duringPlay && <TableCell align='right'>Time</TableCell>}
              {isAdmin && <TableCell align='right'>Accuracy</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.slice(0, duringPlay ? 5 : leaderboard.length).map((player, index) => (
              <TableRow key={player._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.email}</TableCell>
                <TableCell align='right'>{player.score.toFixed(2)}</TableCell>
                {!duringPlay && <TableCell align='right'>{formatTime(player.totalTime)}</TableCell>}
                {isAdmin && <TableCell align='right'>{(player.accuracy || 0).toFixed(2)}%</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
