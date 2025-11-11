'use client'
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Group as GroupIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import AudienceFallBackCard from './AudienceFallBackCard'

const AudienceDetailsPopup = ({ open, audience, onClose }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && audience) {
      fetchAudienceUsers()
    }
  }, [open, audience])

  const canonicalFilterHandlers = {
    age: (user, criteria) => {
      const age = user.profile?.age ?? user.age
      if (typeof age !== 'number') return false
      const { min, max } = criteria || {}
      const meetsMin = min === undefined || age >= min
      const meetsMax = max === undefined || age <= max
      return meetsMin && meetsMax
    },
    location: (user, criteria) => {
      const country = user.profile?.country ?? user.country
      const region = user.profile?.region ?? user.region
      const city = user.profile?.locality ?? user.locality

      const countryOk =
        !criteria?.country ||
        (typeof country === 'string' && country.trim().toLowerCase() === criteria.country.toLowerCase())
      const regionOk =
        !criteria?.region ||
        (typeof region === 'string' && region.trim().toLowerCase() === criteria.region.toLowerCase())
      const cityOk =
        !criteria?.city || (typeof city === 'string' && city.trim().toLowerCase() === criteria.city.toLowerCase())

      return countryOk && regionOk && cityOk
    },
    gender: (user, criteria) => {
      const gender = (user.profile?.gender ?? user.gender)?.toLowerCase()
      if (!gender) return false
      const values = Array.isArray(criteria?.values) ? criteria.values.map(value => value.toLowerCase()) : []
      return values.includes(gender)
    }
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

  const extractCanonicalFilters = audienceLike => {
    if (Array.isArray(audienceLike?.filters) && audienceLike.filters.length > 0) {
      return audienceLike.filters.map((filter, index) => ({
        type: filter.type,
        criteria: filter.criteria || {},
        operator: index === 0 ? null : filter.operator || null
      }))
    }

    const legacyFilters = []

    if (
      audienceLike?.ageGroup &&
      (audienceLike.ageGroup.min !== undefined || audienceLike.ageGroup.max !== undefined)
    ) {
      legacyFilters.push({
        type: 'age',
        criteria: {
          min: audienceLike.ageGroup.min,
          max: audienceLike.ageGroup.max
        },
        operator: audienceLike.ageGroup.operation || null
      })
    }

    if (
      audienceLike?.location &&
      (audienceLike.location.country || audienceLike.location.region || audienceLike.location.city)
    ) {
      legacyFilters.push({
        type: 'location',
        criteria: {
          country: audienceLike.location.country,
          region: audienceLike.location.region,
          city: audienceLike.location.city
        },
        operator: audienceLike.location.operation || null
      })
    }

    if (audienceLike?.gender) {
      const genderValues = Array.isArray(audienceLike.gender?.values)
        ? audienceLike.gender.values
        : Array.isArray(audienceLike.gender)
          ? audienceLike.gender
          : []

      if (genderValues.length > 0) {
        legacyFilters.push({
          type: 'gender',
          criteria: { values: genderValues },
          operator: audienceLike.gender.operation || null
        })
      }
    }

    return legacyFilters.map((filter, index) => ({
      ...filter,
      operator: index === 0 ? null : filter.operator || null
    }))
  }

  const applyCanonicalFilters = (usersPool, filters) => {
    if (!filters.length) {
      return usersPool
    }

    let currentUsers = []

    filters.forEach((filter, index) => {
      const handler = canonicalFilterHandlers[filter.type]
      if (!handler) {
        return
      }

      const matched = usersPool.filter(user => handler(user, filter.criteria))

      if (index === 0) {
        currentUsers = matched
        return
      }

      const operation = (filter.operator || 'AND').toUpperCase()

      if (operation === 'OR') {
        currentUsers = dedupeUsersById([...currentUsers, ...matched])
      } else {
        const matchedIds = new Set(matched.map(user => user._id?.toString()))
        currentUsers = currentUsers.filter(user => matchedIds.has(user._id?.toString()))
      }
    })

    return dedupeUsersById(currentUsers)
  }

  const filterUsersByAudienceCriteria = (usersPool, audienceLike) => {
    const verifiedUsers = usersPool.filter(user => user?.isVerified !== false)
    const canonicalFilters = extractCanonicalFilters(audienceLike)

    if (!canonicalFilters.length) {
      return verifiedUsers
    }

    return applyCanonicalFilters(verifiedUsers, canonicalFilters)
  }

  const fetchAudienceUsers = async () => {
    if (!audience) return

    setLoading(true)
    setError(null)

    try {
      // First try dedicated endpoint that mirrors backend logic
      try {
        const targetId = audience._id || audience.id
        if (targetId) {
          const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${targetId}&action=users`)
          if (result?.status === 'success') {
            const filteredUsers = Array.isArray(result.result) ? result.result : [result.result]
            setUsers(filteredUsers)
            return
          }
        }
      } catch (apiError) {
        console.warn('Audience members endpoint failed, falling back to client filtering:', apiError)
      }

      // Fall back to fetching all users and filtering locally
      const result = await RestApi.get(`${API_URLS.v0.USER}`)
      if (result?.status === 'success') {
        const allUsers = Array.isArray(result.result) ? result.result : [result.result]
        const filtered = filterUsersByAudienceCriteria(allUsers, audience)
        setUsers(filtered)
      } else {
        setError('Failed to fetch audience members')
      }
    } catch (error) {
      console.error('Error fetching audience users:', error)
      setError('An error occurred while fetching audience members')
    } finally {
      setLoading(false)
    }
  }

  if (!audience) return null

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon color='primary' />
          <Typography variant='h6'>{audience.audienceName}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Audience Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Audience Information
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {audience.description && (
              <Typography variant='body2' color='text.secondary'>
                {audience.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>{/* Status field removed */}</Box>

          {(() => {
            const filterChips = []

            if (audience.ageGroup?.min && audience.ageGroup?.max) {
              filterChips.push(
                <Chip
                  key='age'
                  icon={<CakeIcon sx={{ fontSize: 16 }} />}
                  label={`Age: ${audience.ageGroup.min}-${audience.ageGroup.max}`}
                  variant='outlined'
                  size='small'
                  color='primary'
                />
              )
            }

            if (
              audience.gender &&
              ((audience.gender.values && Array.isArray(audience.gender.values) && audience.gender.values.length > 0) ||
                (Array.isArray(audience.gender) && audience.gender.length > 0))
            ) {
              const genderValues = audience.gender.values || audience.gender
              filterChips.push(
                <Chip
                  key='gender'
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={`Gender: ${genderValues.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`}
                  variant='outlined'
                  size='small'
                  color='success'
                />
              )
            }

            if (audience.location) {
              const locationParts = []
              if (audience.location.country) locationParts.push(audience.location.country)
              if (audience.location.region) locationParts.push(audience.location.region)
              if (audience.location.city) locationParts.push(audience.location.city)

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

          <Box sx={{ mt: 2, display: 'flex', gap: 2, color: 'text.secondary' }}>
            <Typography variant='body2'>Created: {formatDate(audience.createdAt)}</Typography>
            <Typography variant='body2'>Members: {users.length}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Audience Members */}
        <Box>
          <Typography variant='h6' gutterBottom>
            Audience Members ({users.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 3 }}>
              No members found in this audience
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {users.map((user, index) => (
                <React.Fragment key={user._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {user.profile?.firstname?.[0] ||
                          user.profile?.lastname?.[0] ||
                          user.email?.[0]?.toUpperCase() ||
                          'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box>
                          {user.profile?.firstname && user.profile?.lastname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.firstname} {user.profile.lastname}
                            </Typography>
                          ) : user.profile?.firstname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.firstname}
                            </Typography>
                          ) : user.profile?.lastname ? (
                            <Typography variant='body1' fontWeight='medium' sx={{ mb: 0.5 }}>
                              {user.profile.lastname}
                            </Typography>
                          ) : null}
                          <Typography variant='body2' color='text.secondary'>
                            {user.email}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Member ID: {user.memberId || 'N/A'}
                          </Typography>
                          {/* {user.roles && user.roles.length > 0 && (
                             <Typography variant="body2" color="text.secondary">
                               Roles: {user.roles.join(', ')}
                             </Typography>
                           )}
                           {user.isVerified && (
                             <Typography variant="body2" color="text.secondary">
                               ✓ Verified
                             </Typography>
                           )} */}

                          {/* Show filter-related information based on Audience filters */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                            {(() => {
                              const chips = []

                              // Show age only if Audience has age filter
                              if (audience?.ageGroup?.min && audience?.ageGroup?.max && user.profile?.age) {
                                chips.push({
                                  label: `Age: ${user.profile.age}`,
                                  color: 'primary'
                                })
                              }

                              // Show gender only if Audience has gender filter
                              if (
                                audience?.gender &&
                                ((audience.gender.values &&
                                  Array.isArray(audience.gender.values) &&
                                  audience.gender.values.length > 0) ||
                                  (Array.isArray(audience.gender) && audience.gender.length > 0)) &&
                                user.profile?.gender
                              ) {
                                chips.push({
                                  label: `Gender: ${
                                    user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1)
                                  }`,
                                  color: 'success'
                                })
                              }

                              // Show location as single chip if Audience has location filter
                              if (audience?.location) {
                                const locationParts = []
                                if (audience.location.city && user.profile?.locality)
                                  locationParts.push(user.profile.locality)
                                if (audience.location.region && user.profile?.region)
                                  locationParts.push(user.profile.region)
                                if (audience.location.country && user.profile?.country)
                                  locationParts.push(user.profile.country)

                                if (locationParts.length > 0) {
                                  chips.push({
                                    label: `Location: ${locationParts.join(', ')}`,
                                    color: 'secondary'
                                  })
                                }
                              }

                              return chips.length > 0 ? (
                                <>
                                  <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                    Users Criteria:
                                  </Typography>
                                  {chips.map((chip, chipIndex) => (
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
                              )
                            })()}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < users.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AudienceDetailsPopup
