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
  CircularProgress,
  useTheme,
  alpha
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
  const theme = useTheme()

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
      const result = await RestApi.get(`${API_URLS.v0.USER}?isVerified=true`)
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

  // Helpers to normalize and apply canonical filters (matches backend logic)
  const extractCanonicalFilters = audience => {
    if (Array.isArray(audience?.filters) && audience.filters.length > 0) {
      return audience.filters.map((filter, index) => ({
        type: filter.type,
        criteria: filter.criteria || {},
        operator: index === 0 ? null : filter.operator || null
      }))
    }

    const legacyFilters = []

    if (audience?.ageGroup && (audience.ageGroup.min !== undefined || audience.ageGroup.max !== undefined)) {
      legacyFilters.push({
        type: 'age',
        criteria: {
          min: audience.ageGroup.min,
          max: audience.ageGroup.max
        },
        operator: audience.ageGroup.operation || null
      })
    }

    if (audience?.location && (audience.location.country || audience.location.region || audience.location.city)) {
      legacyFilters.push({
        type: 'location',
        criteria: {
          country: audience.location.country,
          region: audience.location.region,
          city: audience.location.city
        },
        operator: audience.location.operation || null
      })
    }

    if (audience?.gender) {
      const genderValues = Array.isArray(audience.gender?.values)
        ? audience.gender.values
        : Array.isArray(audience.gender)
          ? audience.gender
          : []

      if (genderValues.length > 0) {
        legacyFilters.push({
          type: 'gender',
          criteria: { values: genderValues },
          operator: audience.gender.operation || null
        })
      }
    }

    return legacyFilters.map((filter, index) => ({
      ...filter,
      operator: index === 0 ? null : filter.operator || null
    }))
  }

  const FILTER_HANDLERS = {
    age: (user, criteria) => {
      const userAge = user.profile?.age ?? user.age
      if (typeof userAge !== 'number') return false
      const { min, max } = criteria || {}
      const meetsMin = min === undefined || userAge >= min
      const meetsMax = max === undefined || userAge <= max
      return meetsMin && meetsMax
    },
    location: (user, criteria) => {
      const userCountry = user.profile?.country ?? user.country
      const userRegion = user.profile?.region ?? user.region
      const userLocality = user.profile?.locality ?? user.locality

      const matchesCountry =
        !criteria?.country ||
        (typeof userCountry === 'string' && userCountry.trim().toLowerCase() === criteria.country.toLowerCase())
      const matchesRegion =
        !criteria?.region ||
        (typeof userRegion === 'string' && userRegion.trim().toLowerCase() === criteria.region.toLowerCase())
      const matchesCity =
        !criteria?.city ||
        (typeof userLocality === 'string' && userLocality.trim().toLowerCase() === criteria.city.toLowerCase())

      return matchesCountry && matchesRegion && matchesCity
    },
    gender: (user, criteria) => {
      const userGender = (user.profile?.gender ?? user.gender)?.toLowerCase()
      if (!userGender) return false
      const values = Array.isArray(criteria?.values) ? criteria.values.map(value => value.toLowerCase()) : []
      return values.includes(userGender)
    }
  }

  const applySingleCanonicalFilter = (usersPool, filter) => {
    const handler = FILTER_HANDLERS[filter.type]
    if (!handler) {
      return []
    }
    return usersPool.filter(user => handler(user, filter.criteria))
  }

  const dedupeUsersById = usersArray => {
    const map = new Map()
    usersArray.forEach(user => {
      const id = user._id?.toString()
      if (id && !map.has(id)) {
        map.set(id, user)
      }
    })
    return Array.from(map.values())
  }

  const applyCanonicalFiltersToUsers = (usersPool, filters) => {
    if (!filters.length) {
      return usersPool
    }

    let currentUsers = []

    filters.forEach((filter, index) => {
      const matchedUsers = applySingleCanonicalFilter(usersPool, filter)

      if (index === 0) {
        currentUsers = matchedUsers
        return
      }

      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        currentUsers = dedupeUsersById([...currentUsers, ...matchedUsers])
      } else {
        const matchedIds = new Set(matchedUsers.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => matchedIds.has(user._id?.toString()))
      }
    })

    return dedupeUsersById(currentUsers)
  }

  // Helper function to filter users based on audience criteria using canonical filters
  const filterUsersByAudienceCriteria = (users, audience) => {
    const verifiedUsers = users.filter(user => user?.isVerified !== false)
    const canonicalFilters = extractCanonicalFilters(audience)

    if (canonicalFilters.length === 0) {
      return verifiedUsers
    }

    return applyCanonicalFiltersToUsers(verifiedUsers, canonicalFilters)
  }
  // Helper function to get filter chips
  const getFilterChips = () => {
    const canonicalFilters = extractCanonicalFilters(audienceData)
    if (!canonicalFilters.length) {
      return []
    }

    return canonicalFilters
      .map(filter => {
        if (filter.type === 'age') {
          const min = filter.criteria?.min
          const max = filter.criteria?.max
          if (min !== undefined && max !== undefined) {
            return {
              icon: <CakeIcon sx={{ fontSize: 16 }} />,
              label: `Age: ${min}-${max}`,
              color: 'primary'
            }
          }
        }

        if (filter.type === 'location') {
          const country = filter.criteria?.country
          const region = filter.criteria?.region
          const city = filter.criteria?.city
          const parts = [country, region, city].filter(Boolean)

          if (parts.length > 0) {
            return {
              icon: <LocationIcon sx={{ fontSize: 16 }} />,
              label: `Location: ${parts.join(', ')}`,
              color: 'secondary'
            }
          }
        }

        if (filter.type === 'gender') {
          const rawValues = Array.isArray(filter.criteria?.values) ? filter.criteria.values : []
          if (rawValues.length > 0) {
            const genderLabels = rawValues.map(value => String(value).charAt(0).toUpperCase() + String(value).slice(1))
            return {
              icon: <PersonIcon sx={{ fontSize: 16 }} />,
              label: `Gender: ${genderLabels.join(', ')}`,
              color: 'success'
            }
          }
        }

        return null
      })
      .filter(Boolean)
  }
  const filterChips = getFilterChips()

  // Helper function to get member filter chips based on audience filters
  const getMemberFilterChips = member => {
    const chips = []

    // Show age only if audience has age filter
    if (
      audienceData?.ageGroup?.min &&
      audienceData?.ageGroup?.max &&
      ((member.age !== undefined && member.age !== null) ||
        (member.profile?.age !== undefined && member.profile?.age !== null))
    ) {
      chips.push({
        label: `Age: ${member.age !== undefined && member.age !== null ? member.age : member.profile?.age}`,
        color: 'primary'
      })
    }

    // Show gender only if audience has gender filter
    if (audienceData?.gender && (member.gender || member.profile?.gender)) {
      let genderValues = []

      // Handle both old array format and new object format with values property
      if (Array.isArray(audienceData.gender)) {
        genderValues = audienceData.gender
      } else if (audienceData.gender.values && Array.isArray(audienceData.gender.values)) {
        genderValues = audienceData.gender.values
      } else if (typeof audienceData.gender === 'string') {
        genderValues = [audienceData.gender]
      } else {
        // Fallback: try to extract values from object
        genderValues = Object.values(audienceData.gender).filter(v => typeof v === 'string')
      }

      if (genderValues.length > 0) {
        const memberGender = member.gender || member.profile?.gender
        chips.push({
          label: `Gender: ${String(memberGender).charAt(0).toUpperCase() + String(memberGender).slice(1)}`,
          color: 'secondary'
        })
      }
    }

    // Show location as single chip if audience has location filter
    if (audienceData?.location) {
      const locationParts = []
      if (audienceData.location.city && (member.locality || member.profile?.locality))
        locationParts.push(member.locality || member.profile.locality)
      if (audienceData.location.region && (member.region || member.profile?.region))
        locationParts.push(member.region || member.profile.region)
      if (audienceData.location.country && (member.country || member.profile?.country))
        locationParts.push(member.country || member.profile.country)

      if (locationParts.length > 0) {
        chips.push({
          label: `Location: ${locationParts.join(', ')}`,
          color: 'default'
        })
      }
    }

    return chips
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
                width: '100%',
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                  flexShrink: 0
                }}
              >
                <i className='ri-team-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  textAlign: 'center',
                  maxWidth: { xs: 'calc(100% - 80px)', sm: 'calc(100% - 100px)', md: '800px' },
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word'
                }}
                title={audienceData?.audienceName || 'Audience Details'}
              >
                {audienceData?.audienceName || 'Audience Details'}
              </Typography>
            </Box>
            {audienceData?.description && (
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1.05rem' },
                  lineHeight: { xs: 1.5, sm: 1.6, md: 1.8 },
                  width: { xs: '100%', sm: '70%' },
                  mx: 'auto',
                  fontWeight: 400,
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
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
        {/* Filters Section */}
        <Card
          sx={{
            mb: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 2 },
            background: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                  : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                mb: { xs: 2, sm: 3 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )})`,
                  color: 'primary.main',
                  '& i': {
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }
                }}
              >
                <i className='ri-filter-3-line' />
              </Box>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Audience Filters
              </Typography>
            </Box>

            {filterChips.length > 0 ? (
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
                {filterChips.map((chip, index) => {
                  // Determine background color based on chip color type
                  const getBackgroundColor = () => {
                    if (chip.color === 'primary') {
                      return alpha(theme.palette.primary.main, 0.12)
                    } else if (chip.color === 'success') {
                      return alpha(theme.palette.grey[300], 0.12)
                    } else if (chip.color === 'secondary') {
                      return alpha(theme.palette.grey[500], 0.12)
                    }
                    return alpha(theme.palette.primary.main, 0.12)
                  }

                  const getHoverBackground = () => {
                    if (chip.color === 'primary') {
                      return alpha(theme.palette.primary.main, 0.18)
                    } else if (chip.color === 'success') {
                      return alpha(theme.palette.grey[300], 0.22)
                    } else if (chip.color === 'secondary') {
                      return alpha(theme.palette.grey[500], 0.18)
                    }
                    return alpha(theme.palette.primary.main, 0.18)
                  }

                  const getTextColor = () => {
                    if (chip.color === 'primary') {
                      return theme.palette.primary.main
                    } else if (chip.color === 'success') {
                      return theme.palette.grey[600]
                    } else if (chip.color === 'secondary') {
                      return theme.palette.grey[700]
                    }
                    return theme.palette.primary.main
                  }

                  const getBorderColor = () => {
                    if (chip.color === 'primary') {
                      return alpha(theme.palette.primary.main, 0.2)
                    } else if (chip.color === 'success') {
                      return alpha(theme.palette.grey[900], 0.2)
                    } else if (chip.color === 'secondary') {
                      return alpha(theme.palette.grey[800], 0.2)
                    }
                    return alpha(theme.palette.primary.main, 0.2)
                  }

                  return (
                    <Chip
                      key={index}
                      icon={chip.icon}
                      label={chip.label}
                      sx={{
                        height: { xs: 30, sm: 36 },
                        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                        fontWeight: 600,
                        borderRadius: 1.5,
                        background: getBackgroundColor(),
                        boxShadow: `0 1px 3px ${alpha(
                          chip.color === 'primary' ? theme.palette.primary.main : theme.palette.grey[500],
                          0.08
                        )}`,
                        color: getTextColor(),
                        border: `1px solid ${getBorderColor()}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          background: getHoverBackground(),
                          boxShadow: `0 2px 4px ${alpha(
                            chip.color === 'primary' ? theme.palette.primary.main : theme.palette.grey[500],
                            0.12
                          )}`,
                          transform: 'translateY(-1px)'
                        },
                        '& .MuiChip-icon': {
                          fontSize: { xs: 16, sm: 18 },
                          color: getTextColor(),
                          marginLeft: { xs: '6px', sm: '8px' },
                          marginRight: { xs: '-2px', sm: '-2px' }
                        },
                        '& .MuiChip-label': {
                          color: getTextColor(),
                          paddingLeft: { xs: '8px', sm: '10px' },
                          paddingRight: { xs: '10px', sm: '12px' }
                        }
                      }}
                    />
                  )
                })}
              </Box>
            ) : (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                No filters applied
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Audience Members Section */}
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 2 },
            background: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                  : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1, sm: 0 },
                mb: { xs: 2, sm: 3 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                      theme.palette.secondary.main,
                      0.1
                    )})`,
                    color: 'primary.main'
                  }}
                >
                  <GroupIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                </Box>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Audience Members
                </Typography>
              </Box>
              <Chip
                label={
                  loading
                    ? 'Loading...'
                    : users.length === 0
                      ? 'No Members'
                      : users.length > 1
                        ? `${users.length} members`
                        : `${users.length} member`
                }
                size='small'
                sx={{
                  height: { xs: 24, sm: 28 },
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )})`,
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 3, sm: 4 } }}>
                <CircularProgress size={{ xs: 32, sm: 40 }} />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <Typography variant='body1' color='error' sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {error}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={fetchAndFilterUsers}
                  sx={{
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.75, sm: 1 }
                  }}
                >
                  Retry
                </Button>
              </Box>
            ) : users.length > 0 ? (
              <Paper
                sx={{
                  maxHeight: { xs: '300px', sm: '400px' },
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  background: theme.palette.background.paper,
                  // Custom scrollbar styling
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: alpha(theme.palette.divider, 0.1),
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.4),
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.6)
                    }
                  },
                  scrollbarWidth: 'thin'
                }}
              >
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  {users.map((user, index) => (
                    <Box
                      key={user._id || index}
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                        borderRadius: 1.5,
                        borderBottom: index < users.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          transform: { xs: 'none', sm: 'scale(1.01)' },
                          boxShadow: { xs: 'none', sm: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` },
                          borderColor: 'transparent'
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          fontWeight: 600,
                          color: 'white',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                          flexShrink: 0
                        }}
                      >
                        {(user?.firstname || user?.profile?.firstname)?.[0] ||
                          (user?.lastname || user?.profile?.lastname)?.[0] ||
                          user?.email?.[0]?.toUpperCase() ||
                          'U'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant='subtitle1'
                          color='text.primary'
                          sx={{
                            fontWeight: 600,
                            mb: { xs: 0.25, sm: 0.5 },
                            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
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

                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            mb: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {user.email}
                        </Typography>

                        {/* Show user profile information - only filters that exist in audience filters */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 0.5, sm: 1 },
                            flexWrap: 'wrap',
                            alignItems: 'center'
                          }}
                        >
                          {getMemberFilterChips(user).map((chip, chipIndex) => (
                            <Chip
                              key={chipIndex}
                              size='small'
                              icon={
                                chip.label.startsWith('Age:') ? (
                                  <CakeIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                                ) : chip.label.startsWith('Gender:') ? (
                                  <PersonIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                                ) : chip.label.startsWith('Location:') ? (
                                  <LocationIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                                ) : null
                              }
                              label={chip.label}
                              variant='outlined'
                              color={chip.color}
                              sx={{
                                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                height: { xs: 22, sm: 26 }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <Typography variant='body1' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  No users match the current filter criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Audience Games Section */}
        <Card
          sx={{
            mt: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 2 },
            background: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                  : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1, sm: 0 },
                mb: { xs: 2, sm: 3 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                      theme.palette.secondary.main,
                      0.1
                    )})`,
                    color: 'primary.main'
                  }}
                >
                  <GameIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                </Box>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Audience Games
                </Typography>
              </Box>
              <Chip
                label={
                  gamesData.length === 0
                    ? 'No Games'
                    : gamesData.length > 1
                      ? `${gamesData.length} games`
                      : `${gamesData.length} game`
                }
                size='small'
                sx={{
                  height: { xs: 24, sm: 28 },
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )})`,
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              />
            </Box>

            {gamesData.length > 0 ? (
              <Paper
                sx={{
                  maxHeight: { xs: '300px', sm: '400px' },
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  background: theme.palette.background.paper,
                  // Custom scrollbar styling
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: alpha(theme.palette.divider, 0.1),
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.4),
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.6)
                    }
                  },
                  scrollbarWidth: 'thin'
                }}
              >
                <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                  {gamesData.map((game, index) => (
                    <Box
                      key={game._id || index}
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                        borderRadius: 1.5,
                        borderBottom: index < gamesData.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                          transform: { xs: 'none', sm: 'scale(1.01)' },
                          boxShadow: { xs: 'none', sm: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}` },
                          borderColor: 'transparent'
                        }
                      }}
                    >
                      <Avatar
                        src={game.thumbnailPoster}
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          fontWeight: 600,
                          color: 'white',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                          flexShrink: 0
                        }}
                      >
                        {game.title?.[0]?.toUpperCase() || 'G'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{
                            fontWeight: 600,
                            mb: { xs: 0.25, sm: 0.5 },
                            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {game.title || 'Untitled Game'}
                        </Typography>

                        {game.description && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              mb: { xs: 0.75, sm: 1 },
                              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                              wordBreak: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
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
                          p: { xs: 0.75, sm: 1 },
                          borderRadius: '50%',
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          flexShrink: 0
                        }}
                      >
                        <OpenInNewIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <Typography variant='body1' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  No games in this audience
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
          <Button
            variant='contained'
            component='label'
            onClick={() => router.push('/management/audience')}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1.5, md: 2 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              color: 'white',
              minWidth: { xs: 180, sm: 200 }
            }}
          >
            Back to Audiences
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default AudienceDetailsPage
