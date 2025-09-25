'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  Paper,
  Button,
  CircularProgress
} from '@mui/material'
import {
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  SportsEsports as GameIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const AudienceDetailsPage = ({ audienceId, audienceData, gamesData = [] }) => {
  const router = useRouter()
  const { data: session } = useSession()

  // State for managing users
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if current user is admin of this audience
  const isAdmin = session?.user?.email === audienceData?.creatorEmail

  // Fetch users and filter based on audience criteria
  useEffect(() => {
    if (audienceData) {
      fetchAndFilterUsers()
    }
  }, [audienceData])

  // const fetchAudience = async () => {
  //   setLoading(true)
  //   try {
  //     const res = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}`)
  //     console.log('Complete API response:', res)

  //     if (res?.status === 'success') {
  //       setAudiences(res.result || [])
  //       console.log('total audience data', res.result)
  //     } else {
  //       console.error('Error fetching audience:', res)
  //       toast.error('Failed to load audience')
  //       setAudiences([])
  //     }
  //   } catch (error) {
  //     console.error('Error fetching audience:', error)
  //     toast.error('An error occurred while loading audience')
  //     setAudiences([])
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const fetchAndFilterUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Fetching users for audienceId:', audienceId)

      // Try the new API endpoint first
      try {
        console.log('Trying new API endpoint:', `${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}&action=users`)
        const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}&action=users`)
        console.log('New API Response:', result)

        if (result?.status === 'success') {
          const filteredUsers = Array.isArray(result.result) ? result.result : [result.result]
          console.log('Filtered users from new API:', filteredUsers.length)
          setUsers(filteredUsers)
          return
        }
      } catch (newApiError) {
        console.log('New API failed, falling back to legacy approach:', newApiError)
      }

      // Fallback to legacy approach
      console.log('Using legacy approach')
      const result = await RestApi.get(`${API_URLS.v0.USER}`)
      if (result?.status === 'success') {
        const allUsers = Array.isArray(result.result) ? result.result : [result.result]
        console.log('All users fetched:', allUsers.length)
        console.log('Audience criteria:', audienceData)
        const filteredUsers = filterUsersByAudienceCriteria(allUsers, audienceData)
        console.log('Filtered users:', filteredUsers.length)
        setUsers(filteredUsers)
      } else {
        setError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('An error occurred while fetching users')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to filter users based on audience criteria
  const filterUsersByAudienceCriteria = (users, audience) => {
    return users.filter(user => {
      // Handle both merged and nested profile data structures
      const userAge = user.age || user.profile?.age
      const userGender = user.gender || user.profile?.gender
      const userCountry = user.country || user.profile?.country
      const userRegion = user.region || user.profile?.region
      const userLocality = user.locality || user.profile?.locality

      // Age filter
      const ageMatch =
        !audience.ageGroup || (userAge && userAge >= audience.ageGroup.min && userAge <= audience.ageGroup.max)

      // Location filter
      const locationMatch =
        !audience.location ||
        ((!audience.location.country ||
          (userCountry && userCountry.toLowerCase() === audience.location.country.toLowerCase())) &&
          (!audience.location.region ||
            (userRegion && userRegion.toLowerCase() === audience.location.region.toLowerCase())) &&
          (!audience.location.city ||
            (userLocality && userLocality.toLowerCase() === audience.location.city.toLowerCase())))

      // Gender filter
      const genderMatch =
        !audience.gender ||
        (userGender &&
          (Array.isArray(audience.gender)
            ? audience.gender.includes(userGender.toLowerCase())
            : userGender.toLowerCase() === audience.gender.toLowerCase()))

      // Debug logging for first user
      if (users.indexOf(user) === 0) {
        console.log('Filtering user:', {
          email: user.email,
          userAge,
          userGender,
          userCountry,
          userRegion,
          userLocality,
          profileData: user.profile,
          ageMatch,
          locationMatch,
          genderMatch,
          finalMatch: ageMatch && locationMatch && genderMatch
        })
      }

      return ageMatch && locationMatch && genderMatch
    })
  }
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

  // Helper function to get member filter chips based on audience filters
  const getMemberFilterChips = member => {
    const chips = []

    // Show age only if audience has age filter
    if (audienceData?.ageGroup?.min && audienceData?.ageGroup?.max && member.profile?.age) {
      chips.push({
        label: `Age: ${member.profile.age}`,
        color: 'primary'
      })
    }

    // Show gender only if audience has gender filter
    if (
      audienceData?.gender &&
      Array.isArray(audienceData.gender) &&
      audienceData.gender.length > 0 &&
      member.profile?.gender
    ) {
      chips.push({
        label: `Gender: ${member.profile.gender.charAt(0).toUpperCase() + member.profile.gender.slice(1)}`,
        color: 'success'
      })
    }

    // Show location as single chip if audience has location filter
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
      {/* Audience Header */}
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
          {audienceData?.audienceName || 'Audience Details'}
        </Typography>

        {audienceData?.description && (
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
            {audienceData.description}
          </Typography>
        )}
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Audience Filters
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

      {/* Audience Members Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              Audience Members
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {loading
                ? 'Loading...'
                : users.length === 0
                  ? 'No Members'
                  : users.length > 1
                    ? `${users.length} members`
                    : `${users.length} member`}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='error' sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button variant='outlined' onClick={fetchAndFilterUsers}>
                Retry
              </Button>
            </Box>
          ) : users.length > 0 ? (
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
                {users.map((user, index) => (
                  <Box
                    key={user._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < users.length - 1 ? '1px solid' : 'none',
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
                      {(user?.firstname || user?.profile?.firstname)?.[0] ||
                        (user?.lastname || user?.profile?.lastname)?.[0] ||
                        user?.email?.[0]?.toUpperCase() ||
                        'U'}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {(user?.firstname || user?.profile?.firstname) && (user?.lastname || user?.profile?.lastname)
                          ? `${user?.firstname || user?.profile?.firstname} ${
                              user?.lastname || user?.profile?.lastname
                            }`
                          : user?.firstname ||
                            user?.profile?.firstname ||
                            user?.lastname ||
                            user?.profile?.lastname ||
                            user?.email}
                      </Typography>

                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        {user.email}
                      </Typography>

                      {/* Show user profile information */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {(user.age || user.profile?.age) && (
                          <Chip
                            size='small'
                            icon={<CakeIcon sx={{ fontSize: 14 }} />}
                            label={`Age: ${user.age || user.profile?.age}`}
                            variant='outlined'
                            color='primary'
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                        {(user.gender || user.profile?.gender) && (
                          <Chip
                            size='small'
                            icon={<PersonIcon sx={{ fontSize: 14 }} />}
                            label={`Gender: ${user.gender || user.profile?.gender}`}
                            variant='outlined'
                            color='secondary'
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                        {(user.country ||
                          user.profile?.country ||
                          user.region ||
                          user.profile?.region ||
                          user.locality ||
                          user.profile?.locality) && (
                          <Chip
                            size='small'
                            icon={<LocationIcon sx={{ fontSize: 14 }} />}
                            label={`Location: ${[
                              user.country || user.profile?.country,
                              user.region || user.profile?.region,
                              user.locality || user.profile?.locality
                            ]
                              .filter(Boolean)
                              .join(', ')}`}
                            variant='outlined'
                            color='default'
                            sx={{ fontSize: '0.75rem' }}
                          />
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
                No users match the current filter criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Audience Games Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GameIcon />
              Audience Games
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
                No games in this audience
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Join Requests Section - Only show for admins */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant='contained'
          component='label'
          onClick={() => router.push('/management/audience')}
          sx={{
            mt: 2,
            px: 4,
            py: 2,
            borderRadius: 2,
            fontWeight: 600,
            color: 'white'
          }}
        >
          Back to Audiences
        </Button>
      </Box>
    </Box>
  )
}

export default AudienceDetailsPage
