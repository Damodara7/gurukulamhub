import React, { useEffect, useState, useRef } from 'react'
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
  CircularProgress,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { EmojiEvents, CheckCircle, Cancel, People } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { stringToColor } from '@/utils/stringToColor'

function AdminLeaderboard({
  game,
  duringPlay = false,
  headerIcon = <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />,
  headerTitle = 'Leaderboard',
  description = '',
  maxheight = 300
}) {
  const theme = useTheme()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const wsRef = useRef(null)
  const [highlightedRows, setHighlightedRows] = useState({})
  console.log('game data for admin ', game)
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
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
      }
    }
    if (game?._id) fetchLeaderboard()

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
        console.log('[WS] Connected to leaderboard updates (admin)')
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
            setLoading(false)
          }
        } catch (e) {
          console.error('[WS] Error parsing leaderboard message (admin)', e)
        }
      }
      wsRef.current.onerror = err => {
        console.error('[WS] Leaderboard error (admin)', err)
      }
      wsRef.current.onclose = () => {
        console.log('[WS] Leaderboard connection closed (admin)')
      }
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [game._id])

  // Helper to blend a hex color with white for a lighter shade
  function blendWithWhite(hex, alpha = 0.8) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${Math.round(r * (1 - alpha) + 255 * alpha)}, ${Math.round(
      g * (1 - alpha) + 255 * alpha
    )}, ${Math.round(b * (1 - alpha) + 255 * alpha)}, 1)`
  }

  // Get row style based on movement
  const getRowAnimation = (player, index) => {
    if (highlightedRows[player._id] === 'up') {
      return {
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.2) : '#e0ffe0',
        transition: 'background-color 0.5s'
      }
    }
    if (highlightedRows[player._id] === 'down') {
      return {
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.2) : '#ffe0e0',
        transition: 'background-color 0.5s'
      }
    }
    return {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? alpha(stringToColor(player.email), 0.15)
          : blendWithWhite(stringToColor(player.email), 0.8),
      transition: 'background-color 0.5s'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '16px',
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: theme.palette.background.paper
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant='h6'
          sx={{
            mb: description ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 3 },
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.text.primary,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          {React.cloneElement(headerIcon, { sx: { fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main } })}
          {headerTitle}
        </Typography>
        {description && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
          >
            {description}
          </Typography>
        )}
        <TableContainer component={Paper} sx={{ maxHeight: maxheight, overflow: 'auto' }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>Rank</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>
                  Player
                </TableCell>
                <TableCell align='right' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>
                  Score
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 },
                    display: { xs: 'none', lg: 'table-cell' }
                  }}
                >
                  Answer Time
                </TableCell>
                {game.gameMode === 'live' && (
                  <TableCell
                    align='right'
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 },
                      display: { xs: 'none', lg: 'table-cell' }
                    }}
                  >
                    <Tooltip title='Fastest Finger First Points' placement='top'>
                      FFF Points
                    </Tooltip>
                  </TableCell>
                )}
                {game.gameMode === 'self-paced' && (
                  <TableCell
                    align='right'
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 },
                      display: { xs: 'none', lg: 'table-cell' }
                    }}
                  >
                    Finished At
                  </TableCell>
                )}
                <TableCell align='right' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard && leaderboard.length > 0 ? (
                <AnimatePresence>
                  {leaderboard.slice(0, duringPlay ? 5 : leaderboard.length).map((user, index) => (
                    <motion.tr
                      key={user._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={getRowAnimation(user, index)}
                    >
                      <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>
                        <Typography
                          variant='subtitle1'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                          <Avatar
                            sx={{
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                            alt={
                              user?.user?.profile?.firstname && user?.user?.profile?.lastname
                                ? `${user?.user?.profile?.firstname} ${user?.user?.profile?.lastname} `
                                : user?.user?.profile?.firstname || user?.user?.profile?.lastname || user?.email
                            }
                          >
                            {user?.user?.profile?.firstname && user?.user?.profile?.lastname
                              ? `${user?.user?.profile?.firstname[0].toUpperCase()} ${user?.user?.profile?.lastname[0].toUpperCase()} `
                              : user?.user?.profile?.firstname[0].toUpperCase() ||
                                user?.user?.profile?.lastname[0].toUpperCase() ||
                                user.email[0].toUpperCase()}
                          </Avatar>
                          <Typography
                            variant='body1'
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: { xs: '120px', sm: 'none' }
                            }}
                            title={
                              user?.user?.profile?.firstname && user?.user?.profile?.lastname
                                ? `${user?.user?.profile?.firstname} ${user?.user?.profile?.lastname} `
                                : user?.user?.profile?.firstname || user?.user?.profile?.lastname || user?.email
                            }
                          >
                            {user?.user?.profile?.firstname && user?.user?.profile?.lastname
                              ? `${user?.user?.profile?.firstname} ${user?.user?.profile?.lastname} `
                              : user?.user?.profile?.firstname || user?.user?.profile?.lastname || user?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='right' sx={{ py: { xs: 1, sm: 1.5 } }}>
                        <Typography
                          variant='body1'
                          fontWeight='medium'
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {user.score?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ py: { xs: 1, sm: 1.5 }, display: { xs: 'none', lg: 'table-cell' } }}
                      >
                        <Typography
                          variant='body1'
                          fontWeight='medium'
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {formatTime(
                            (user.totalAnswerTime || user.answers?.reduce((sum, a) => sum + a.answerTime, 0) || 0) /
                              1000
                          )}
                        </Typography>
                      </TableCell>
                      {game.gameMode === 'live' && (
                        <TableCell
                          align='right'
                          sx={{ py: { xs: 1, sm: 1.5 }, display: { xs: 'none', lg: 'table-cell' } }}
                        >
                          <Typography
                            variant='body1'
                            fontWeight='medium'
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            {user?.fffPoints?.toFixed(3)}
                          </Typography>
                        </TableCell>
                      )}
                      {game.gameMode === 'self-paced' && (
                        <TableCell
                          align='right'
                          sx={{ py: { xs: 1, sm: 1.5 }, display: { xs: 'none', lg: 'table-cell' } }}
                        >
                          <Typography
                            variant='body1'
                            fontWeight='medium'
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            {user.finishedAt ? new Date(user.finishedAt).toLocaleString() : '--'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align='right' sx={{ py: { xs: 1, sm: 1.5 } }}>
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
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: { xs: 3, sm: 4 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <People sx={{ fontSize: { xs: 32, sm: 40 } }} color='disabled' />
                      <Typography
                        variant='body1'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {game?.status === 'cancelled'
                          ? 'Game was cancelled'
                          : game?.status === 'completed'
                            ? 'No players participated in this game'
                            : 'No players have participated yet'}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.disabled'
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, textAlign: 'center', px: 2 }}
                      >
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
