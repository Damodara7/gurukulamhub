'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Alert,
  AlertTitle,
  alpha
} from '@mui/material'

import { format } from 'date-fns'
import ReactPlayer from 'react-player'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'
import Language from '@mui/icons-material/Language'
import ShareGamePopup from '@components/public-games/all-games/ShareGamePopup'
import {
  AccessTime,
  LocationOn,
  NotInterested,
  People,
  Person,
  PlayCircle,
  SportsEsports,
  Star,
  AttachMoney,
  CardGiftcard,
  ContentCopy,
  Share as ShareIcon,
  Group as GroupIcon,
  Cake as CakeIcon,
  EmojiEvents
} from '@mui/icons-material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import CancelIcon from '@mui/icons-material/Cancel'
import RewardSponsorCard from '@/components/apps/games/game-details/RewardSponsorsList'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import FallBackCard from '@/components/apps/games/FallBackCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import Leaderboard from '../play-game/Leaderboard'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { getGameStartDisplay } from '@/utils/formatGameVenueTime'

const ViewDetails = ({ game }) => {
  const theme = useTheme()
  const [copyTooltip, setCopyTooltip] = useState('Copy PIN')
  const [expandedReward, setExpandedReward] = useState(null)
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const [currentUsergroupIds, setCurrentUsergroupIds] = useState([])
  const [isRestricted, setIsRestricted] = useState(false)

  // Compute restriction show message
  useEffect(() => {
    const fetchAndCompute = async () => {
      try {
        if (!game?.groupId) {
          setIsRestricted(false)
          return
        }
        if (!session?.user?.email) return
        const res = await RestApi.get(`${API_URLS.v0.USER}?isVerified=true`)
        if (res?.status === 'success' && res.result) {
          const users = Array.isArray(res.result) ? res.result : [res.result]
          const user = users.find(u => u.email === session.user.email)
          const groupIds = (user?.groupIds || []).map(g => g?._id?.toString?.() || g?.toString?.() || g)
          setCurrentUsergroupIds(groupIds)
          const groupIdStr = (game.groupId?._id || game.groupId).toString()
          setIsRestricted(!groupIds.includes(groupIdStr))
        }
      } catch (e) {
        // noop
      }
    }
    fetchAndCompute()
  }, [game?.groupId, session?.user?.email])

  const handleCopyPin = () => {
    navigator.clipboard.writeText(game.pin)
    setCopyTooltip('Copied!')
    setTimeout(() => setCopyTooltip('Copy PIN'), 2000)
  }

  // Early return after all hooks
  if (!game) {
    return (
      <Box
        sx={{
          flex: 1,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <FallBackCard content='Games are not available' path='/public-games' btnText='Back To Public Games' />
      </Box>
    )
  }

  const startDisplay = getGameStartDisplay(game.startTime, game)

  const getStatusChip = () => {
    const statusConfig = {
      created: { color: 'default', label: 'Pending', icon: <AccessTime fontSize='small' /> },
      approved: { color: 'info', label: 'Approved', icon: <AccessTime fontSize='small' /> },
      lobby: { color: 'warning', label: 'Lobby', icon: <People fontSize='small' /> },
      live: { color: 'error', label: 'LIVE', icon: <PlayCircle fontSize='small' /> },
      completed: { color: 'success', label: 'Completed', icon: <SportsEsports fontSize='small' /> },
      cancelled: { color: 'error', label: 'Cancelled', icon: <CancelIcon fontSize='small' /> }
    }

    const config = statusConfig[game.status] || statusConfig.created
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size='small'
        sx={{
          bgcolor: alpha(theme.palette[config.color].main, 0.1),
          color: theme.palette[config.color].main,
          fontWeight: 700,
          fontSize: '0.75rem',
          border: `2px solid ${alpha(theme.palette[config.color].main, 0.3)}`,
          '& .MuiChip-icon': {
            color: theme.palette[config.color].main
          }
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.default',
        pb: { xs: 4, sm: 6, md: 8 },
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          pb: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth='lg' sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={{ xs: 1.5, sm: 2, md: 2 }}>
            {/* Back Button and Expand/Collapse */}
            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
              <Button
                variant='outlined'
                startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                onClick={() => router.push('/public-games')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  gap: 0.5,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 0.5, sm: 0.75 },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                Back to Public Games
              </Button>
              <IconButton
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size='small'
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'text.primary'
                  }
                }}
              >
                {isHeaderCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Stack>

            {/* Title */}
            <Typography
              variant='h3'
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
                color: 'text.primary',
                lineHeight: 1.3
              }}
            >
              {game.title}
            </Typography>

            {/* Collapsible Content */}
            {!isHeaderCollapsed && (
              <>
                {/* Status & Actions */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexWrap='wrap'
                  gap={{ xs: 1, sm: 1.5 }}
                >
                  {getStatusChip()}

                  <Stack
                    direction='row'
                    spacing={{ xs: 0.75, sm: 1.5 }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                    flexWrap='wrap'
                  >
                    {game.pin && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 0.5, sm: 0.75 },
                          px: { xs: 1.25, sm: 1.5 },
                          py: { xs: 0.5, sm: 0.75 },
                          borderRadius: 2,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.05)
                              : alpha(theme.palette.common.black, 0.03),
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      >
                        <Typography
                          variant='body2'
                          fontWeight={600}
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }}
                        >
                          PIN: {game.pin}
                        </Typography>
                        <Tooltip title={copyTooltip}>
                          <IconButton
                            onClick={handleCopyPin}
                            size='small'
                            sx={{
                              p: 0.4,
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'text.primary'
                              }
                            }}
                          >
                            <ContentCopy sx={{ fontSize: { xs: 13, sm: 15 } }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    <Button
                      variant='outlined'
                      startIcon={<ShareIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      onClick={() => setSharePopupOpen(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        px: { xs: 1.25, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}
                    >
                      Share
                    </Button>
                  </Stack>
                </Stack>

                {/* Description */}
                {game?.description && (
                  <Typography
                    variant='body1'
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      maxWidth: '900px'
                    }}
                  >
                    {game.description}
                  </Typography>
                )}

                {/* Quick Info Bar */}
                <Stack
                  direction='row'
                  spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                  flexWrap='wrap'
                  sx={{ pt: { xs: 0.25, sm: 0.5 } }}
                >
                  <Stack direction='row' spacing={{ xs: 0.6, sm: 0.75 }} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        borderRadius: 1.25,
                        bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AccessTime sx={{ fontSize: { xs: 14, sm: 16 }, color: 'info.main' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.6rem', sm: '0.65rem' }
                        }}
                      >
                        {startDisplay.label.toUpperCase()}
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        {startDisplay.shortText}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction='row' spacing={{ xs: 0.6, sm: 0.75 }} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        borderRadius: 1.25,
                        bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <People sx={{ fontSize: { xs: 14, sm: 16 }, color: 'secondary.main' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.6rem', sm: '0.65rem' }
                        }}
                      >
                        PLAYERS
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        {game?.registeredUsers?.length || 0} / {game?.maxPlayers || '∞'}
                      </Typography>
                    </Box>
                  </Stack>

                  {game.location && (
                    <Stack direction='row' spacing={{ xs: 0.6, sm: 0.75 }} alignItems='center'>
                      <Box
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          borderRadius: 1.25,
                          bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LocationOn sx={{ fontSize: { xs: 14, sm: 16 }, color: 'warning.main' }} />
                      </Box>
                      <Box>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.6rem', sm: '0.65rem' }
                          }}
                        >
                          LOCATION
                        </Typography>
                        <Typography
                          variant='body2'
                          fontWeight={600}
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
                          }}
                        >
                          {game?.location?.city || game?.location?.region || game?.location?.country || 'Anywhere'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}

                  <Stack direction='row' spacing={{ xs: 0.6, sm: 0.75 }} alignItems='center'>
                    <Box
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        borderRadius: 1.25,
                        bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: { xs: 14, sm: 16 }, color: 'success.main' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.6rem', sm: '0.65rem' }
                        }}
                      >
                        POINTS
                      </Typography>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        {Number(game?.totalPoints || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          mt: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          overflow: 'auto'
        }}
      >
        {/* Group Restriction Alert */}
        {isRestricted && (
          <Alert
            severity='warning'
            variant='outlined'
            sx={{
              mb: { xs: 3, sm: 4 },
              borderRadius: 3,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <AlertTitle
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                mb: 1
              }}
            >
              Restricted to Group {game?.groupId?.groupName && `- ${game.groupId.groupName}`}
            </AlertTitle>
            <Typography
              variant='body2'
              sx={{
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              You are not allowed to register or join this game.
            </Typography>

            <Typography
              variant='subtitle2'
              fontWeight={600}
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              <GroupIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              Group Requirements
            </Typography>

            <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {game.groupId?.ageGroup?.min != null && game.groupId?.ageGroup?.max != null && (
                <Chip
                  icon={<CakeIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                  label={`Age: ${game.groupId.ageGroup.min}-${game.groupId.ageGroup.max}`}
                  size='small'
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                    color: 'info.main',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}

              {game.groupId?.location &&
                (() => {
                  const locationParts = []
                  if (game.groupId.location.country) locationParts.push(game.groupId.location.country)
                  if (game.groupId.location.region) locationParts.push(game.groupId.location.region)
                  if (game.groupId.location.city) locationParts.push(game.groupId.location.city)

                  return locationParts.length > 0 ? (
                    <Chip
                      icon={<LocationOn sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                      label={locationParts.join(', ')}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                        color: 'warning.main',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    />
                  ) : null
                })()}

              {game.groupId?.gender && Array.isArray(game.groupId.gender) && game.groupId.gender.length > 0 && (
                <Chip
                  icon={<Person sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                  label={game.groupId.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
                  size='small'
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                    color: 'success.main',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}
            </Stack>
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={{ xs: 3, sm: 3.5, md: 4 }}>
              {/* Promotional Video */}
              {game.promotionalVideoUrl && (
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 3, md: 4 },
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
                    <ReactPlayer
                      url={game.promotionalVideoUrl}
                      width='100%'
                      height='100%'
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      controls
                      playing={false}
                    />
                  </Box>
                </Card>
              )}

              {/* Quiz Details Card */}
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow:
                    theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
                  <Stack spacing={{ xs: 2.5, sm: 3 }}>
                    {/* Quiz Header */}
                    <Box>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent='space-between'
                        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                        flexWrap='wrap'
                        gap={2}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant='overline'
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              letterSpacing: 1.5,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                          >
                            QUIZ INFORMATION
                          </Typography>
                          <Typography
                            variant='h5'
                            fontWeight={700}
                            sx={{
                              color: 'text.primary',
                              mt: 0.5,
                              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                            }}
                          >
                            {game?.quiz?.title || 'Quiz Title'}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<Language sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                          label={game?.quiz?.language?.name || 'Not specified'}
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            color: 'info.main',
                            fontWeight: 600,
                            border: 'none',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            '& .MuiChip-icon': { color: 'info.main' }
                          }}
                        />
                      </Stack>
                    </Box>

                    <Divider sx={{ opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3 }} />

                    {/* Description */}
                    <Box>
                      <Typography
                        variant='subtitle1'
                        fontWeight={700}
                        gutterBottom
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.95rem', sm: '1rem' }
                        }}
                      >
                        Description
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.875rem', sm: '0.95rem' }
                        }}
                      >
                        {game?.quiz?.details || 'No details provided'}
                      </Typography>
                    </Box>

                    {/* Course Links */}
                    {game?.quiz?.courseLinks?.length > 0 && (
                      <>
                        <Divider sx={{ opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3 }} />
                        <Box>
                          <Typography
                            variant='subtitle1'
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.95rem', sm: '1rem' }
                            }}
                          >
                            Course Links
                          </Typography>
                          <Stack spacing={{ xs: 1.5, sm: 2 }}>
                            {game.quiz.courseLinks.map((link, index) => (
                              <Box key={index}>
                                <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                                <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}

                    {/* Documents */}
                    {game?.quiz?.documents?.length > 0 && (
                      <>
                        <Divider sx={{ opacity: theme.palette.mode === 'dark' ? 0.2 : 0.3 }} />
                        <Box>
                          <Typography
                            variant='subtitle1'
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.95rem', sm: '1rem' }
                            }}
                          >
                            Documents
                          </Typography>
                          <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
                            {game.quiz.documents.map((document, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  alignItems: { xs: 'flex-start', sm: 'center' },
                                  justifyContent: 'space-between',
                                  p: { xs: 1.5, sm: 2 },
                                  borderRadius: 2,
                                  bgcolor:
                                    theme.palette.mode === 'dark'
                                      ? alpha(theme.palette.common.white, 0.05)
                                      : alpha(theme.palette.common.black, 0.02),
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  gap: { xs: 1, sm: 0 }
                                }}
                              >
                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: 'text.primary',
                                    flex: 1,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                  }}
                                >
                                  {`Document ${index + 1}: ${document.description}`}
                                </Typography>
                                <Button
                                  component={Link}
                                  href={document?.document || ''}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  variant='outlined'
                                  size='small'
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    px: { xs: 1.5, sm: 2 },
                                    minWidth: { xs: '100%', sm: 'auto' }
                                  }}
                                >
                                  View
                                </Button>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ position: { md: 'sticky' }, top: 20 }}>
              {/* Schedule Card */}
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow:
                    theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={{ xs: 2.5, sm: 3 }}>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Schedule & Details
                    </Typography>

                    <Stack spacing={{ xs: 2, sm: 2.5 }}>
                      {/* Start Time */}
                      <Stack direction='row' alignItems='center' spacing={{ xs: 1.5, sm: 2 }}>
                        <Box
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <AccessTime sx={{ fontSize: { xs: 18, sm: 20 }, color: 'info.main' }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                          >
                            {startDisplay.label}
                          </Typography>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {startDisplay.dateText}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {startDisplay.timeText}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Duration */}
                      <Stack direction='row' alignItems='center' spacing={{ xs: 1.5, sm: 2 }}>
                        <Box
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <AccessTime sx={{ fontSize: { xs: 18, sm: 20 }, color: 'success.main' }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                          >
                            Duration
                          </Typography>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {game?.forwardType === 'admin' && game?.status !== 'completed'
                              ? 'Admin controlled'
                              : `${Math.floor(game?.duration / 60)} minutes`}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Players */}
                      <Stack direction='row' alignItems='center' spacing={{ xs: 1.5, sm: 2 }}>
                        <Box
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <People sx={{ fontSize: { xs: 18, sm: 20 }, color: 'secondary.main' }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.65rem', sm: '0.7rem' }
                            }}
                          >
                            Registered
                          </Typography>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {game?.registeredUsers?.length || 0} / {game?.maxPlayers || '∞'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Registration Deadline */}
                      {game?.requireRegistration && (
                        <Stack direction='row' alignItems='center' spacing={{ xs: 1.5, sm: 2 }}>
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <AccessTime sx={{ fontSize: { xs: 18, sm: 20 }, color: 'warning.main' }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant='caption'
                              sx={{
                                color: 'text.secondary',
                                fontSize: { xs: '0.65rem', sm: '0.7rem' }
                              }}
                            >
                              Registration Closes
                            </Typography>
                            <Typography
                              variant='body2'
                              fontWeight={600}
                              sx={{
                                color: 'text.primary',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              {format(new Date(game.registrationEndTime), 'MMM d, h:mm a')}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Organizer Card */}
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3, md: 4 },
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow:
                    theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Organizer
                    </Typography>

                    <Stack direction='row' alignItems='center' spacing={{ xs: 1.5, sm: 2 }}>
                      <Avatar
                        sx={{
                          width: { xs: 44, sm: 48 },
                          height: { xs: 44, sm: 48 },
                          bgcolor: theme.palette.primary.main,
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' },
                          flexShrink: 0
                        }}
                      >
                        {game?.creatorEmail?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant='body1'
                          fontWeight={600}
                          sx={{
                            color: 'text.primary',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {game?.creatorEmail}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          Created on {format(new Date(game?.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Rewards Card */}
              {game?.rewards?.length > 0 && (
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 3, md: 4 },
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack spacing={2}>
                      <Typography
                        variant='h6'
                        fontWeight={700}
                        sx={{
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        <EmojiEvents sx={{ fontSize: { xs: 20, sm: 22 }, color: 'warning.main' }} /> Rewards
                      </Typography>

                      <Stack spacing={{ xs: 1.5, sm: 2 }}>
                        {game.rewards
                          .sort((a, b) => a.position - b.position)
                          .map(reward => (
                            <Box
                              key={reward.position}
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                borderRadius: 2,
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.common.white, 0.05)
                                    : alpha(theme.palette.common.black, 0.02),
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Stack direction='row' alignItems='center' spacing={{ xs: 1, sm: 1.5 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: positionColors[reward.position],
                                      width: { xs: 28, sm: 32 },
                                      height: { xs: 28, sm: 32 },
                                      fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                      fontWeight: 700,
                                      flexShrink: 0
                                    }}
                                  >
                                    {getOrdinalSuffix(reward.position)}
                                  </Avatar>
                                  <Typography
                                    variant='subtitle2'
                                    fontWeight={600}
                                    sx={{
                                      color: 'text.primary',
                                      fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }}
                                  >
                                    {reward.numberOfWinnersForThisPosition} Winner
                                    {reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                                  </Typography>
                                </Stack>

                                {reward.sponsors[0]?.rewardDetails?.rewardType === 'cash' ? (
                                  <Stack direction='row' alignItems='center' spacing={0.5}>
                                    <AttachMoney sx={{ fontSize: { xs: 16, sm: 18 }, color: 'success.main' }} />
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                      }}
                                    >
                                      {reward.rewardValuePerWinner}{' '}
                                      {reward.sponsors[0]?.rewardDetails?.currency || 'INR'}
                                    </Typography>
                                  </Stack>
                                ) : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift' ? (
                                  <Stack direction='row' alignItems='center' spacing={0.5}>
                                    <CardGiftcard sx={{ fontSize: { xs: 16, sm: 18 }, color: 'warning.main' }} />
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        color: 'text.secondary',
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                      }}
                                    >
                                      {reward.sponsors[0]?.rewardDetails?.nonCashReward}
                                    </Typography>
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: { xs: '0.875rem', sm: '1rem' }
                                    }}
                                  >
                                    Custom Reward
                                  </Typography>
                                )}

                                {reward.sponsors?.length > 0 && (
                                  <>
                                    <Button
                                      size='small'
                                      endIcon={
                                        expandedReward === reward.position ? <ExpandLessIcon /> : <ExpandMoreIcon />
                                      }
                                      onClick={() =>
                                        setExpandedReward(expandedReward === reward.position ? null : reward.position)
                                      }
                                      sx={{
                                        justifyContent: 'flex-start',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        px: { xs: 1, sm: 1.5 }
                                      }}
                                    >
                                      {expandedReward === reward.position ? 'Hide' : 'View'} Sponsors
                                    </Button>

                                    {expandedReward === reward.position && (
                                      <Box sx={{ pt: 1 }}>
                                        <RewardSponsorCard sponsors={reward.sponsors} />
                                      </Box>
                                    )}
                                  </>
                                )}
                              </Stack>
                            </Box>
                          ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {game?.tags?.length > 0 && (
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 3, md: 4 },
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow:
                      theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Typography
                      variant='h6'
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      Tags
                    </Typography>
                    <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {game.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size='small'
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            border: 'none',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Leaderboard - If Completed */}
        {game.status === 'completed' && (
          <Card
            sx={{
              mt: { xs: 4, sm: 5, md: 6 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                borderBottom: `3px solid ${theme.palette.success.main}`,
                p: { xs: 3, sm: 3.5, md: 4 },
                textAlign: 'center'
              }}
            >
              <Typography
                variant='h4'
                fontWeight={800}
                sx={{
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: 1, sm: 2 },
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  flexWrap: 'wrap'
                }}
              >
                <Box component='span' sx={{ fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' } }}>
                  🏁
                </Box>
                Competition Ended
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                View the final standings below
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Leaderboard width='100%' game={game} />
            </Box>
          </Card>
        )}
      </Box>

      <ShareGamePopup open={sharePopupOpen} onClose={() => setSharePopupOpen(false)} game={game} />
    </Box>
  )
}

export default ViewDetails

const positionColors = {
  1: '#ffd700', // Gold
  2: '#c0c0c0', // Silver
  3: '#cd7f32', // Bronze
  4: '#a0a0a0',
  5: '#808080'
}

function getOrdinalSuffix(number) {
  const j = number % 10,
    k = number % 100
  if (j === 1 && k !== 11) return number + 'st'
  if (j === 2 && k !== 12) return number + 'nd'
  if (j === 3 && k !== 13) return number + 'rd'
  return number + 'th'
}
