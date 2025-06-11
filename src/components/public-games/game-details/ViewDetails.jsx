'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
  Avatar
} from '@mui/material'

import { format } from 'date-fns'
import ReactPlayer from 'react-player'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'
import Language from '@mui/icons-material/Language'
import {
  AccessTime,
  ListAlt,
  LocationOn,
  NotInterested,
  People,
  Person,
  PlayCircle,
  SportsEsports,
  Star,
  PeopleAlt,
  AttachMoney,
  CardGiftcard
} from '@mui/icons-material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '@/components/ImagePopup'
import CancelIcon from '@mui/icons-material/Cancel'

import Link from 'next/link'
const ViewDetails = ({ game }) => {
  const theme = useTheme()
  console.log('we are getting game data', game)
  if (!game) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Typography variant='h6'>Game not found</Typography>
      </Container>
    )
  }
  console.log('game data', game);
  const getStatusChip = () => {
    const statusConfig = {
      created: { color: 'default', label: 'Pending', icon: <AccessTime /> },
      approved: { color: 'info', label: 'Approved', icon: <AccessTime /> },
      lobby: { color: 'warning', label: 'Lobby', icon: <AccessTime /> },
      live: { color: 'error', label: 'Live', icon: <PlayCircle /> },
      completed: { color: 'success', label: 'Completed', icon: <SportsEsports /> },
      cancelled: { color: 'error', label: 'Cancelled', icon: <CancelIcon /> }
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
  
  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'flex-start'
        }}
      >
        {/* Left Column - Main Details will reorder on small screens */}
        <Box
          sx={{
            flex: { md: 2 }, // Takes 2/3 space on desktop
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            order: { xs: 1, md: 1 }
          }}
        >
          <Card sx={{ borderRadius: 2, order: 1, p: 3 }}>
            <Stack spacing={3}>
              {/* Title and Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h4' fontWeight={700}>
                  {game.title}
                </Typography>
                <Stack direction='row' alignItems='center' spacing={3}>
                  {getStatusChip()}
                  <Typography variant='body2' color='text.primary'>
                    PIN: {game.pin}
                  </Typography>
                </Stack>
              </Box>

              <Stack>
                {game.promotionalVideoUrl && (
                  <Card sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ position: 'relative', pt: '56.25%' }}>
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
              </Stack>
            </Stack>
          </Card>
          {/* Quiz Details */}
          <Card sx={{ borderRadius: 2, p: 3, order: { md: 2 }, display: { xs: 'none', md: 'block' } }}>
            <CardContent>
              {/* Main Game Title Banner */} {/* Quiz Language */}
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  mt: -7,
                  mb: 1,
                  p: 2,
                  borderRadius: 1
                }}
              >
                <Typography variant='h4' fontWeight={700} color='primary.contrastText'>
                  Game on the Quiz
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    mt: 1
                  }}
                >
                  <Typography
                    variant='h5'
                    fontWeight={600}
                    sx={{
                      display: 'inline-block',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    {game?.quiz?.title || 'Quiz Title'}
                  </Typography>
                  <Chip
                    label={game?.quiz?.language?.name || 'Not specified'}
                    variant='outlined'
                    color='success'
                    icon={<Language />}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 500,
                      borderWidth: 2,
                      '& .MuiChip-icon': {
                        color: 'success.main'
                      }
                    }}
                  />
                </Box>
              </Box>
              <Stack spacing={3}>
                {/* Quiz Details */}
                <Typography variant='h6' fontWeight={600}>
                  Details
                </Typography>
                <Typography>{game?.quiz?.details || 'No details provided'}</Typography>
              </Stack>
            </CardContent>
            <Grid item xs={12}>
              <ChevronToggleComponent
                heading={'Course Links:'}
                minimizedSubHeading={'Click the chevron to view course links'}
              >
                {game?.quiz?.courseLinks?.length > 0 ? (
                  <Box className='flex flex-col gap-4'>
                    {game?.quiz?.courseLinks?.map((link, index) => (
                      <Box key={index} className='flex flex-col gap-1 items-start'>
                        <Box className='flex flex-col gap-1 items-center'>
                          <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                          <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color='error'>No course links exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
            <Grid item xs={12}>
              <ChevronToggleComponent
                heading={'Documents:'}
                minimizedSubHeading={'Click the chevron to view documents'}
              >
                {game?.quiz?.documents?.length > 0 ? (
                  game?.quiz?.documents?.map((document, index) => (
                    <Box key={index} display='flex' alignItems='center' gap={2} mb={1}>
                      <Typography variant='body2'>{`Document ${index + 1}: ${document?.description}`}</Typography>
                      <Link href={document?.document || ''} target='_blank' rel='noopener noreferrer'>
                        <Typography color='primary'>View Document</Typography>
                      </Link>
                    </Box>
                  ))
                ) : (
                  <Typography color='error'>No documents exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
          </Card>
        </Box>

        {/* Right Column - Additional Info */}
        <Box
          sx={{
            flex: { md: 1 },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            order: { xs: 2, md: 2 }
          }}
        >
          <Card sx={{ position: { md: 'sticky' }, p: 3, top: 20, borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={3}>
                {/* Location */}
                {game?.location && (
                  <>
                    <Typography variant='h6' fontWeight={600}>
                      Location
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <LocationOn color='primary' />
                        <Typography variant='body1'>
                          {[game?.location?.city, game?.location?.region, game?.location?.country]
                            .filter(Boolean)
                            .join(', ') || 'Not specified'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider />
                  </>
                )}
                <Stack spacing={2}>
                  {/* Start Time */}
                  <Box display='flex' alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ width: 130 }}>
                      Start Time:
                    </Typography>
                    <Box display='flex' alignItems='center' gap={1} sx={{ minWidth: 170 }}>
                      <AccessTime color='primary' fontSize='small' />
                      <Typography variant='body1' sx={{ fontSize: 'small' }}>
                        {format(new Date(game?.startTime), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Duration */}
                  <Box display='flex' alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ width: 130 }}>
                      Duration:
                    </Typography>
                    <Box display='flex' alignItems='center' gap={1} sx={{ minWidth: 170 }}>
                      <AccessTime color='primary' fontSize='small' />
                      <Typography variant='body1' sx={{ fontSize: 'small' }}>
                        {Math.floor(game?.duration / 60)} minutes
                      </Typography>
                    </Box>
                  </Box>

                  {/* Registration */}
                  <Box display='flex' alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ width: 130 }}>
                      Registration End Time:
                    </Typography>
                    <Box display='flex' alignItems='center' gap={1} sx={{ minWidth: 170 }}>
                      {game?.requireRegistration ? (
                        <Typography variant='body1' sx={{ fontSize: 'small' }}>
                          {game?.requireRegistration && (
                            <Box display='flex' alignItems='center' gap={1} sx={{ minWidth: 170 }}>
                              <AccessTime color='primary' fontSize='small' />
                              <Typography variant='body1' sx={{ fontSize: 'small' }}>
                                {format(new Date(game?.registrationEndTime), 'MMM d, yyyy h:mm a')}
                              </Typography>
                            </Box>
                          )}
                        </Typography>
                      ) : (
                        <>
                          <NotInterested color='secondary' fontSize='small' /> {/* Icon for no end time */}
                          <Typography variant='body1' sx={{ fontSize: 'small', color: 'text.secondary' }}>
                            No registration required
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Max Players */}
                  <Box display='flex' alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ width: 130 }}>
                      Registered Players:
                    </Typography>
                    <Box display='flex' alignItems='center' gap={1} sx={{ minWidth: 170 }}>
                      <People color='primary' />
                      <Typography variant='body1' sx={{ fontSize: 'small' }}>
                        {game?.registeredUsers?.length} / {game?.maxPlayers || 'Unlimited'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                <Divider />

                <Stack spacing={3}>
                  {/* Description */}
                  <Box>
                    <Typography variant='h6' gutterBottom fontWeight={600}>
                      Description
                    </Typography>
                    <Typography variant='body1' color='text.secondary'>
                      {game?.description}
                    </Typography>
                  </Box>
                  <Divider />
                  {/* Creator Info */}
                  <Box mt={3}>
                    <Typography variant='h6' fontWeight={600}>
                      Created By
                    </Typography>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <Person color='primary' />
                      <Typography variant='body1'>{game?.creatorEmail}</Typography>
                    </Stack>
                    <Typography variant='caption' color='text.secondary'>
                      Created on {format(new Date(game?.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                {/* Rewards */}
                <Box mt={3}>
                  <Typography variant='h6' fontWeight={600}>
                    Rewards
                  </Typography>
                  {game?.rewards?.length > 0 ? (
                    <Stack spacing={1.5} mt={1}>
                      {game.rewards?.sort((a, b) => a.position - b.position)?.map((reward) => (
                        <Box 
                          key={reward.position} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 1.5,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'action.hover'
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: positionColors[reward.position],
                              width: 32,
                              height: 32,
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {getOrdinalSuffix(reward.position)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
                              {reward.numberOfWinnersForThisPosition} Winner{reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                            </Typography>
                            {reward.sponsors[0]?.rewardDetails?.rewardType === 'cash' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AttachMoney fontSize='small' color='success' />
                                <Typography variant='body2'>
                                  Cash Prize: {reward.rewardValuePerWinner} {reward.sponsors[0]?.rewardDetails?.currency || 'INR'} (per winner)
                                </Typography>
                              </Box>
                            ) : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift' ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CardGiftcard fontSize='small' color='warning' />
                                  <Typography variant='body2'>
                                    Physical Gift: {reward.sponsors[0]?.rewardDetails?.nonCashReward}
                                  </Typography>
                                </Box>
                                <Typography variant='body2' color='text.secondary' sx={{ ml: 3 }}>
                                  Worth: {reward.sponsors[0]?.rewardDetails?.rewardValuePerItem || reward?.rewardValuePerWinner} {reward.sponsors[0]?.rewardDetails?.currency || 'INR'}
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Star fontSize='small' color='info' />
                                <Typography variant='body2'>
                                  Custom Reward
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>No rewards</Typography>
                  )}
                  <Typography variant='body2' color='text.secondary' mt={1}>
                    Winners declared: {game?.winnersDeclared ? 'Yes' : 'No'}
                  </Typography>

                  {game?.rewards?.map(reward => (
                    <Box key={reward._id} mt={3} p={2} border='1px solid #eee' borderRadius={2}>
                      <Typography variant='subtitle1' fontWeight={500}>
                        Position : {reward.position}
                      </Typography>

                      <Box ml={2} mt={1}>
                        <Typography variant='body1'>No of Winners : {reward.numberOfWinnersForThisPosition}</Typography>
                        <Typography variant='body1'>Reward : {reward.rewardValuePerWinner}</Typography>

                        {reward.sponsors?.map(sponsor => (
                          <Box key={sponsor._id} mt={2}>
                            <Typography variant='body2'>Reward Type: {sponsor.rewardDetails?.rewardType}</Typography>

                            {sponsor.rewardDetails?.rewardType === 'cash' && (
                              <Typography variant='body2'>
                                Amount: {sponsor.rewardDetails?.rewardValue} {sponsor.rewardDetails?.currency}
                              </Typography>
                            )}

                            {sponsor.rewardDetails?.rewardType === 'physicalGift' && (
                              <>
                                <Typography variant='body2'>Gift: {sponsor.rewardDetails?.nonCashReward}</Typography>
                                <Typography variant='body2'>
                                  Quantity: {sponsor.rewardDetails?.numberOfNonCashRewards}
                                </Typography>
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Divider />
              </Stack>

              {/* Tags */}
              {game?.tags?.length > 0 && (
                <>
                  <Typography mt={1} variant='h6' fontWeight={600}>
                    Tags
                  </Typography>
                  <Box mt={1} display='flex' flexWrap='wrap' alignItems='center'>
                    {game.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size='small'
                        color='primary'
                        variant='outlined'
                        sx={{ marginRight: 1, marginBottom: 1, marginTop: 1 }} // Horizontal and vertical spacing
                      />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
          <Card
            sx={{
              p: 3,
              display: { md: 'none' },
              borderRadius: 2
            }}
          >
            <CardContent>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  mt: -7,
                  mb: 1,
                  p: 2,
                  borderRadius: 1
                }}
              >
                <Typography variant='h4' fontWeight={700} color='primary.contrastText'>
                  Game on the Quiz
                </Typography>
                <Box sx={{ position: 'relative', width: '100%', mt: 1 }}>
                  <Typography
                    variant='h5'
                    fontWeight={600}
                    sx={{
                      display: 'inline-block',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    {game?.quiz?.title || 'Quiz Title'}
                  </Typography>
                  <Chip
                    label={game?.quiz?.language?.name || 'Not specified'}
                    variant='outlined'
                    color='success'
                    icon={<Language />}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 500,
                      borderWidth: 2,
                      '& .MuiChip-icon': {
                        color: 'success.main'
                      }
                    }}
                  />
                </Box>
              </Box>
              <Stack spacing={3}>
                {/* Quiz Details */}
                <Typography variant='h6' fontWeight={600}>
                  Details
                </Typography>
                <Typography>{game?.quiz?.details || 'No details provided'}</Typography>
              </Stack>
            </CardContent>
            <Grid item xs={12}>
              <ChevronToggleComponent
                heading={'Course Links:'}
                minimizedSubHeading={'Click the chevron to view course links'}
              >
                {game?.quiz?.courseLinks?.length > 0 ? (
                  <Box className='flex flex-col gap-4'>
                    {game?.quiz?.courseLinks?.map((link, index) => (
                      <Box key={index} className='flex flex-col gap-1 items-start'>
                        <Box className='flex flex-col gap-1 items-center'>
                          <VideoAd url={link?.link || ''} showPause autoPlay={false} />
                          <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color='error'>No course links exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
            <Grid item xs={12}>
              <ChevronToggleComponent
                heading={'Documents:'}
                minimizedSubHeading={'Click the chevron to view documents'}
              >
                {game?.quiz?.documents?.length > 0 ? (
                  game?.quiz?.documents?.map((document, index) => (
                    <Box key={index} display='flex' alignItems='center' gap={2} mb={1}>
                      <Typography variant='body2'>{`Document ${index + 1}: ${document?.description}`}</Typography>
                      <Link href={document?.document || ''} target='_blank' rel='noopener noreferrer'>
                        <Typography color='primary'>View Document</Typography>
                      </Link>
                    </Box>
                  ))
                ) : (
                  <Typography color='error'>No documents exist.</Typography>
                )}
              </ChevronToggleComponent>
            </Grid>
          </Card>
        </Box>
      </Box>
    </Container>
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