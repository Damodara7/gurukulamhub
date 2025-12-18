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
import { useTheme, alpha } from '@mui/material/styles'
import { EmojiEvents, FiberManualRecord } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { stringToColor } from '@/utils/stringToColor'
import dynamic from 'next/dynamic'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function Leaderboard({ game, duringPlay = false, isAdmin = false }) {
  const theme = useTheme()
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const wsRef = useRef(null)
  const [highlightedRows, setHighlightedRows] = useState({})

  // Check if a player is the current user
  const isCurrentUser = player => {
    return player?.email === session?.user?.email || player?.user?.email === session?.user?.email
  }

  console.log('data game on the leaderboard ', game)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)

        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${game._id}/leaderboard`)
        if (res.status === 'success') {
          // Sort leaderboard by score (descending) and then by totalTime (ascending)
          console.log(' response result ', res.result)

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

  // Helper to blend a hex color with background for a lighter/darker shade based on theme
  function blendWithBackground(hex, blendAlpha = 0.8) {
    // hex: #RRGGBB
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    // Get background color based on theme
    const bgColor = theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff'

    // Parse background color
    const bgR = theme.palette.mode === 'dark' ? 45 : 255 // Approximate dark paper or white
    const bgG = theme.palette.mode === 'dark' ? 40 : 255
    const bgB = theme.palette.mode === 'dark' ? 60 : 255

    // Blend with background
    return `rgba(${Math.round(r * (1 - blendAlpha) + bgR * blendAlpha)}, ${Math.round(
      g * (1 - blendAlpha) + bgG * blendAlpha
    )}, ${Math.round(b * (1 - blendAlpha) + bgB * blendAlpha)}, 1)`
  }

  // Helper to check if a player moved up or down
  const getRowAnimation = (player, index) => {
    const isUser = isCurrentUser(player)

    // Highlight if recently moved
    if (highlightedRows[player._id] === 'up') {
      return {
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.2) : '#e0ffe0',
        transition: 'background-color 0.5s',
        borderLeft: isUser ? `4px solid ${theme.palette.primary.main}` : 'none'
      }
    }
    if (highlightedRows[player._id] === 'down') {
      return {
        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.2) : '#ffe0e0',
        transition: 'background-color 0.5s',
        borderLeft: isUser ? `4px solid ${theme.palette.primary.main}` : 'none'
      }
    }
    // Default: color based on player email, blended with background
    // Add special highlight for current user
    return {
      backgroundColor: isUser
        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.12)
        : blendWithBackground(stringToColor(player.email), theme.palette.mode === 'dark' ? 0.15 : 0.8),
      transition: 'background-color 0.5s',
      borderLeft: isUser ? `4px solid ${theme.palette.primary.main}` : 'none',
      boxShadow: isUser ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
    }
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
    <Box
      sx={{ mx: 'auto', width: '100%', maxWidth: duringPlay || !isAdmin ? 'md' : 'md', my: 5, px: { xs: 2, md: 0 } }}
    >
      <Typography
        variant='h6'
        sx={{
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary'
        }}
      >
        <EmojiEvents color='primary' /> Leaderboard
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table size={'medium'} sx={{ bgcolor: 'transparent' }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.5)
                    : alpha(theme.palette.primary.main, 0.05),
                borderBottom: `2px solid ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Rank
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Player
              </TableCell>
              <TableCell
                align='right'
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Score
              </TableCell>
              <TableCell
                align='right'
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Answer Time
              </TableCell>
              {game?.gameMode === 'live' && (
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  <Tooltip title='Fastest Finger First Points' placement='top'>
                    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      FFF Points
                      <Typography
                        component='span'
                        sx={{
                          fontSize: '0.75rem',
                          color:
                            theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.6) : 'text.secondary',
                          fontWeight: 400,
                          textTransform: 'none'
                        }}
                      >
                        {`(out of ${1000 * game?.questionsCount})`}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              )}
              {game.gameMode === 'self-paced' && (
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'text.primary',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Completed At
                </TableCell>
              )}
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
                  <TableCell
                    sx={{
                      color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                      fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                      fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isCurrentUser(player) && (
                        <FiberManualRecord
                          sx={{
                            fontSize: 8,
                            color: theme.palette.primary.main,
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': {
                                opacity: 1,
                                transform: 'scale(1)'
                              },
                              '50%': {
                                opacity: 0.6,
                                transform: 'scale(1.2)'
                              }
                            }
                          }}
                        />
                      )}
                      <Box component='span'>
                        {player?.user?.profile?.firstname && player?.user?.profile?.lastname
                          ? ` ${player?.user?.profile?.firstname} ${player?.user?.profile?.lastname}`
                          : player?.user?.profile?.firstname || player?.user?.profile?.lastname || player?.email}
                        {isCurrentUser(player) && (
                          <Typography
                            component='span'
                            sx={{
                              ml: 1,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: theme.palette.primary.main,
                              fontStyle: 'italic'
                            }}
                          >
                            (You)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                      fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                    }}
                  >
                    {player.score.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                      fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                    }}
                  >
                    {formatTime(player.totalAnswerTime / 1000)}
                  </TableCell>
                  {game?.gameMode === 'live' && (
                    <TableCell
                      align='right'
                      sx={{
                        color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                        fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      {player?.fffPoints?.toFixed(3)}
                    </TableCell>
                  )}
                  {game?.gameMode === 'self-paced' && (
                    <TableCell
                      align='right'
                      sx={{
                        color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                        fontWeight: index < 3 || isCurrentUser(player) ? 700 : 500,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      {new Date(player?.finishedAt)?.toLocaleString()}
                    </TableCell>
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
