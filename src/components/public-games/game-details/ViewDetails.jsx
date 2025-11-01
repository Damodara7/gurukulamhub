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
import Leaderboard from '../play-game/Leaderboard'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const ViewDetails = ({ game }) => {
  const theme = useTheme()
  const [copyTooltip, setCopyTooltip] = useState('Copy PIN')
  const [expandedReward, setExpandedReward] = useState(null)
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
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
        const res = await RestApi.get(`${API_URLS.v0.USER}`)
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <FallBackCard content='Games are not available' path='/public-games' btnText='Back To Public Games' />
      </Box>
    )
  }

  const getStatusChip = () => {
    const statusConfig = {
      created: { color: 'default', label: 'Pending', icon: <AccessTime fontSize="small" /> },
      approved: { color: 'info', label: 'Approved', icon: <AccessTime fontSize="small" /> },
      lobby: { color: 'warning', label: 'Lobby', icon: <People fontSize="small" /> },
      live: { color: 'error', label: 'LIVE', icon: <PlayCircle fontSize="small" /> },
      completed: { color: 'success', label: 'Completed', icon: <SportsEsports fontSize="small" /> },
      cancelled: { color: 'error', label: 'Cancelled', icon: <CancelIcon fontSize="small" /> }
    }

    const config = statusConfig[game.status] || statusConfig.created
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 },
          borderBottom: '1px solid #e8eaed'
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {/* Title */}
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                color: '#202124',
                lineHeight: 1.3
              }}
            >
              {game.title}
            </Typography>

            {/* Status & Actions */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              {getStatusChip()}
              
              <Stack direction="row" spacing={2}>
                {game.pin && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: '#f5f6f7',
                      border: '1px solid #e8eaed'
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                      PIN: {game.pin}
                    </Typography>
                    <Tooltip title={copyTooltip}>
                      <IconButton onClick={handleCopyPin} size="small" sx={{ p: 0.5 }}>
                        <ContentCopy sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setSharePopupOpen(true)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Share
                </Button>
              </Stack>
            </Stack>

            {/* Description */}
            {game?.description && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.05rem',
                  color: '#5f6368',
                  lineHeight: 1.7,
                  maxWidth: '900px'
                }}
              >
                {game.description}
              </Typography>
            )}

            {/* Quick Info Bar */}
            <Stack direction="row" spacing={4} flexWrap="wrap" sx={{ pt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#e8f4fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccessTime sx={{ fontSize: 18, color: '#1976d2' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    STARTS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    {format(new Date(game.startTime), 'MMM d, h:mm a')}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#f3e5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <People sx={{ fontSize: 18, color: '#7b1fa2' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                    PLAYERS
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                    {game?.registeredUsers?.length || 0} / {game?.maxPlayers || '∞'}
                  </Typography>
                </Box>
              </Stack>
              
              {game.location && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: '#fff3e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <LocationOn sx={{ fontSize: 18, color: '#f57c00' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                      LOCATION
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#202124', fontSize: '0.875rem' }}>
                      {game?.location?.city || game?.location?.region || game?.location?.country || 'Anywhere'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Group Restriction Alert */}
        {isRestricted && (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              mb: 4,
              borderRadius: 3,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, fontSize: '1rem', mb: 1 }}>
              Restricted to Group {game?.groupId?.groupName && `- ${game.groupId.groupName}`}
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You are not allowed to register or join this game.
            </Typography>
            
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon fontSize="small" />
              Group Requirements
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {game.groupId?.ageGroup?.min != null && game.groupId?.ageGroup?.max != null && (
                <Chip
                  icon={<CakeIcon sx={{ fontSize: 14 }} />}
                  label={`Age: ${game.groupId.ageGroup.min}-${game.groupId.ageGroup.max}`}
                  size="small"
                  sx={{
                    bgcolor: '#e8f4fd',
                    color: '#0c5a9e',
                    border: 'none',
                    fontWeight: 600
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
                      icon={<LocationOn sx={{ fontSize: 14 }} />}
                      label={locationParts.join(', ')}
                      size="small"
                      sx={{
                        bgcolor: '#fff3e0',
                        color: '#e65100',
                        border: 'none',
                        fontWeight: 600
                      }}
                    />
                  ) : null
                })()}
              
              {game.groupId?.gender && Array.isArray(game.groupId.gender) && game.groupId.gender.length > 0 && (
                <Chip
                  icon={<Person sx={{ fontSize: 14 }} />}
                  label={game.groupId.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
                  size="small"
                  sx={{
                    bgcolor: '#e6f7ed',
                    color: '#0d7d3f',
                    border: 'none',
                    fontWeight: 600
                  }}
                />
              )}
            </Stack>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Promotional Video */}
              {game.promotionalVideoUrl && (
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
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
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={3}>
                    {/* Quiz Header */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Box>
                          <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                            QUIZ INFORMATION
                          </Typography>
                          <Typography variant="h5" fontWeight={700} sx={{ color: '#202124', mt: 0.5 }}>
                            {game?.quiz?.title || 'Quiz Title'}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<Language />}
                          label={game?.quiz?.language?.name || 'Not specified'}
                          sx={{
                            bgcolor: '#e8f4fd',
                            color: '#0c5a9e',
                            fontWeight: 600,
                            border: 'none',
                            '& .MuiChip-icon': { color: '#0c5a9e' }
                          }}
                        />
                      </Stack>
                    </Box>

                    <Divider sx={{ opacity: 0.3 }} />

                    {/* Description */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#202124' }}>
                        Description
                      </Typography>
                      <Typography sx={{ color: '#5f6368', lineHeight: 1.7, fontSize: '0.95rem' }}>
                        {game?.quiz?.details || 'No details provided'}
                      </Typography>
                    </Box>

                    {/* Course Links */}
                    {game?.quiz?.courseLinks?.length > 0 && (
                      <>
                        <Divider sx={{ opacity: 0.3 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#202124' }}>
                            Course Links
                          </Typography>
                          <Stack spacing={2}>
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
                        <Divider sx={{ opacity: 0.3 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#202124' }}>
                            Documents
                          </Typography>
                          <Stack spacing={1.5}>
                            {game.quiz.documents.map((document, index) => (
                              <Box 
                                key={index} 
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: '#fafbfc',
                                  border: '1px solid #e8eaed'
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#202124', flex: 1 }}>
                                  {`Document ${index + 1}: ${document.description}`}
                                </Typography>
                                <Button
                                  component={Link}
                                  href={document?.document || ''}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="outlined"
                                  size="small"
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
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
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 20 }}>
              {/* Schedule Card */}
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#202124' }}>
                      Schedule & Details
                    </Typography>

                    <Stack spacing={2.5}>
                      {/* Start Time */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#e8f4fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <AccessTime sx={{ fontSize: 20, color: '#1976d2' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                            Starts
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#202124' }}>
                            {format(new Date(game.startTime), 'MMM d, yyyy')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#5f6368' }}>
                            {format(new Date(game.startTime), 'h:mm a')}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Duration */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#e6f7ed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <AccessTime sx={{ fontSize: 20, color: '#2e7d32' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                            Duration
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#202124' }}>
                            {game?.forwardType === 'admin' && game?.status !== 'completed'
                              ? 'Admin controlled'
                              : `${Math.floor(game?.duration / 60)} minutes`}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Players */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#f3e5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <People sx={{ fontSize: 20, color: '#7b1fa2' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                            Registered
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#202124' }}>
                            {game?.registeredUsers?.length || 0} / {game?.maxPlayers || '∞'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Registration Deadline */}
                      {game?.requireRegistration && (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: '#fff3e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <AccessTime sx={{ fontSize: 20, color: '#f57c00' }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.7rem' }}>
                              Registration Closes
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#202124' }}>
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
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid #e8eaed',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#202124' }}>
                      Organizer
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.main,
                          fontWeight: 700,
                          fontSize: '1.25rem'
                        }}
                      >
                        {game?.creatorEmail?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600} sx={{ color: '#202124' }}>
                          {game?.creatorEmail}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#5f6368' }}>
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
                    borderRadius: 4,
                    bgcolor: 'white',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#202124', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ fontSize: 22, color: '#ffa000' }} /> Rewards
                      </Typography>

                      <Stack spacing={2}>
                        {game.rewards
                          .sort((a, b) => a.position - b.position)
                          .map(reward => (
                            <Box
                              key={reward.position}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#fafbfc',
                                border: '1px solid #e8eaed'
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar
                                    sx={{
                                      bgcolor: positionColors[reward.position],
                                      width: 32,
                                      height: 32,
                                      fontSize: '0.85rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    {getOrdinalSuffix(reward.position)}
                                  </Avatar>
                                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#202124' }}>
                                    {reward.numberOfWinnersForThisPosition} Winner{reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                                  </Typography>
                                </Stack>

                                {reward.sponsors[0]?.rewardDetails?.rewardType === 'cash' ? (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <AttachMoney fontSize="small" sx={{ color: '#2e7d32' }} />
                                    <Typography variant="body2" sx={{ color: '#5f6368' }}>
                                      {reward.rewardValuePerWinner} {reward.sponsors[0]?.rewardDetails?.currency || 'INR'}
                                    </Typography>
                                  </Stack>
                                ) : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift' ? (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CardGiftcard fontSize="small" sx={{ color: '#f57c00' }} />
                                    <Typography variant="body2" sx={{ color: '#5f6368' }}>
                                      {reward.sponsors[0]?.rewardDetails?.nonCashReward}
                                    </Typography>
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" sx={{ color: '#5f6368' }}>
                                    Custom Reward
                                  </Typography>
                                )}

                                {reward.sponsors?.length > 0 && (
                                  <>
                                    <Button
                                      size="small"
                                      endIcon={expandedReward === reward.position ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                      onClick={() => setExpandedReward(expandedReward === reward.position ? null : reward.position)}
                                      sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600 }}
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
                    borderRadius: 4,
                    bgcolor: 'white',
                    border: '1px solid #e8eaed',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#202124' }}>
                      Tags
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {game.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            border: 'none'
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
              mt: 6,
              borderRadius: 4,
              bgcolor: 'white',
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderBottom: `3px solid ${theme.palette.success.main}`,
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" fontWeight={800} sx={{ color: '#202124', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box component="span" sx={{ fontSize: '2.5rem' }}>🏁</Box>
                Competition Ended
              </Typography>
              <Typography sx={{ mt: 1, color: '#5f6368' }}>
                View the final standings below
              </Typography>
            </Box>
            <Box sx={{ p: 4 }}>
              <Leaderboard width="100%" game={game} />
            </Box>
          </Card>
        )}
      </Container>

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
