'use client'
import React, { useState, useEffect } from 'react'
import { Box, Typography, Chip, Avatar, Card, CardContent, Divider, Grid, Paper, Button } from '@mui/material'
import {
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  SportsEsports as GameIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

const AudiencedetailsPage = ({ audienceData, gamesData = [] }) => {
  // Debug: Log the received data structure
  console.log('AudienceDetailsPage - Received audienceData:', audienceData)
  console.log('AudienceDetailsPage - Members:', audienceData?.members)
  console.log('AudienceDetailsPage - First member profile:', audienceData?.members?.[0]?.profile)
  console.log('AudienceDetailsPage - Games:', gamesData)
  const router = useRouter()
  // Helper function to get filter chips
  const getFilterChips = () => {
    const chips = []
    // Age filter
    if (audienceData?.ageGroup?.min && audienceData?.ageGroup?.max) {
      chips.push({
        icon: <CakeIcon sx={{ fontSize: 16 }} />,
        label: `Age: ${audienceData.ageGroup.min}-${audienceData.ageGroup.max}`,
        color: 'primary'
      })
    }

    // Location filter
    if (audienceData?.location) {
      const locationParts = []
      if (audienceData.location.country) locationParts.push(audienceData.location.country)
      if (audienceData.location.region) locationParts.push(audienceData.location.region)
      if (audienceData.location.city) locationParts.push(audienceData.location.city)

      if (locationParts.length > 0) {
        chips.push({
          icon: <LocationIcon sx={{ fontSize: 16 }} />,
          label: `Location: ${locationParts.join(', ')}`,
          color: 'secondary'
        })
      }
    }

    // Gender filter
    if (audienceData?.gender && Array.isArray(audienceData.gender) && audienceData.gender.length > 0) {
      const genderLabels = audienceData.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1))
      chips.push({
        icon: <PersonIcon sx={{ fontSize: 16 }} />,
        label: `Gender: ${genderLabels.join(', ')}`,
        color: 'success'
      })
    }

    return chips
  }
  const filterChips = getFilterChips()

  // Helper function to get member filter chips based on group filters
  const getMemberFilterChips = member => {
    const chips = []

    // Show age only if group has age filter
    if (audienceData?.ageGroup?.min && audienceData?.ageGroup?.max && member.profile?.age) {
      chips.push({
        label: `Age: ${member.profile.age}`,
        color: 'primary'
      })
    }

    // Show gender only if group has gender filter
    if (audienceData?.gender && Array.isArray(audienceData.gender) && audienceData.gender.length > 0 && member.profile?.gender) {
      chips.push({
        label: `Gender: ${member.profile.gender.charAt(0).toUpperCase() + member.profile.gender.slice(1)}`,
        color: 'success'
      })
    }

    // Show location as single chip if group has location filter
    if (audienceData?.location) {
      const locationParts = []
      if (audienceData.location.city && member.profile?.locality) locationParts.push(member.profile.locality)
      if (audienceData.location.region && member.profile?.region) locationParts.push(member.profile.region)
      if (audienceData.location.country && member.profile?.country) locationParts.push(member.profile.country)
      
      if (locationParts.length > 0) {
        chips.push({
          label: `Location: ${locationParts.join(', ')}`,
          color: 'secondary'
        })
      }
    }

    return chips
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Group Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 2 }}>
          {audienceData?.audienceName || 'Audience Details'}
        </Typography>

        {audienceData?.description && (
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            {audienceData.description}
          </Typography>
        )}
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Group Filters
          </Typography>

          {filterChips.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filterChips.map((chip, index) => (
                <Chip
                  key={index}
                  icon={chip.icon}
                  label={chip.label}
                  color={chip.color}
                  variant='outlined'
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
              No filters applied
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Group Members Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              Group Members
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {audienceData?.membersCount === 0 ? 'No Members': audienceData?.membersCount > 1 ? `${audienceData?.membersCount} members` : `${audienceData?.membersCount} member`}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {audienceData?.members && audienceData.members.length > 0 ? (
            <Paper
              sx={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Box sx={{ p: 2 }}>
                {audienceData.members.map((member, index) => (
                  <Box
                    key={member._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < audienceData.members.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: 'white'
                      }}
                    >
                      {member?.profile?.firstname?.[0] || member?.profile?.lastname?.[0] || 'U'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {member?.profile?.firstname && member?.profile?.lastname
                          ? `${member?.profile?.firstname} ${member?.profile?.lastname}`
                          : member?.profile?.firstname || member?.profile?.lastname }
                      </Typography>

                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {member.email}
                      </Typography>

                      {/* Show only filter-related information based on group filters */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {getMemberFilterChips(member).length > 0 ? (
                          <>
                            <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              Users Criteria:
                            </Typography>
                            {getMemberFilterChips(member).map((chip, chipIndex) => (
                              <Chip
                                key={chipIndex}
                                size='small'
                                label={chip.label}
                                variant='outlined'
                                color={chip.color}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          </>
                        ) : (
                          <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                            No criteria applied
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                No members in this group
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Group Games Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GameIcon />
              Group Games
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {gamesData.length === 0 ? 'No Games': gamesData.length > 1 ? `${gamesData.length} games` : `${gamesData.length} game`}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {gamesData.length > 0 ? (
            <Paper
              sx={{
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <Box sx={{ p: 2 }}>
                {gamesData.map((game, index) => (
                  <Box
                    key={game._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < gamesData.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar
                      src={game.thumbnailPoster}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {game.title?.[0]?.toUpperCase() || 'G'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {game.title || 'Untitled Game'}
                      </Typography>

                      {game.description && (
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                          {game.description}
                        </Typography>
                      )}
                    </Box>

                    {/* External Link Button */}
                    <Button
                      size='small'
                      variant='outlined'
                      color='primary'
                      onClick={() => router.push(`/management/games/${game._id}`)}
                      sx={{
                        minWidth: 'auto',
                        p: 1,
                        borderRadius: '50%',
                        width: 40,
                        height: 40
                      }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 20 }} />
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                No games in this group
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AudiencedetailsPage
