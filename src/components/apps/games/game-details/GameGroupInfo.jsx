'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  Grid,
  Divider,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Group as GroupIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const GameGroupInfo = ({ game }) => {
  const theme = useTheme()
  //   const [groupDetails, setGroupDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  //   useEffect(() => {
  //     if (game?.groupId?._id) {
  //       fetchGroupDetails()
  //     }
  //   }, [game?.groupId?._id])

  //   const fetchGroupDetails = async () => {
  //     setLoading(true)
  //     try {
  //       // Fetch the group details directly
  //       const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${game.groupId._id || game.groupId}`)
  //       if (res?.status === 'success' && res.result) {
  //         setGroupDetails(res.result)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching group details:', error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  if (!game?.groupId) return null

  //   const group = groupDetails || game.groupId
  const group = game.groupId

  console.log('group details: ', group)

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: '16px',
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: theme.palette.background.paper,
        border: '2px solid',
        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.3) : 'rgba(244, 67, 54, 0.2)'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant='h6'
          sx={{
            mb: { xs: 2, sm: 3 },
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.text.primary,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          <GroupIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.error.main }} />
          Group Information
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Group Details */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant='subtitle1'
                  fontWeight={600}
                  color='primary'
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={group.groupName || 'Private Group'}
                >
                  {group.groupName || 'Private Group'}
                </Typography>
                {group.description && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: { xs: 2, sm: 3 },
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {group.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  {group?.status === 'public' ? (
                    <Chip
                      icon={<PublicIcon sx={{ fontSize: 16 }} />}
                      label='Public Group'
                      variant='outlined'
                      size='small'
                      color='success'
                    />
                  ) : (
                    <Chip
                      icon={<LockIcon sx={{ fontSize: 16 }} />}
                      label='Private Group'
                      variant='outlined'
                      size='small'
                      color='warning'
                    />
                  )}
                </Box>
              </Box>

              {/* Group Filters */}
              <Box>
                <Typography
                  variant='subtitle2'
                  fontWeight={600}
                  sx={{
                    mb: 1,
                    fontSize: { xs: '0.85rem', sm: '0.875rem' }
                  }}
                >
                  Group Filters
                </Typography>
                {(() => {
                  const filterChips = []

                  if (group?.ageGroup?.min != null && group?.ageGroup?.max != null) {
                    filterChips.push(
                      <Chip
                        key='age'
                        icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                        label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`}
                        variant='outlined'
                        size='small'
                        color='primary'
                      />
                    )
                  }

                  if (group?.gender && Array.isArray(group.gender) && group.gender.length > 0) {
                    filterChips.push(
                      <Chip
                        key='gender'
                        icon={<PersonIcon sx={{ fontSize: 16 }} />}
                        label={`Gender: ${group.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`}
                        variant='outlined'
                        size='small'
                        color='success'
                      />
                    )
                  }

                  if (group?.location) {
                    const locationParts = []
                    if (group.location.country) locationParts.push(group.location.country)
                    if (group.location.region) locationParts.push(group.location.region)
                    if (group.location.city) locationParts.push(group.location.city)

                    if (locationParts.length > 0) {
                      filterChips.push(
                        <Chip
                          key='location'
                          icon={<LocationIcon sx={{ fontSize: 16 }} />}
                          label={`Location: ${locationParts.join(', ')}`}
                          variant='outlined'
                          size='small'
                          color='secondary'
                        />
                      )
                    }
                  }

                  return filterChips.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{filterChips}</Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                      No filters applied
                    </Typography>
                  )
                })()}
              </Box>
            </Stack>
          </Grid>

          {/* Group Members */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                Group Members ({group.membersCount || 0})
              </Typography>

              {loading ? (
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Loading group details...
                </Typography>
              ) : group.membersCount > 0 ? (
                <Box sx={{ maxHeight: { xs: 150, sm: 200 }, overflowY: 'auto' }}>
                  <Stack spacing={{ xs: 0.75, sm: 1 }}>
                    {group.members?.map((member, index) => (
                      <Box
                        key={member._id || index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: { xs: 0.75, sm: 1 },
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            mr: 1,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {member.profile?.firstname?.[0] || member.email?.[0] || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant='body2'
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={
                              member.profile?.firstname && member.profile?.lastname
                                ? `${member.profile?.firstname} ${member.profile?.lastname}`
                                : member.email
                            }
                          >
                            {member.profile?.firstname && member.profile?.lastname
                              ? `${member.profile?.firstname} ${member.profile?.lastname}`
                              : member.email}
                          </Typography>
                          {member.profile?.firstname && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                              title={member.email}
                            >
                              {member.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Alert severity='info' variant='outlined' sx={{ py: 0.5 }}>
                  <Typography variant='body2' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    No members found in this group
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

        {/* Access Note */}
        <Alert severity='error' variant='standard'>
          <AlertTitle sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Access Control</AlertTitle>
          <Typography variant='body2' sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            This game is restricted to members of the "{group.groupName || 'Private Group'}" group only. Users must be
            part of this group to register and participate in the game.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default GameGroupInfo
