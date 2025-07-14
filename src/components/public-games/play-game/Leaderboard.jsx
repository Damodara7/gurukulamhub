// components/Leaderboard.jsx
import { useEffect, useState, useRef } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'
import { stringToColor } from '@/utils/stringToColor'
import dynamic from 'next/dynamic'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function Leaderboard({ game, duringPlay = false, isAdmin = false }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const wsRef = useRef(null)
  const [highlightedRows, setHighlightedRows] = useState({})

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)

        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          console.log(res.result)

          const sortedLeaderboard = res.result?.sort((p1, p2) => {
            if (game?.gameMode === 'live') {
              if (p2.score !== p1.score) {
                return p2.score - p1.score
              }
              if (p2.fffPoints !== p1.fffPoints) {
                return p2.fffPoints - p1.fffPoints
              }
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
          // Highlight moved rows
          if (leaderboard.length > 0) {
            const newHighlights = {}
            sortedLeaderboard.forEach((player, idx) => {
              const prevIdx = leaderboard.findIndex(p => p._id === player._id)
              if (prevIdx !== -1 && prevIdx !== idx) {
                newHighlights[player._id] = prevIdx > idx ? 'up' : 'down' // if index reduced means moves up ( Ex: Idx ==> 2 to 1 means moved up in the list)
              }
            })
            setHighlightedRows(newHighlights)
            if (Object.keys(newHighlights).length > 0) {
              setTimeout(() => {
                setHighlightedRows({})
              }, 3000)
            }
          }
          setLeaderboard(sortedLeaderboard)
        } else {
          console.log('Error while updating score: ', res.message)
        }
      } catch (error) {
        console.log('Error while updating score: ', error.message)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchLeaderboard()

    // WebSocket connection for real-time updates
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/leaderboard/${
            game._id
          }`
        : ''
    if (wsUrl) {
      wsRef.current = new WebSocket(wsUrl)
      wsRef.current.onopen = () => {
        console.log('[WS] Connected to leaderboard updates')
      }
      wsRef.current.onmessage = event => {
        try {

          const msg = JSON.parse(event.data)
          if (msg.type === 'leaderboard') {
            const sortedLeaderboard = msg.data?.sort((p1, p2) => {
              if (game?.gameMode === 'live') {
                if (p2.score !== p1.score) {
                  return p2.score - p1.score
                }
                if (p2.fffPoints !== p1.fffPoints) {
                  return p2.fffPoints - p1.fffPoints
                }
              } else {
                if (p2.score !== p1.score) {
                  return p2.score - p1.score
                }
                if (p1.totalAnswerTime !== p2.totalAnswerTime) {
                  return p1.totalAnswerTime - p2.totalAnswerTime
                }
                return new Date(p1.finishedAt) - new Date(p2.finishedAt)
              }
            })
            // Highlight moved rows
            if (leaderboard.length > 0) {
              const newHighlights = {}
              sortedLeaderboard.forEach((player, idx) => {
                const prevIdx = leaderboard.findIndex(p => p._id === player._id)
                if (prevIdx !== -1 && prevIdx !== idx) {
                  newHighlights[player._id] = prevIdx > idx ? 'up' : 'down'
                }
              })
              setHighlightedRows(newHighlights)
              if (Object.keys(newHighlights).length > 0) {
                setTimeout(() => {
                  setHighlightedRows({})
                }, 2500)
              }
            }
            setLeaderboard(sortedLeaderboard)
          }
        } catch (e) {
          console.error('[WS] Error parsing leaderboard message', e)
        }
      }
      wsRef.current.onerror = err => {
        console.error('[WS] Leaderboard error', err)
      }
      wsRef.current.onclose = () => {
        console.log('[WS] Leaderboard connection closed')
      }
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
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

  // Helper to blend a hex color with white for a lighter shade
  function blendWithWhite(hex, alpha = 0.8) {
    // hex: #RRGGBB
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    // blend with white
    return `rgba(${Math.round(r * (1 - alpha) + 255 * alpha)}, ${Math.round(
      g * (1 - alpha) + 255 * alpha
    )}, ${Math.round(b * (1 - alpha) + 255 * alpha)}, 1)`
  }

  // Helper to check if a player moved up or down
  const getRowAnimation = (player, index) => {
    // Highlight if recently moved
    if (highlightedRows[player._id] === 'up') {
      return { backgroundColor: '#e0ffe0', transition: 'background-color 0.5s' }
    }
    if (highlightedRows[player._id] === 'down') {
      return { backgroundColor: '#ffe0e0', transition: 'background-color 0.5s' }
    }
    // Default: light color based on player email
    return { backgroundColor: blendWithWhite(stringToColor(player.email), 0.8), transition: 'background-color 0.5s' }
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
    <Box sx={{ mx: 'auto', width: '100%', maxWidth: duringPlay || !isAdmin ? 'md' : 'md', my: 5 }}>
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
        <Table size={duringPlay ? 'medium' : 'medium'}>
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
            <AnimatePresence>
              {leaderboard.slice(0, duringPlay ? 5 : leaderboard.length).map((player, index) => (
                <motion.tr
                  key={player._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={getRowAnimation(player, index)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.email}</TableCell>
                  <TableCell align='right'>{player.score.toFixed(2)}</TableCell>
                  {!duringPlay && <TableCell align='right'>{formatTime(player.totalAnswerTime / 1000)}</TableCell>}
                  {game?.gameMode === 'live' && <TableCell align='right'>{player?.fffPoints?.toFixed(3)}</TableCell>}
                  {game?.gameMode === 'self-paced' && (
                    <TableCell align='right'>{new Date(player?.finishedAt)?.toLocaleString()}</TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
