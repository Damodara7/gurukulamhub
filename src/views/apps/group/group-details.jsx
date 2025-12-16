'use client'
import React from 'react'
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
  useTheme,
  alpha,
  IconButton
} from '@mui/material'
import {
  Group as GroupIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  SportsEsports as GameIcon,
  OpenInNew as OpenInNewIcon,
  Campaign as CampaignIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import JoinRequestScreen from '@/components/group/JoinRequestScreen'

const GroupDetailsPage = ({ groupId, groupData, gamesData = [] }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const theme = useTheme()
  const [isHeaderCollapsed, setIsHeaderCollapsed] = React.useState(false)

  // Check if current user is admin of this group
  const isAdmin = session?.user?.email === groupData?.creatorEmail
  // Helper function to get filter chips
  const getFilterChips = () => {
    const chips = []

    if (groupData?.filters && Array.isArray(groupData.filters) && groupData.filters.length > 0) {
      groupData.filters.forEach((filter, index) => {
        if (filter.type === 'age' && filter.criteria) {
          const { min, max } = filter.criteria
          chips.push({
            icon: <CakeIcon sx={{ fontSize: 16 }} />,
            label: `Age: ${min}-${max}`,
            color: 'primary'
          })
        } else if (filter.type === 'location' && filter.criteria) {
          const locationParts = []
          if (filter.criteria.country) locationParts.push(filter.criteria.country)
          if (filter.criteria.region) locationParts.push(filter.criteria.region)
          if (filter.criteria.city) locationParts.push(filter.criteria.city)

          if (locationParts.length > 0) {
            chips.push({
              icon: <LocationIcon sx={{ fontSize: 16 }} />,
              label: `Location: ${locationParts.join(', ')}`,
              color: 'secondary'
            })
          }
        } else if (filter.type === 'gender' && filter.criteria) {
          const genderValues = Array.isArray(filter.criteria) ? filter.criteria : [filter.criteria]
          const genderLabels = genderValues.map(g => g.charAt(0).toUpperCase() + g.slice(1))
          chips.push({
            icon: <PersonIcon sx={{ fontSize: 16 }} />,
            label: `Gender: ${genderLabels.join(', ')}`,
            color: 'success'
          })
        }
      })
    }

    return chips
  }
  const filterChips = getFilterChips()

  // Helper function to get member filter chips based on group filters
  const getMemberFilterChips = member => {
    const chips = []

    if (groupData?.filters && Array.isArray(groupData.filters) && groupData.filters.length > 0) {
      groupData.filters.forEach(filter => {
        // Show age only if group has age filter
        if (filter.type === 'age' && filter.criteria && member.profile?.age) {
          chips.push({
            label: `Age: ${member.profile.age}`,
            color: 'primary'
          })
        }

        // Show gender only if group has gender filter
        if (filter.type === 'gender' && filter.criteria && member.profile?.gender) {
          chips.push({
            label: `Gender: ${member.profile.gender.charAt(0).toUpperCase() + member.profile.gender.slice(1)}`,
            color: 'success'
          })
        }

        // Show location as single chip if group has location filter
        if (filter.type === 'location' && filter.criteria) {
          const locationParts = []
          if (filter.criteria.city && member.profile?.locality) locationParts.push(member.profile.locality)
          if (filter.criteria.region && member.profile?.region) locationParts.push(member.profile.region)
          if (filter.criteria.country && member.profile?.country) locationParts.push(member.profile.country)

          if (locationParts.length > 0) {
            chips.push({
              label: `Location: ${locationParts.join(', ')}`,
              color: 'secondary'
            })
          }
        }
      })
    }

    return chips
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          pt: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          pb: isHeaderCollapsed ? { xs: 1, sm: 1.25, md: 1.5 } : { xs: 1.5, sm: 2, md: 2.5 },
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box >
            {/* Icon and Title */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.25 },
                mb: isHeaderCollapsed ? 0 : { xs: 1, sm: 1.5 },
                flexWrap: 'nowrap'
              }}
            >
              <Box
                sx={{
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  borderRadius: { xs: '10px', sm: '12px' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
                  flexShrink: 0
                }}
              >
                <GroupIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: isHeaderCollapsed ? 1 : 2,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  flex: 1
                }}
                title={groupData?.groupName || 'Group Details'}
              >
                {groupData?.groupName || 'Group Details'}
              </Typography>
              <IconButton
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  flexShrink: 0,
                  ml: 'auto',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'text.primary'
                  }
                }}
              >
                {isHeaderCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            </Box>
            {!isHeaderCollapsed && (
              <>
                {groupData?.description && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9375rem' },
                      lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
                      fontWeight: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      mb: { xs: 1, sm: 1.25 }
                    }}
                  >
                    {groupData.description}
                  </Typography>
                )}
                {/* Group Status and Announcement Mode */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: { xs: 0.75, sm: 1 },
                    mt: { xs: 1, sm: 1.25 },
                    flexWrap: 'wrap'
                  }}
                >
                  {groupData?.isAnnouncementOnly && (
                    <Chip
                      icon={<CampaignIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                      label='Announcement Mode'
                      size='small'
                      sx={{
                        height: { xs: 24, sm: 26 },
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        background: alpha(theme.palette.info.main, 0.12),
                        color: theme.palette.info.main,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '& .MuiChip-icon': {
                          color: theme.palette.info.main
                        }
                      }}
                    />
                  )}
                  {groupData?.status === 'public' ? (
                    <Chip
                      icon={<PublicIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                      label='Public'
                      size='small'
                      sx={{
                        height: { xs: 24, sm: 26 },
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        background: alpha(theme.palette.success.main, 0.12),
                        color: theme.palette.success.main,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '& .MuiChip-icon': {
                          color: theme.palette.success.main
                        }
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<LockIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                      label='Private'
                      size='small'
                      sx={{
                        height: { xs: 24, sm: 26 },
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        background: alpha(theme.palette.warning.main, 0.12),
                        color: theme.palette.warning.main,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        '& .MuiChip-icon': {
                          color: theme.palette.warning.main
                        }
                      }}
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, flex: 1, overflow: 'auto' }}>
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
                Group Filters
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

        {/* Group Members Section */}
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
                  Group Members
                </Typography>
              </Box>
              <Chip
                label={
                  groupData?.membersCount === 0
                    ? 'No Members'
                    : groupData?.membersCount > 1
                      ? `${groupData?.membersCount} members`
                      : `${groupData?.membersCount} member`
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

            {groupData?.members && groupData.members.length > 0 ? (
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
                  {groupData.members.map((member, index) => (
                    <Box
                      key={member._id || index}
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1.5, sm: 2 },
                        py: { xs: 1.25, sm: 1.5 },
                        px: { xs: 1.5, sm: 2 },
                        borderRadius: 1.5,
                        borderBottom: index < groupData.members.length - 1 ? '1px solid' : 'none',
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
                        {member?.profile?.firstname?.[0] ||
                          member?.profile?.lastname?.[0] ||
                          member?.email?.[0]?.toUpperCase() ||
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
                          {member?.profile?.firstname && member?.profile?.lastname
                            ? `${member?.profile?.firstname} ${member?.profile?.lastname}`
                            : member?.profile?.firstname || member?.profile?.lastname || member?.email}
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
                          {member.email}
                        </Typography>

                        {/* Show only filter-related information based on group filters */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 0.5, sm: 1 },
                            flexWrap: 'wrap',
                            alignItems: 'center'
                          }}
                        >
                          {getMemberFilterChips(member).length > 0 ? (
                            <>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 500,
                                  color: 'text.secondary',
                                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' }
                                }}
                              >
                                Users Criteria:
                              </Typography>
                              {getMemberFilterChips(member).map((chip, chipIndex) => (
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
                            </>
                          ) : (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{
                                fontStyle: 'italic',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }}
                            >
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
              <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                <Typography variant='body1' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  No members in this group
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Group Games Section */}
        <Card
          sx={{
            mt: { xs: 3, sm: 4 },
            borderRadius: { xs: 2, sm: 2 },
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
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
                  Group Games
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
                  No games in this group
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Join Requests Section - Only show for admins */}
        {isAdmin && (
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
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <JoinRequestScreen group={groupData} removebutton={true} />
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
          <Button
            variant='contained'
            component='label'
            onClick={() => router.push('/management/group')}
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
            Back to Groups
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default GroupDetailsPage
