import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
  keyframes,
  Alert,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material'
import {
  AccessTime,
  People,
  Person,
  LocationOn,
  PlayCircle,
  SportsEsports,
  ContentCopy,
  Share as ShareIcon,
  EmojiEvents,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import ReactPlayer from 'react-player'
import { format, formatDistanceToNow } from 'date-fns'
import ShareGamePopup from '@components/public-games/all-games/ShareGamePopup'
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`

const PlayGameInfoScreen = ({ game, setShouldStartGame }) => {
  const theme = useTheme()
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [countdownColor, setCountdownColor] = useState('primary.main')
  const [copyTooltip, setCopyTooltip] = useState('Copy PIN')
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [pinCopied, setPinCopied] = useState(false)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

  const handleCopyPin = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(game.pin)
        setCopyTooltip('Copied!')
        setPinCopied(true)
        setTimeout(() => {
          setCopyTooltip('Copy PIN')
          setPinCopied(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to copy PIN:', error)
    }
  }

  // Calculate time remaining until game starts
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const startTime = new Date(game.startTime)
      //   const startTime = new Date(new Date('2025-05-15T11:02:00Z') + 2* 60 * 1000)
      const diffInSeconds = Math.floor((startTime - now) / 1000)

      if (diffInSeconds <= 0) {
        setTimeRemaining('Game is starting now!')
        setCountdownColor('success.main')
        setShouldStartGame(true)
        return
      }

      // Change color based on time remaining
      if (diffInSeconds <= 30) {
        setCountdownColor('error.main')
      } else if (diffInSeconds <= 60) {
        setCountdownColor('warning.main')
      } else {
        setCountdownColor('primary.main')
      }

      const hours = Math.floor(diffInSeconds / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)
      const seconds = diffInSeconds % 60

      setTimeRemaining(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [game.startTime, setShouldStartGame])

  const getStatusChip = () => {
    const statusConfig = {
      created: { color: 'warning', label: 'Pending', icon: <AccessTime /> },
      approved: { color: 'info', label: 'Approved', icon: <AccessTime /> },
      lobby: { color: 'warning', label: 'Lobby', icon: <AccessTime /> },
      live: { color: 'success', label: 'Live', icon: <PlayCircle /> },
      completed: { color: 'default', label: 'Completed', icon: <SportsEsports /> }
    }

    const config = statusConfig[game.status] || statusConfig.default
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant='outlined'
        sx={{
          fontWeight: 600,
          borderWidth: 1.5,
          px: 1,
          '& .MuiChip-icon': {
            color: theme.palette[config.color].main
          }
        }}
      />
    )
  }

  const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default, pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
          pt: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          pb: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth='lg'>
          <Stack spacing={isHeaderCollapsed ? 1 : { xs: 1.5, sm: 2 }}>
            <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
              <Stack direction='row' spacing={1} alignItems='center' flex={1} minWidth={0}>
                <SportsEsports sx={{ fontSize: { xs: 20, sm: 24, md: 28 }, color: theme.palette.primary.main, flexShrink: 0 }} />
                <Typography
                  variant='h3'
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {game.title}
                </Typography>
              </Stack>
              <IconButton
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'text.primary'
                  }
                }}
              >
                {isHeaderCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Stack>
            {!isHeaderCollapsed && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 1.5 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                flexWrap='wrap'
              >
                {getStatusChip()}
                <Chip
                  icon={<EmojiEvents sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  label={`PIN: ${game.pin}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    height: { xs: 24, sm: 28 },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.18)
                    }
                  }}
                  onClick={handleCopyPin}
                  deleteIcon={
                    <Tooltip title={copyTooltip} placement='top' arrow>
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleCopyPin()
                        }}
                        sx={{
                          color: pinCopied ? 'success.main' : 'primary.main',
                          '&:hover': {
                            bgcolor: alpha(
                              pinCopied ? theme.palette.success.main : theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.2 : 0.1
                            )
                          }
                        }}
                      >
                        {pinCopied ? <CheckIcon sx={{ fontSize: { xs: 14, sm: 16 } }} /> : <ContentCopy sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      </IconButton>
                    </Tooltip>
                  }
                  onDelete={() => {}}
                />
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Countdown Banner */}
      <Container maxWidth='lg' sx={{ mt: 3, overflow: 'hidden' }}>
        <Alert
          severity={countdownColor === 'error.main' ? 'error' : countdownColor === 'warning.main' ? 'warning' : 'info'}
          icon={false}
          sx={{
            mb: 4,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            alignItems: 'center',
            animation: `${blink} 1s infinite`,
            overflow: 'hidden',
            bgcolor: alpha(
              countdownColor === 'error.main'
                ? theme.palette.error.main
                : countdownColor === 'warning.main'
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
              theme.palette.mode === 'dark' ? 0.2 : 0.1
            ),
            border: `2px solid ${alpha(
              countdownColor === 'error.main'
                ? theme.palette.error.main
                : countdownColor === 'warning.main'
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
              0.4
            )}`,
            '& .MuiAlert-message': {
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden'
            }
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, md: 2 },
              flexWrap: 'wrap',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <Box
              component='span'
              sx={{
                animation: `${pulse} 1s infinite`,
                display: 'inline-flex',
                flexShrink: 0
              }}
            >
              <AccessTime fontSize='large' />
            </Box>
            <Box
              component='span'
              sx={{
                textAlign: 'center',
                flexShrink: 0,
                fontWeight: 600,
                fontSize: { xs: '0.9rem', md: '1rem' },
                color:
                  countdownColor === 'error.main'
                    ? theme.palette.error.dark
                    : countdownColor === 'warning.main'
                      ? theme.palette.warning.dark
                      : theme.palette.info.dark
              }}
            >
              The game will start automatically in:
            </Box>
            <Box
              component='span'
              sx={{
                px: { xs: 2, md: 2.5 },
                py: { xs: 0.75, md: 1 },
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.15)
                    : alpha(theme.palette.common.white, 0.9),
                borderRadius: 2,
                width: { xs: '120px', sm: '160px' },
                minWidth: { xs: '120px', sm: '160px' },
                textAlign: 'center',
                fontWeight: 900,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color:
                  countdownColor === 'error.main'
                    ? theme.palette.error.dark
                    : countdownColor === 'warning.main'
                      ? theme.palette.warning.dark
                      : theme.palette.info.dark
              }}
            >
              {timeRemaining}
            </Box>
          </Box>
        </Alert>
      </Container>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Grid container spacing={4}>
          {/* Left Column - Game Media */}
          <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 8px 24px rgba(0,0,0,0.08)',
                bgcolor: theme.palette.background.paper
              }}
            >
              {game.promotionalVideoUrl ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '56.25%', // 16:9 aspect ratio
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    overflow: 'hidden',
                    borderRadius: 1
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <ReactPlayer
                      url={game.promotionalVideoUrl}
                      width='100%'
                      height='100%'
                      controls
                      onReady={() => setIsVideoReady(true)}
                      playing={false}
                      config={{
                        youtube: {
                          playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0
                          }
                        },
                        file: {
                          attributes: {
                            controlsList: 'nodownload'
                          }
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <CardMedia
                  component='img'
                  image={game.thumbnailPoster}
                  alt={game.title}
                  sx={{
                    width: '100%',
                    height: { xs: 'auto', md: 400 },
                    maxHeight: { xs: '300px', md: '400px' },
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              )}
            </Card>

            {/* Game Instructions */}
            <Card
              sx={{
                mt: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
                bgcolor: theme.palette.background.paper,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    Game Instructions
                  </Typography>

                  <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

                  <Box component='ul' sx={{ pl: 5, mb: 1, listStyle: 'none', '& li': { mb: 2 } }}>
                    {[
                      'The game will start automatically when the countdown reaches zero.',
                      'All players must be ready when the game begins.',
                      'Questions will appear one after another with limited time to answer.',
                      'Answer quickly and accurately to score maximum points.',
                      <Box
                        key='pin'
                        component='li'
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'text.primary', flex: 1, minWidth: 200 }}
                        >
                          The game PIN is <strong>{game.pin}</strong> - share it with friends to join.
                        </Typography>
                        <Tooltip placement='top' title={copyTooltip} arrow>
                          <IconButton
                            onClick={handleCopyPin}
                            size='small'
                            sx={{
                              bgcolor: alpha(
                                pinCopied ? theme.palette.success.main : theme.palette.primary.main,
                                theme.palette.mode === 'dark' ? 0.2 : 0.1
                              ),
                              color: pinCopied ? theme.palette.success.main : theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(
                                  pinCopied ? theme.palette.success.main : theme.palette.primary.main,
                                  theme.palette.mode === 'dark' ? 0.3 : 0.2
                                )
                              }
                            }}
                          >
                            {pinCopied ? <CheckIcon fontSize='small' /> : <ContentCopy fontSize='small' />}
                          </IconButton>
                        </Tooltip>
                      </Box>,
                      'Winners will be announced immediately after the game ends.'
                    ].map((instruction, index) =>
                      typeof instruction === 'string' ? (
                        <Typography
                          key={index}
                          component='li'
                          variant='body2'
                          sx={{
                            fontSize: '0.9rem',
                            lineHeight: 1.7,
                            color: 'text.primary',
                            position: 'relative',
                            '&::before': {
                              content: '"•"',
                              position: 'absolute',
                              left: -20,
                              color: theme.palette.primary.main,
                              fontWeight: 'bold',
                              fontSize: '1.2rem'
                            }
                          }}
                        >
                          {instruction}
                        </Typography>
                      ) : (
                        instruction
                      )
                    )}
                  </Box>

                  {/* Pro Tip */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                    }}
                  >
                    <Typography variant='body2' sx={{ fontStyle: 'italic', color: 'text.primary', fontWeight: 500 }}>
                      💡 Pro Tip: Stay focused and avoid refreshing the page once the game starts.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Game Info */}
          <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
            <Card
              sx={{
                position: 'sticky',
                top: 20,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 8px 24px rgba(0,0,0,0.08)',
                bgcolor: theme.palette.background.paper,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  {/* Game Title and Share */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant='h5'
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          color: 'text.primary',
                          flex: 1,
                          pr: 1
                        }}
                      >
                        {game.title}
                      </Typography>
                      <Tooltip title='Share game' arrow>
                        <IconButton
                          size='small'
                          onClick={() => setSharePopupOpen(true)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            color: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
                            }
                          }}
                        >
                          <ShareIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      spacing={1}
                      flexWrap='wrap'
                      gap={1}
                    >
                      {getStatusChip()}
                    </Stack>
                  </Box>

                  <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

                  {/* Game Duration */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      Game Duration
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <AccessTime sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {game?.forwardType === 'admin' && game?.status !== 'completed'
                          ? 'Decides by Question Forwarding Admin'
                          : `${Math.floor(game?.duration / 60)} minutes`}
                      </Typography>
                    </Stack>
                    <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      Starting at {format(new Date(game.startTime), 'h:mm a')}
                    </Typography>
                  </Box>

                  {/* Players Information */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      Players
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <People sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Typography variant='body1' sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {game.registeredUsers?.length || 0} players ready
                      </Typography>
                    </Stack>
                    {game.maxPlayers && (
                      <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                        Max players: {game.maxPlayers}
                      </Typography>
                    )}
                  </Box>

                  {/* Location */}
                  {game.location && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          fontSize: '0.7rem',
                          mb: 1,
                          display: 'block'
                        }}
                      >
                        Location
                      </Typography>
                      <Stack direction='row' alignItems='center' spacing={1.5}>
                        <LocationOn sx={{ color: 'info.main', fontSize: 20 }} />
                        <Typography variant='body1' sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {[game.location.city, game.location.region, game.location.country]
                            .filter(Boolean)
                            .join(', ') || 'Not Specified'}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* Creator Info */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      Created By
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Person sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant='body1' sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {game.creatorEmail}
                      </Typography>
                    </Stack>
                    <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      Created {formatDistanceToNow(new Date(game.createdAt))} ago
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <ShareGamePopup open={sharePopupOpen} onClose={() => setSharePopupOpen(false)} game={game} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default PlayGameInfoScreen
