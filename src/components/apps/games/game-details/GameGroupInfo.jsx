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
  AlertTitle
} from '@mui/material'
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
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupIcon color='primary' sx={{ mr: 1 }} />
          <Typography variant='h6' fontWeight={600}>
            Group Information
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Group Details */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant='subtitle1' fontWeight={600} color='primary'>
                  {group.groupName || 'Private Group'}
                </Typography>
                {group.description && (
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
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
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
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
                <Typography variant='body2' color='text.secondary'>
                  Loading group details...
                </Typography>
              ) : group.membersCount > 0 ? (
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  <Stack spacing={1}>
                    {group.members?.map((member, index) => (
                      <Box
                        key={member._id || index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                          {member.profile?.firstname?.[0] || member.email?.[0] || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant='body2' noWrap>
                            {member.profile?.firstname && member.profile?.lastname
                              ? `${member.profile?.firstname} ${member.profile?.lastname}`
                              : member.email}
                          </Typography>
                          {member.profile?.firstname && (
                            <Typography variant='caption' color='text.secondary' noWrap>
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
                  <Typography variant='body2'>No members found in this group</Typography>
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Access Note */}
        <Alert severity='error' variant='standard'>
          <AlertTitle>Access Control</AlertTitle>
          <Typography variant='body2'>
            This game is restricted to members of the "{group.groupName || 'Private Group'}" group only. Users must be
            part of this group to register and participate in the game.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default GameGroupInfo
