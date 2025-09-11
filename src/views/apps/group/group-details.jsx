'use client'
import React from 'react'
import { Box, Typography, Chip, Avatar, Card, CardContent, Divider, Paper, Button } from '@mui/material'
import {
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  SportsEsports as GameIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import JoinRequestScreen from '@/components/group/JoinRequestScreen'

const GroupDetailsPage = ({ groupId, groupData, gamesData = [] }) => {
  const router = useRouter()
  const { data: session } = useSession()

  // Check if current user is admin of this group
  const isAdmin = session?.user?.email === groupData?.creatorEmail
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

    // Show location as single chip if group has location filter
    if (groupData?.location) {
      const locationParts = []
      if (groupData.location.city && member.profile?.locality) locationParts.push(member.profile.locality)
      if (groupData.location.region && member.profile?.region) locationParts.push(member.profile.region)
      if (groupData.location.country && member.profile?.country) locationParts.push(member.profile.country)

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
        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 600,
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}
        >
          {groupData?.groupName || 'Group Details'}
        </Typography>

        {groupData?.description && (
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{
              mb: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
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
              {groupData?.membersCount === 0
                ? 'No Members'
                : groupData?.membersCount > 1
                  ? `${groupData?.membersCount} members`
                  : `${groupData?.membersCount} member`}
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
                          : member?.profile?.firstname || member?.profile?.lastname}
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
              {gamesData.length === 0
                ? 'No Games'
                : gamesData.length > 1
                  ? `${gamesData.length} games`
                  : `${gamesData.length} game`}
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

      {/* Join Requests Section - Only show for admins */}
      {isAdmin && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <JoinRequestScreen group={groupData} removebutton={true} />
          </CardContent>
        </Card>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant='contained'
          component='label'
          onClick={() => router.push('/management/group')}
          sx={{
            mt: 2,
            px: 4,
            py: 2,
            borderRadius: 2,
            fontWeight: 600,
            color: 'white'
          }}
        >
          Back to Groups
        </Button>
      </Box>
    </Box>
  )
}

export default GroupDetailsPage
