import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  Divider,
  Tooltip,
  Badge,
  Button,
  IconButton,
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
  FilterList as FilterIcon,
  Campaign as CampaignIcon,
  Chat as ChatIcon
} from '@mui/icons-material'
import GroupFallBackCard from './GroupFallBackCard'
import ManagementCardGrid from '@/components/management/ManagementCardGrid'
import { MANAGEMENT_CARD_FILTER_BOX_SX } from '@/constants/managementCardGrid'
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
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loadingUnreadCounts, setLoadingUnreadCounts] = useState(false)
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

  // Fetch unread message counts for groups
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!session?.user?.email || groups.length === 0) return

      setLoadingUnreadCounts(true)
      try {
        const counts = {}
        
        // Fetch counts for all groups in parallel
        const fetchPromises = groups.map(async (group) => {
          try {
            // Fetch recent messages (most recent first, limit 500 to catch more unread messages)
            const result = await RestApi.get(
              `${API_URLS.v0.USERS_GROUP_CHAT}?groupId=${group._id}&limit=500&userEmail=${session.user.email}`
            )
            
            if (result?.status === 'success' && Array.isArray(result.result)) {
              // Count messages that are not read by this user and not sent by this user
              const unreadCount = result.result.filter(msg => {
                // Don't count own messages
                if (msg.senderEmail === session.user.email) return false
                // Don't count messages deleted for this user
                if (msg.deletedFor?.some(d => d.userEmail === session.user.email)) return false
                // Don't count messages deleted for everyone
                if (msg.deletedForEveryone) return false
                // Check if message is read by this user
                const isRead = msg.readBy?.some(reader => reader.userEmail === session.user.email)
                return !isRead
              }).length
              
              return { groupId: group._id, count: unreadCount }
            }
            return { groupId: group._id, count: 0 }
          } catch (error) {
            console.error(`Error fetching unread count for group ${group._id}:`, error)
            return { groupId: group._id, count: 0 }
          }
        })
        
        const results = await Promise.all(fetchPromises)
        
        // Build counts object
        results.forEach(({ groupId, count }) => {
          if (count > 0) {
            counts[groupId] = count
          }
        })
        
        setUnreadCounts(counts)
      } catch (error) {
        console.error('Error fetching unread counts:', error)
      } finally {
        setLoadingUnreadCounts(false)
      }
    }

    fetchUnreadCounts()
  }, [groups, session?.user?.email])

  // WebSocket connections for each group to listen for new messages
  useEffect(() => {
    if (!session?.user?.email || groups.length === 0) return

    const groupSockets = {}

    groups.forEach(group => {
      const wsUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
              window.location.host
            }/api/ws/groups/${group._id}/chat`
          : ''

      if (wsUrl) {
        const wsRef = new WebSocket(wsUrl)

        wsRef.onopen = () => {
          console.log(`[WS] GroupCard connected to group ${group._id} chat`)
        }

        wsRef.onmessage = event => {
          try {
            const msg = JSON.parse(event.data)

            if (msg.type === 'newMessage' || msg.type === 'newChatMessage') {
              const message = msg.data
              // Only increment if message is not from current user and not deleted
              if (
                message.senderEmail !== session.user.email &&
                !message.deletedFor?.some(d => d.userEmail === session.user.email) &&
                !message.deletedForEveryone
              ) {
                // Check if message is already read
                const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
                if (!isRead) {
                  setUnreadCounts(prev => ({
                    ...prev,
                    [group._id]: (prev[group._id] || 0) + 1
                  }))
                }
              }
            } else if (msg.type === 'messageUpdate') {
              const message = msg.data
              // If message was marked as read, decrement count
              const isRead = message.readBy?.some(reader => reader.userEmail === session.user.email)
              if (isRead && message.senderEmail !== session.user.email) {
                setUnreadCounts(prev => {
                  const currentCount = prev[group._id] || 0
                  if (currentCount > 0) {
                    return {
                      ...prev,
                      [group._id]: currentCount - 1
                    }
                  }
                  return prev
                })
              }
            }
          } catch (e) {
            console.error(`[WS] GroupCard error parsing message for group ${group._id}:`, e)
          }
        }

        wsRef.onerror = err => {
          console.error(`[WS] GroupCard error for group ${group._id}:`, err)
        }

        wsRef.onclose = () => {
          console.log(`[WS] GroupCard connection closed for group ${group._id}`)
        }

        groupSockets[group._id] = wsRef
      }
    })

    return () => {
      Object.values(groupSockets).forEach(ws => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
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
    <Box sx={{ width: '100%' }}>
      <ManagementCardGrid>
        {groups.map(group => {
          // Capitalize first letter of group name
          const groupName = group?.groupName
            ? group.groupName.charAt(0).toUpperCase() + group.groupName.slice(1)
            : 'Untitled Group'
          
          const unreadCount = unreadCounts[group._id] || 0

          return (
            <Card
                key={group?._id || group?.groupName}
                sx={{
                  width: '100%',
                  minWidth: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: { xs: 2, sm: 3 },
                  background: theme.palette.background.paper,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                      : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                  '&:hover': {
                    transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`
                        : `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.3)
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Group Name and Status */}
                  <Box sx={{ mb: 1.5 }}>
                    <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={1}>
                      <Tooltip title={groupName || 'no Groupname is mentioned'} arrow>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.1rem' },
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

                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        {group?.isAnnouncementOnly && (
                          <Tooltip title='Announcement mode - Only admins can send messages' arrow>
                            <IconButton
                              size='small'
                              sx={{
                                width: { xs: 24, sm: 28 },
                                height: { xs: 24, sm: 28 },
                                p: 0.5,
                                background: alpha(theme.palette.info.main, 0.12),
                                color: theme.palette.info.main,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                '&:hover': {
                                  background: alpha(theme.palette.info.main, 0.2),
                                  borderColor: alpha(theme.palette.info.main, 0.4)
                                }
                              }}
                            >
                              <CampaignIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {group?.status === 'public' ? (
                          <Tooltip title='Public Group' arrow>
                            <IconButton
                              size='small'
                              sx={{
                                width: { xs: 24, sm: 28 },
                                height: { xs: 24, sm: 28 },
                                p: 0.5,
                                background: alpha(theme.palette.success.main, 0.12),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                '&:hover': {
                                  background: alpha(theme.palette.success.main, 0.2),
                                  borderColor: alpha(theme.palette.success.main, 0.4)
                                }
                              }}
                            >
                              <PublicIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title='Private Group' arrow>
                            <IconButton
                              size='small'
                              sx={{
                                width: { xs: 24, sm: 28 },
                                height: { xs: 24, sm: 28 },
                                p: 0.5,
                                background: alpha(theme.palette.warning.main, 0.12),
                                color: theme.palette.warning.main,
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                '&:hover': {
                                  background: alpha(theme.palette.warning.main, 0.2),
                                  borderColor: alpha(theme.palette.warning.main, 0.4)
                                }
                              }}
                            >
                              <LockIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Description — fluid height, max 2 lines */}
                  <Box sx={{ mb: { xs: 0.75, sm: 0.5 } }}>
                    <Tooltip title={group?.description || 'No description'} arrow>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
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
                      gap: { xs: 0.5, sm: 0.75 },
                      mb: { xs: 1, sm: 1.5 },
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: { xs: 1, sm: 1.5 },
                      background: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: theme.palette.primary.main }} />
                    <Tooltip
                      title={`Created by: ${
                        group?.creatorEmail || (group?.createdBy ? String(group.createdBy) : 'Unknown')
                      }`}
                      arrow
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
                      gap: { xs: 0.75, sm: 1 },
                      mb: { xs: 1, sm: 1.5 },
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: theme.palette.primary.main }} />
                    <Typography
                      variant='caption'
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, color: 'text.secondary', fontWeight: 600 }}
                    >
                      {group?.membersCount === 0
                        ? 'No Members'
                        : group?.membersCount > 1
                          ? `${group?.membersCount} members`
                          : `${group?.membersCount} member`}
                    </Typography>
                  </Box>

                  {/* Filters Section - Compact */}
                  <Box sx={{ mb: { xs: 1, sm: 1.5 }, flexGrow: 1 }}>
                    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
                      <FilterIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: theme.palette.primary.main }} />
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
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
                        ...MANAGEMENT_CARD_FILTER_BOX_SX,
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(
                          theme.palette.secondary.main,
                          0.03
                        )})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`
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
                          // Create filter chips from the filters array
                          const filterChips = []

                          if (group?.filters && Array.isArray(group.filters) && group.filters.length > 0) {
                            group.filters.forEach((filter, index) => {
                              if (filter.type === 'age' && filter.criteria) {
                                const { min, max } = filter.criteria
                                filterChips.push(
                                  <Tooltip key={`age-${index}`} arrow title={`Age Range: ${min}-${max} years`}>
                                    <Chip
                                      size='small'
                                      label={`Age: ${min}-${max}`}
                                      icon={<CakeIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                      sx={{
                                        height: { xs: 26, sm: 30 },
                                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                        background:
                                          theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.grey[300], 0.15)
                                            : `linear-gradient(135deg, ${alpha(theme.palette.grey[600], 0.2)}, ${alpha(
                                                theme.palette.grey[600],
                                                0.15
                                              )})`,
                                        boxShadow: `0 1px 3px ${alpha(
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.common.black
                                            : theme.palette.grey[400],
                                          0.08
                                        )}`,
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.text.primary
                                            : theme.palette.grey[900],
                                        border: `1px solid ${alpha(
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[300]
                                            : theme.palette.grey[600],
                                          0.2
                                        )}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          background:
                                            theme.palette.mode === 'dark'
                                              ? alpha(theme.palette.grey[300], 0.22)
                                              : `linear-gradient(135deg, ${alpha(
                                                  theme.palette.grey[600],
                                                  0.28
                                                )}, ${alpha(theme.palette.grey[600], 0.22)})`,
                                          boxShadow: `0 2px 4px ${alpha(
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.grey[300]
                                              : theme.palette.grey[600],
                                            0.12
                                          )}`,
                                          transform: 'translateY(-1px)'
                                        },
                                        '& .MuiChip-icon': {
                                          fontSize: 16,
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.text.secondary
                                              : theme.palette.grey[600],
                                          marginLeft: '8px',
                                          marginRight: '-2px'
                                        },
                                        '& .MuiChip-label': {
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.text.secondary
                                              : theme.palette.grey[600],
                                          paddingLeft: '10px',
                                          paddingRight: '12px'
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                )
                              } else if (filter.type === 'gender' && filter.criteria) {
                                const genderValues = Array.isArray(filter.criteria)
                                  ? filter.criteria
                                  : [String(filter.criteria)]
                                const genderLabel = genderValues
                                  .map(g => g.charAt(0).toUpperCase() + g.slice(1))
                                  .join(', ')
                                filterChips.push(
                                  <Tooltip key={`gender-${index}`} arrow title={`Gender: ${genderLabel}`}>
                                    <Chip
                                      size='small'
                                      label={
                                        genderLabel.length > 18 ? genderLabel.substring(0, 18) + '...' : genderLabel
                                      }
                                      icon={<PersonIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                      sx={{
                                        height: { xs: 26, sm: 30 },
                                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                        background:
                                          theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.grey[300], 0.15)
                                            : alpha(theme.palette.grey[400], 0.15),
                                        boxShadow: `0 1px 3px ${alpha(
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.common.black
                                            : theme.palette.grey[400],
                                          0.08
                                        )}`,
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.text.secondary
                                            : theme.palette.grey[600],
                                        border: `1px solid ${alpha(
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[300]
                                            : theme.palette.grey[400],
                                          0.2
                                        )}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          background:
                                            theme.palette.mode === 'dark'
                                              ? alpha(theme.palette.grey[300], 0.22)
                                              : alpha(theme.palette.grey[400], 0.22),
                                          boxShadow: `0 2px 4px ${alpha(
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.grey[300]
                                              : theme.palette.grey[400],
                                            0.12
                                          )}`,
                                          transform: 'translateY(-1px)'
                                        },
                                        '& .MuiChip-icon': {
                                          fontSize: 16,
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.text.secondary
                                              : theme.palette.grey[600],
                                          marginLeft: '8px',
                                          marginRight: '-2px'
                                        },
                                        '& .MuiChip-label': {
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.text.secondary
                                              : theme.palette.grey[600],
                                          paddingLeft: '10px',
                                          paddingRight: '12px'
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                )
                              } else if (filter.type === 'location' && filter.criteria) {
                                const parts = [
                                  filter.criteria.country,
                                  filter.criteria.region,
                                  filter.criteria.city
                                ].filter(Boolean)
                                const locationLabel = parts.join(', ')

                                if (locationLabel) {
                                  filterChips.push(
                                    <Tooltip key={`location-${index}`} arrow title={`Location: ${locationLabel}`}>
                                      <Chip
                                        size='small'
                                        label={
                                          locationLabel.length > 20
                                            ? locationLabel.substring(0, 20) + '...'
                                            : locationLabel
                                        }
                                        icon={<LocationIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                        sx={{
                                          height: { xs: 26, sm: 30 },
                                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                          fontWeight: 600,
                                          borderRadius: 1.5,
                                          background:
                                            theme.palette.mode === 'dark'
                                              ? alpha(theme.palette.grey[300], 0.12)
                                              : alpha(theme.palette.grey[500], 0.12),
                                          boxShadow: `0 1px 3px ${alpha(
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.common.black
                                              : theme.palette.grey[500],
                                            0.08
                                          )}`,
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.text.secondary
                                              : theme.palette.grey[700],
                                          border: `1px solid ${alpha(
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.grey[300]
                                              : theme.palette.grey[500],
                                            0.25
                                          )}`,
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': {
                                            background:
                                              theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.grey[300], 0.18)
                                                : alpha(theme.palette.grey[500], 0.18),
                                            boxShadow: `0 2px 4px ${alpha(
                                              theme.palette.mode === 'dark'
                                                ? theme.palette.grey[300]
                                                : theme.palette.grey[500],
                                              0.12
                                            )}`,
                                            transform: 'translateY(-1px)'
                                          },
                                          '& .MuiChip-icon': {
                                            fontSize: 16,
                                            color:
                                              theme.palette.mode === 'dark'
                                                ? theme.palette.text.secondary
                                                : theme.palette.grey[700],
                                            marginLeft: '8px',
                                            marginRight: '-2px'
                                          },
                                          '& .MuiChip-label': {
                                            color:
                                              theme.palette.mode === 'dark'
                                                ? theme.palette.text.secondary
                                                : theme.palette.grey[700],
                                            paddingLeft: '10px',
                                            paddingRight: '12px'
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  )
                                }
                              }
                            })
                          }

                          return filterChips
                        })()}
                        {(!group?.filters || group?.filters?.length === 0) && (
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
                            <FilterIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.disabled' }} />
                            <Typography
                              variant='caption'
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
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
                  {/* Action Buttons - Icon Only */}
                  <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
                  <Stack 
                    direction='row' 
                    spacing={{ xs: 2, sm: 3 }} 
                    justifyContent='center' 
                    alignItems='center'
                    flexWrap='wrap'
                  >
                    <Tooltip title='Open Chat' arrow placement='top'>
                      <Badge
                        badgeContent={unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null}
                        overlap='circular'
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 700,
                            minWidth: { xs: 18, sm: 20 },
                            height: { xs: 18, sm: 20 },
                            padding: { xs: '0 5px', sm: '0 6px' },
                            borderRadius: '10px',
                            backgroundColor: '#25D366', // WhatsApp green
                            color: 'white',
                            border: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white'}`,
                            boxShadow: `0 2px 8px ${alpha('#25D366', 0.4)}`,
                            top: { xs: 2, sm: 4 },
                            right: { xs: 2, sm: 4 }
                          }
                        }}
                      >
                        <IconButton
                          onClick={() => router.push(`/management/group/${group._id}/chat`)}
                          size='large'
                          sx={{
                            color: theme.palette.success.main,
                            background: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            width: { xs: 40, sm: 44, md: 48 },
                            height: { xs: 40, sm: 44, md: 48 },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: alpha(theme.palette.success.main, 0.15),
                              borderColor: alpha(theme.palette.success.main, 0.4),
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
                            }
                          }}
                        >
                          <ChatIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                        </IconButton>
                      </Badge>
                    </Tooltip>
                    
                    <Tooltip title='View Group Details' arrow placement='top'>
                      <IconButton
                        onClick={() => onViewGroup(group._id)}
                        size='large'
                        sx={{
                          color: theme.palette.info.main,
                          background: alpha(theme.palette.info.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: alpha(theme.palette.info.main, 0.15),
                            borderColor: alpha(theme.palette.info.main, 0.4),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`
                          }
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title='Edit Group' arrow placement='top'>
                      <IconButton
                        onClick={() => onEditGroup(group._id)}
                        size='large'
                        sx={{
                          color: theme.palette.warning.main,
                          background: alpha(theme.palette.warning.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: alpha(theme.palette.warning.main, 0.15),
                            borderColor: alpha(theme.palette.warning.main, 0.4),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`
                          }
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title='Delete Group' arrow placement='top'>
                      <IconButton
                        onClick={() => handleDeleteClick(group)}
                        size='large'
                        sx={{
                          color: theme.palette.error.main,
                          background: alpha(theme.palette.error.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: alpha(theme.palette.error.main, 0.15),
                            borderColor: alpha(theme.palette.error.main, 0.4),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      </IconButton>
                    </Tooltip>
                    
                    {pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail && (
                      <Tooltip title={`${pendingRequests[group._id]} pending join requests`} arrow placement='top'>
                        <Badge
                          badgeContent={pendingRequests[group._id]}
                          color='error'
                          sx={{
                            '& .MuiBadge-badge': {
                              right: { xs: 4, sm: 6 },
                              top: { xs: 4, sm: 6 },
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              padding: '0 4px',
                              minWidth: { xs: 18, sm: 20 },
                              height: { xs: 18, sm: 20 }
                            }
                          }}
                        >
                          <IconButton
                            onClick={() => handleJoinRequestClick(group)}
                            size='large'
                            sx={{
                              color: theme.palette.primary.main,
                              background: alpha(theme.palette.primary.main, 0.08),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              width: { xs: 44, sm: 48 },
                              height: { xs: 40, sm: 44, md: 48 },
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.15),
                                borderColor: alpha(theme.palette.primary.main, 0.4),
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                              }
                            }}
                          >
                            <GroupAddIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                          </IconButton>
                        </Badge>
                      </Tooltip>
                    )}
                  </Stack>
                </CardContent>
              </Card>
          )
        })}
      </ManagementCardGrid>

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
    </Box>
  )
}

export default GroupCard
