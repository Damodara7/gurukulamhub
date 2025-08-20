'use client'
import React from 'react'
import { Box, Typography, Chip, Avatar, Card, CardContent, Divider, Grid, Paper } from '@mui/material'
import {
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Cake as CakeIcon
} from '@mui/icons-material'

const GroupdetailsPage = ({ groupId, groupData }) => {
  // Debug: Log the received data structure
  console.log('GroupDetailsPage - Received groupData:', groupData)
  console.log('GroupDetailsPage - Members:', groupData?.members)
  console.log('GroupDetailsPage - First member profile:', groupData?.members?.[0]?.profile)

  // Helper function to get filter chips
  const getFilterChips = () => {
    const chips = []
    // Age filter
    if (groupData?.ageGroup?.min && groupData?.ageGroup?.max) {
      chips.push({
        icon: <CakeIcon sx={{ fontSize: 16 }} />,
        label: `Age: ${groupData.ageGroup.min}-${groupData.ageGroup.max}`,
        color: 'primary'
      })
    }

    // Location filter
    if (groupData?.location) {
      const locationParts = []
      if (groupData.location.country) locationParts.push(groupData.location.country)
      if (groupData.location.region) locationParts.push(groupData.location.region)
      if (groupData.location.city) locationParts.push(groupData.location.city)

      if (locationParts.length > 0) {
        chips.push({
          icon: <LocationIcon sx={{ fontSize: 16 }} />,
          label: `Location: ${locationParts.join(', ')}`,
          color: 'secondary'
        })
      }
    }

    // Gender filter
    if (groupData?.gender && Array.isArray(groupData.gender) && groupData.gender.length > 0) {
      const genderLabels = groupData.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1))
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
    if (groupData?.ageGroup?.min && groupData?.ageGroup?.max && member.profile?.age) {
      chips.push({
        label: `Age: ${member.profile.age}`,
        color: 'primary'
      })
    }

    // Show gender only if group has gender filter
    if (groupData?.gender && Array.isArray(groupData.gender) && groupData.gender.length > 0 && member.profile?.gender) {
      chips.push({
        label: `Gender: ${member.profile.gender.charAt(0).toUpperCase() + member.profile.gender.slice(1)}`,
        color: 'success'
      })
    }

    // Show location fields only if group has location filter
    if (groupData?.location) {
      if (groupData.location.city && member.profile?.locality) {
        chips.push({
          label: `City: ${member.profile.locality}`,
          color: 'secondary'
        })
      }

      if (groupData.location.region && member.profile?.region) {
        chips.push({
          label: `Region: ${member.profile.region}`,
          color: 'secondary'
        })
      }

      if (groupData.location.country && member.profile?.country) {
        chips.push({
          label: `Country: ${member.profile.country}`,
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
          {groupData?.groupName || 'Group Details'}
        </Typography>

        {groupData?.description && (
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            {groupData.description}
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
              {groupData?.membersCount || groupData?.members?.length || 0} members
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {groupData?.members && groupData.members.length > 0 ? (
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
                {groupData.members.map((member, index) => (
                  <Box
                    key={member._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < groupData.members.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {member?.profile?.firstname?.[0] || member?.profile?.lastname?.[0] || 'U'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {member?.profile?.firstname && member?.profile?.lastname
                          ? `${member?.profile?.firstname} ${member?.profile?.lastname}`
                          : member?.profile?.firstname || member?.profile?.lastname || 'No Name'}
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
    </Box>
  )
}

export default GroupdetailsPage
