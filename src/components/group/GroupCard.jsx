import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Grid,
  Box,
  Divider,
  Tooltip,
  Badge,
  Button,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '../IconButtonTooltip'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  GroupAdd as GroupAddIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import GroupFallBackCard from './GroupFallBackCard'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const GroupCard = ({ groups, onEditGroup, onViewGroup }) => {
  const theme = useTheme()
  const { data: session } = useSession()
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState({})
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)
  // WebSocket handling moved to parent component (AllGroupPage)

  // Check for pending requests for each group
  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!session?.user?.email) return

      for (const group of groups) {
        try {
          const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${group._id}&status=pending`)
          if (result?.status === 'success') {
            setPendingRequests(prev => ({
              ...prev,
              [group._id]: result.result?.length || 0
            }))
          }
        } catch (error) {
          console.error('Error checking pending requests:', error)
        }
      }
    }

    checkPendingRequests()
  }, [groups, session?.user?.email])

  // WebSocket connection for group request updates
  useEffect(() => {
    if (!session?.user?.email || groups.length === 0) return

    // Create WebSocket connections for each group's request updates
    const groupIds = groups.map(group => group._id)
    const wsConnections = []

    groupIds.forEach(groupId => {
      const wsUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
              window.location.host
            }/api/ws/group-requests/${groupId}`
          : ''

      if (wsUrl) {
        const wsRef = new WebSocket(wsUrl)
        wsConnections.push(wsRef)

        wsRef.onopen = () => {
          console.log(`[WS] GroupCard connected to group requests for group ${groupId}`)
        }

        wsRef.onmessage = event => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.type === 'groupRequests') {
              console.log('[WS] GroupCard received group request update:', msg.data)

              if (msg.data.type === 'requestSent') {
                // Update pending request count for this group
                setPendingRequests(prev => ({
                  ...prev,
                  [groupId]: (prev[groupId] || 0) + 1
                }))
              } else if (msg.data.type === 'requestApproved' || msg.data.type === 'requestRejected') {
                // Decrease pending request count for this group
                setPendingRequests(prev => ({
                  ...prev,
                  [groupId]: Math.max(0, (prev[groupId] || 0) - 1)
                }))
              }
            }
          } catch (e) {
            console.error('[WS] GroupCard error parsing group request message', e)
          }
        }

        wsRef.onerror = err => {
          console.error(`[WS] GroupCard group request error for group ${groupId}`, err)
        }

        wsRef.onclose = () => {
          console.log(`[WS] GroupCard group request connection closed for group ${groupId}`)
        }
      }
    })

    return () => {
      // Clean up all WebSocket connections
      wsConnections.forEach(wsRef => {
        if (wsRef.readyState === WebSocket.OPEN) {
          wsRef.close()
        }
      })
    }
  }, [groups, session?.user?.email])

  const handleJoinRequestClick = group => {
    // Navigate to the group request page with groupId in the URL path
    router.push(`/management/group/${group._id}/request`)
  }

  const handleDeleteClick = group => {
    setGroupToDelete(group)
    setConfirmationDialogOpen(true)
  }

  const handleFinalDeleteGroup = async () => {
    if (!groupToDelete) return

    try {
      console.log('Attempting to delete group:', groupToDelete._id)
      const result = await RestApi.del(`${API_URLS.v0.USERS_GROUP}?id=${groupToDelete._id}`)
      console.log('Delete group API response:', result)

      if (result?.status === 'success') {
        console.log('Group deleted successfully')
        // WebSocket will handle real-time updates automatically
        // Close the confirmation dialog
        setConfirmationDialogOpen(false)
        setGroupToDelete(null)
      } else {
        console.error('Error deleting group:', result)
        throw new Error(result?.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }

  if (!groups.length) {
    return <GroupFallBackCard content='No groups found' path='/' btnText='Back To Home Page' />
  }

  return (
    <Grid container spacing={2}>
      {groups.map(group => {
        // Capitalize first letter of group name
        const groupName = group?.groupName
          ? group.groupName.charAt(0).toUpperCase() + group.groupName.slice(1)
          : 'Untitled Group'

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={group?._id || group?.groupName}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Group Name and Status */}
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={1}>
                    <Tooltip title={groupName || 'no Groupname is mentioned'} arrow>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          flex: 1
                        }}
                      >
                        {groupName || 'no Groupname is mentioned'}
                      </Typography>
                    </Tooltip>

                    {group?.status === 'public' ? (
                      <Chip
                        size='small'
                        icon={<PublicIcon sx={{ fontSize: 14 }} />}
                        label='Public'
                        sx={{
                          height: 24,
                          fontWeight: 600,
                          fontSize: '0.7rem',
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
                        size='small'
                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                        label='Private'
                        sx={{
                          height: 24,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          background: alpha(theme.palette.warning.main, 0.12),
                          color: theme.palette.warning.main,
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          '& .MuiChip-icon': {
                            color: theme.palette.warning.main
                          }
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Description - Fixed Height for 2 Lines with Ellipsis */}
                <Box
                  sx={{
                    height: 42,
                    mb: 0.5
                  }}
                >
                  <Tooltip title={group?.description || 'No description'} arrow>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}
                    >
                      {group?.description || 'No description provided'}
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Creator Info - Compact */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mb: 1,
                    p: 1,
                    borderRadius: 1.5,
                    background: alpha(theme.palette.background.paper, 0.5)
                  }}
                >
                  <PersonIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                  <Tooltip
                    title={`Created by: ${
                      group?.creatorEmail || (group?.createdBy ? String(group.createdBy) : 'Unknown')
                    }`}
                    arrow
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {group?.creatorEmail || (group?.createdBy ? String(group.createdBy).slice(0, 8) : 'Unknown')}
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Member Count */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1.5
                    // background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(
                    //   theme.palette.secondary.main,
                    //   0.05
                    // )})`
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                  <Typography variant='caption' sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                    {group?.membersCount === 0
                      ? 'No Members'
                      : group?.membersCount > 1
                        ? `${group?.membersCount} members`
                        : `${group?.membersCount} member`}
                  </Typography>
                </Box>

                {/* Filters Section - Compact */}
                <Box sx={{ mb: 1.5, flexGrow: 1 }}>
                  <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mb: 0.75 }}>
                    <FilterIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textTransform: 'uppercase'
                      }}
                    >
                      Filters
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(
                        theme.palette.secondary.main,
                        0.03
                      )})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                      minHeight: 78,
                      maxHeight: 100,
                      overflowY: 'auto'
                    }}
                  >
                    <Stack
                      direction='row'
                      spacing={1}
                      useFlexGap
                      sx={{
                        flexWrap: 'wrap',
                        rowGap: 1,
                        columnGap: 1,
                        width: '100%'
                      }}
                    >
                      {(() => {
                        // Create filter objects with their order for sorting
                        const filters = []

                        if (group?.ageGroup) {
                          filters.push({
                            type: 'age',
                            order: group.ageGroup.order || 1,
                            chip: (
                              <Tooltip
                                key='age'
                                arrow
                                title={`Age Range: ${group.ageGroup.min}-${group.ageGroup.max} years`}
                              >
                                <Chip
                                  size='small'
                                  label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`}
                                  icon={<CakeIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    height: 30,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                    background: `linear-gradient(135deg, ${alpha(
                                      theme.palette.grey[600],
                                      0.2
                                    )}, ${alpha(theme.palette.grey[600], 0.15)})`,
                                    boxShadow: `0 1px 3px ${alpha(theme.palette.grey[400], 0.08)}`,
                                    color: theme.palette.grey[900],
                                    border: `1px solid ${alpha(theme.palette.grey[600], 0.2)}`,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      background: `linear-gradient(135deg, ${alpha(
                                        theme.palette.grey[600],
                                        0.28
                                      )}, ${alpha(theme.palette.grey[600], 0.22)})`,
                                      boxShadow: `0 2px 4px ${alpha(theme.palette.grey[600], 0.12)}`,
                                      transform: 'translateY(-1px)'
                                    },
                                    '& .MuiChip-icon': {
                                      fontSize: 16,
                                      color: theme.palette.grey[600],
                                      marginLeft: '8px',
                                      marginRight: '-2px'
                                    },
                                    '& .MuiChip-label': {
                                      color: theme.palette.grey[600],
                                      paddingLeft: '10px',
                                      paddingRight: '12px'
                                    }
                                  }}
                                />
                              </Tooltip>
                            )
                          })
                        }

                        if (group?.gender) {
                          const genderValues = Array.isArray(group.gender) ? group.gender : [String(group.gender)]
                          const genderLabel = genderValues.join(', ')
                          filters.push({
                            type: 'gender',
                            order: group.gender.order || 1,
                            chip: (
                              <Tooltip key='gender' arrow title={`Gender: ${genderLabel}`}>
                                <Chip
                                  size='small'
                                  label={genderLabel.length > 18 ? genderLabel.substring(0, 18) + '...' : genderLabel}
                                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    height: 30,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                    background: alpha(theme.palette.grey[400], 0.15),
                                    boxShadow: `0 1px 3px ${alpha(theme.palette.grey[400], 0.08)}`,
                                    color: theme.palette.grey[600],
                                    border: `1px solid ${alpha(theme.palette.grey[400], 0.2)}`,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      background: alpha(theme.palette.grey[400], 0.22),
                                      boxShadow: `0 2px 4px ${alpha(theme.palette.grey[400], 0.12)}`,
                                      transform: 'translateY(-1px)'
                                    },
                                    '& .MuiChip-icon': {
                                      fontSize: 16,
                                      color: theme.palette.grey[600],
                                      marginLeft: '8px',
                                      marginRight: '-2px'
                                    },
                                    '& .MuiChip-label': {
                                      color: theme.palette.grey[600],
                                      paddingLeft: '10px',
                                      paddingRight: '12px'
                                    }
                                  }}
                                />
                              </Tooltip>
                            )
                          })
                        }

                        if (group?.location?.country || group?.location?.region || group?.location?.city) {
                          const parts = [
                            group?.location?.country,
                            group?.location?.region,
                            group?.location?.city
                          ].filter(Boolean)
                          const locationLabel = parts.join(', ')

                          if (locationLabel) {
                            filters.push({
                              type: 'location',
                              order: group.location.order || 1,
                              chip: (
                                <Tooltip key='location' arrow title={`Location: ${locationLabel}`}>
                                  <Chip
                                    size='small'
                                    label={
                                      locationLabel.length > 20 ? locationLabel.substring(0, 20) + '...' : locationLabel
                                    }
                                    icon={<LocationIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                      height: 30,
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      borderRadius: 1.5,
                                      background: alpha(theme.palette.grey[500], 0.12),
                                      boxShadow: `0 1px 3px ${alpha(theme.palette.grey[500], 0.08)}`,
                                      color: theme.palette.grey[700],
                                      border: `1px solid ${alpha(theme.palette.grey[500], 0.25)}`,
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        background: alpha(theme.palette.grey[500], 0.18),
                                        boxShadow: `0 2px 4px ${alpha(theme.palette.grey[500], 0.12)}`,
                                        transform: 'translateY(-1px)'
                                      },
                                      '& .MuiChip-icon': {
                                        fontSize: 16,
                                        color: theme.palette.grey[700],
                                        marginLeft: '8px',
                                        marginRight: '-2px'
                                      },
                                      '& .MuiChip-label': {
                                        color: theme.palette.grey[700],
                                        paddingLeft: '10px',
                                        paddingRight: '12px'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              )
                            })
                          }
                        }

                        // Sort filters by their order and return chips
                        return filters.sort((a, b) => a.order - b.order).map(filter => filter.chip)
                      })()}
                      {!group?.ageGroup &&
                        !group?.gender &&
                        !group?.location?.country &&
                        !group?.location?.region &&
                        !group?.location?.city && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                              width: '100%',
                              py: 1
                            }}
                          >
                            <FilterIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography
                              variant='caption'
                              sx={{
                                fontSize: '0.75rem',
                                color: 'text.disabled',
                                fontStyle: 'italic'
                              }}
                            >
                              No filters applied
                            </Typography>
                          </Box>
                        )}
                    </Stack>
                  </Box>
                </Box>
                {/* Action Buttons - With Text Labels */}
                <Divider sx={{ my: 1.5 }} />
                <Stack direction='row' spacing={0.75} justifyContent='space-between' alignItems='center'>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => onViewGroup(group._id)}
                    sx={{
                      flex: 1,
                      fontSize:
                        pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail
                          ? '0.75rem'
                          : '0.8125rem',
                      py: 0.75,
                      px: pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail ? 1 : 1.5,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.info.main, 0.2),
                      color: alpha(theme.palette.info.main, 0.6),
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      minWidth: 0,
                      '&:hover': {
                        borderColor: theme.palette.info.main,
                        color: theme.palette.info.main,
                        background: alpha(theme.palette.info.main, 0.08),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`
                      }
                    }}
                    startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                  >
                    View
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => onEditGroup(group._id)}
                    sx={{
                      flex: 1,
                      fontSize:
                        pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail
                          ? '0.75rem'
                          : '0.8125rem',
                      py: 0.75,
                      px: pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail ? 1 : 1.5,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.warning.main, 0.2),
                      color: alpha(theme.palette.warning.main, 0.6),
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      minWidth: 0,
                      '&:hover': {
                        borderColor: theme.palette.warning.main,
                        color: theme.palette.warning.main,
                        background: alpha(theme.palette.warning.main, 0.08),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`
                      }
                    }}
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                  >
                    Edit
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => handleDeleteClick(group)}
                    sx={{
                      flex: 1,
                      fontSize:
                        pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail
                          ? '0.75rem'
                          : '0.8125rem',
                      py: 0.75,
                      px: pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail ? 1 : 1.5,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.error.main, 0.2),
                      color: alpha(theme.palette.error.main, 0.6),
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      minWidth: 0,
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.main,
                        background: alpha(theme.palette.error.main, 0.08),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                      }
                    }}
                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                  >
                    Delete
                  </Button>
                  {pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail && (
                    <Box sx={{ position: 'relative', flex: '0 0 auto' }}>
                      <Tooltip title={`${pendingRequests[group._id]} pending join requests`}>
                        <Badge
                          badgeContent={pendingRequests[group._id]}
                          color='error'
                          sx={{
                            '& .MuiBadge-badge': {
                              right: -3,
                              top: -3,
                              fontSize: '0.65rem',
                              minWidth: 16,
                              height: 16,
                              padding: '0 4px'
                            }
                          }}
                        >
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => handleJoinRequestClick(group)}
                            sx={{
                              minWidth: 'auto',
                              px: 1.25,
                              py: 0.75,
                              borderRadius: 2,
                              borderColor: alpha(theme.palette.primary.main, 0.2),
                              color: alpha(theme.palette.primary.main, 0.6),
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                background: alpha(theme.palette.primary.main, 0.08),
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            }}
                          >
                            <GroupAddIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Badge>
                      </Tooltip>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )
      })}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-group'
        onConfirm={() => {
          handleFinalDeleteGroup()
          setGroupToDelete(null) // Reset after confirmation
        }}
      />
    </Grid>
  )
}

export default GroupCard
