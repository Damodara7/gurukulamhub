'use client'

// React Imports
import { useRef, useState, useEffect, useCallback } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// MUI Imports
import {
  Badge,
  Typography,
  Avatar,
  useMediaQuery,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tabs,
  Tab
} from '@mui/material'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { API_URLS } from '@/configs/apiConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import * as RestApi from '@/utils/restApiUtil'

const ScrollWrapper = ({ children, hidden, isMobile = false }) => {
  if (hidden || isMobile) {
    return (
      <div
        className='overflow-x-hidden'
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}
      >
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar
        style={{ height: '100%', maxHeight: '100%' }}
        options={{
          wheelPropagation: false,
          suppressScrollX: true,
          swipeEasing: true
        }}
      >
        {children}
      </PerfectScrollbar>
    )
  }
}

const getNotificationIcon = type => {
  const iconMap = {
    QUIZ_APPROVED: 'ri-checkbox-circle-line',
    QUIZ_REJECTED: 'ri-close-circle-line',
    QUIZ_PENDING_APPROVAL: 'ri-time-line',
    GAME_CREATED: 'ri-gamepad-line',
    GROUP_JOINED: 'ri-group-line',
    GROUP_REMOVED: 'ri-group-2-line',
    ROLE_ASSIGNED: 'ri-shield-user-line',
    ROLE_REMOVED: 'ri-shield-cross-line',
    PROFILE_COMPLETION_REMINDER: 'ri-user-settings-line'
  }
  return iconMap[type] || 'ri-notification-line'
}

const getNotificationColor = type => {
  const colorMap = {
    QUIZ_APPROVED: 'success',
    QUIZ_REJECTED: 'error',
    QUIZ_PENDING_APPROVAL: 'warning',
    GAME_CREATED: 'primary',
    GROUP_JOINED: 'info',
    GROUP_REMOVED: 'error',
    ROLE_ASSIGNED: 'warning',
    ROLE_REMOVED: 'error',
    PROFILE_COMPLETION_REMINDER: 'secondary'
  }
  return colorMap[type] || 'primary'
}

const formatTime = dateString => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const getAvatar = notification => {
  const { type, metadata } = notification
  const avatarIcon = getNotificationIcon(type)
  const avatarColor = getNotificationColor(type)

  if (metadata?.avatarImage) {
    return <Avatar src={metadata.avatarImage} />
  } else {
    return (
      <CustomAvatar color={avatarColor} skin='light-static'>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0: All, 1: Unread, 2: Read, 3: Favourite

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const { data: session } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme => theme.breakpoints.between('sm', 'lg'))
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme => theme.breakpoints.up('lg'))
  const isXLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'))
  const { settings } = useSettings()

  const userId = session?.user?.id ? String(session.user.id) : null
  const userRoles = session?.user?.roles || []
  const isAdmin = userRoles?.includes('ADMIN') || userRoles?.includes('SUPER_ADMIN') || false

  // Fetch notifications from API - always fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log('[Notifications] No userId available, skipping fetch')
      return
    }

    try {
      setLoading(true)
      console.log('[Notifications] Fetching all notifications for userId:', userId)

      // Always fetch all notifications, we'll filter on client side
      const apiUrl = `${API_URLS.v0.NOTIFICATIONS}?limit=100&sortBy=createdAt&sortOrder=desc`

      const result = await RestApi.get(apiUrl)

      console.log('[Notifications] Full API Response:', JSON.stringify(result, null, 2))
      console.log('[Notifications] result.result type:', typeof result?.result)
      console.log('[Notifications] result.result isArray:', Array.isArray(result?.result))

      if (result?.status === 'success') {
        // Handle paginated response or direct array
        let notificationsList = []

        // Check if result.result is an object with notifications property (paginated)
        if (result.result && typeof result.result === 'object' && !Array.isArray(result.result)) {
          if (result.result.notifications && Array.isArray(result.result.notifications)) {
            notificationsList = result.result.notifications
            console.log('[Notifications] Found paginated response with', notificationsList.length, 'notifications')
          } else if (Array.isArray(result.result)) {
            notificationsList = result.result
            console.log('[Notifications] Found direct array response with', notificationsList.length, 'notifications')
          }
        } else if (Array.isArray(result.result)) {
          notificationsList = result.result
          console.log('[Notifications] Found direct array response with', notificationsList.length, 'notifications')
        }

        console.log('[Notifications] Final notifications list:', notificationsList)
        console.log('[Notifications] Setting notifications:', notificationsList.length)
        setNotifications(notificationsList)
        const unread = notificationsList.filter(n => !n.isRead).length
        setUnreadCount(unread)
        console.log('[Notifications] Unread count:', unread)
      } else {
        console.error('[Notifications] Failed to fetch notifications:', result?.message)
      }
    } catch (error) {
      console.error('[Notifications] Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    if (!userId) return

    try {
      const result = await RestApi.get(`${API_URLS.v0.NOTIFICATIONS}?count=true`)
      if (result?.status === 'success') {
        setUnreadCount(result.result?.unread || 0)
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }, [userId])

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId) {
      console.log('[Notifications WS] No userId available, skipping WebSocket connection')
      return
    }

    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
            window.location.host
          }/api/ws/notifications/${userId}`
        : ''

    console.log('[Notifications WS] Connecting to:', wsUrl)

    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)

      wsRef.onopen = () => {
        console.log('[Notifications WS] Connected to notifications for userId:', userId)
        setIsConnected(true)
        setSocket(wsRef)
      }

      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)

          if (msg.type === 'notification') {
            // New notification received
            const newNotification = msg.data
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
          } else if (msg.type === 'notificationCount') {
            // Notification count updated
            setUnreadCount(msg.data?.unread || 0)
          } else if (msg.type === 'notificationUpdate') {
            // Notification updated (e.g., marked as read, favorite toggled)
            const updatedNotification = msg.data
            setNotifications(prev =>
              prev.map(n => {
                const notificationId = updatedNotification.notificationId || updatedNotification._id
                if ((n._id?.toString() || n._id) === (notificationId?.toString() || notificationId)) {
                  return { ...n, ...updatedNotification }
                }
                return n
              })
            )
            if (updatedNotification.isRead) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          } else if (msg.type === 'connected') {
            console.log('[WS] Notification service connected')
          }
        } catch (e) {
          console.error('[WS] Error parsing notification message', e)
        }
      }

      wsRef.onerror = err => {
        console.error('[WS] Notification connection error', err)
        setIsConnected(false)
      }

      wsRef.onclose = () => {
        console.log('[WS] Notification connection closed')
        setIsConnected(false)
        setSocket(null)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [userId])

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (userId) {
      fetchNotifications()
      fetchNotificationCount()
    }
  }, [userId, fetchNotifications, fetchNotificationCount])

  // Reset to All tab when opening
  useEffect(() => {
    if (open) {
      setActiveTab(0) // Always open to All tab
    }
  }, [open])

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (open && userId) {
      fetchNotifications() // Always fetch all notifications
    }
  }, [open, userId, fetchNotifications])

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Mark notification as read/unread
  const handleReadNotification = async (event, notificationId) => {
    event.stopPropagation()

    try {
      const result = await RestApi.put(API_URLS.v0.NOTIFICATIONS, { markAsRead: notificationId })

      if (result?.status === 'success') {
        setNotifications(prev => {
          // Find the notification first to check if it was unread
          const notification = prev.find(n => {
            const nId = n._id?.toString() || n._id
            const notifId = notificationId?.toString() || notificationId
            return nId === notifId
          })

          const wasUnread = notification && !notification.isRead

          // Decrease unread count only if it was unread before
          if (wasUnread) {
            setUnreadCount(count => Math.max(0, count - 1))
          }

          // Update the notification state
          return prev.map(n => {
            // Handle both string and ObjectId comparison
            const nId = n._id?.toString() || n._id
            const notifId = notificationId?.toString() || notificationId
            if (nId === notifId) {
              return { ...n, isRead: true, readAt: new Date() }
            }
            return n
          })
        })
      }
    } catch (error) {
      console.error('Error updating notification:', error)
    }
  }

  // Toggle favorite status
  const handleToggleFavorite = async (event, notificationId) => {
    event.stopPropagation()

    try {
      const result = await RestApi.put(API_URLS.v0.NOTIFICATIONS, { toggleFavorite: notificationId })

      if (result?.status === 'success') {
        const updatedNotification = result.result
        setNotifications(prev =>
          prev.map(n => {
            // Handle both string and ObjectId comparison
            const nId = n._id?.toString() || n._id
            const updatedId = notificationId?.toString() || notificationId
            if (nId === updatedId) {
              return { ...n, isFavorite: updatedNotification.isFavorite }
            }
            return n
          })
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 0) return notifications // All
    if (activeTab === 1) return notifications.filter(n => !n.isRead) // Unread
    if (activeTab === 2) return notifications.filter(n => n.isRead) // Read
    if (activeTab === 3) return notifications.filter(n => n.isFavorite) // Favourite
    return notifications
  }

  // Delete notification
  const handleRemoveNotification = async (event, notificationId) => {
    event.stopPropagation()

    try {
      const result = await RestApi.del(`${API_URLS.v0.NOTIFICATIONS}?id=${notificationId}`)

      if (result?.status === 'success') {
        setNotifications(prev => {
          // Find the notification first to check if it was unread
          const notification = prev.find(n => {
            const nId = n._id?.toString() || n._id
            const notifId = notificationId?.toString() || notificationId
            return nId === notifId
          })

          const wasUnread = notification && !notification.isRead
          if (wasUnread) {
            setUnreadCount(count => Math.max(0, count - 1))
          }

          // Remove the notification using robust ID comparison
          return prev.filter(n => {
            const nId = n._id?.toString() || n._id
            const notifId = notificationId?.toString() || notificationId
            return nId !== notifId
          })
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Mark all notifications as read
  const readAllNotifications = async () => {
    try {
      const result = await RestApi.put(`${API_URLS.v0.NOTIFICATIONS}`, { markAllAsRead: true })

      if (result?.status === 'success') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const readAll = notifications.every(notification => notification.isRead)
  const filteredNotifications = getFilteredNotifications()
  const tabCounts = {
    all: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    read: notifications.filter(n => n.isRead).length,
    favorite: notifications.filter(n => n.isFavorite).length
  }

  return (
    <>
      <Box ref={anchorRef}>
        <IconButtonTooltip title='Notifications' onClick={handleToggle} className='!text-textPrimary'>
          <Badge
            color='error'
            className='cursor-pointer'
            badgeContent={unreadCount}
            overlap='circular'
            invisible={unreadCount === 0}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <i className='ri-notification-2-line' />
          </Badge>
        </IconButtonTooltip>
      </Box>

      {/* Use Dialog - full screen on mobile, with margins on larger screens */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isSmallScreen}
        maxWidth={false}
        fullWidth={!isSmallScreen}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
        PaperProps={{
          sx: {
            backgroundColor: settings.mode === 'dark' ? '#1e1e1e' : '#fff',
            maxHeight: isSmallScreen ? '100vh' : '90vh',
            margin: isSmallScreen ? 0 : { sm: '24px', md: '32px', lg: '32px', xl: '40px' },
            width: isSmallScreen
              ? '100%'
              : { sm: 'calc(100% - 48px)', md: 'calc(100% - 64px)', lg: 'calc(100% - 64px)', xl: 'calc(100% - 80px)' },
            maxWidth: isSmallScreen ? '100%' : { sm: '600px', md: '800px', lg: '1000px', xl: '1100px' },
            display: 'flex',
            flexDirection: 'column',
            height: isSmallScreen ? '100vh' : 'auto',
            borderRadius: isSmallScreen ? 0 : { sm: '8px', md: '12px', lg: '16px', xl: '16px' },
            mx: 'auto'
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            pt: { xs: 2, sm: 3, md: 3, lg: 4, xl: 5 },
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <div className='flex items-center justify-between'>
            <Typography
              variant='h5'
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem', xl: '2.25rem' },
                fontWeight: 600
              }}
            >
              Notifications
            </Typography>
            <IconButton
              onClick={handleClose}
              size='medium'
              sx={{
                minWidth: { xs: '40px', sm: '44px', md: '48px', lg: '52px', xl: '56px' },
                minHeight: { xs: '40px', sm: '44px', md: '48px', lg: '52px', xl: '56px' }
              }}
            >
              <i className='ri-close-line' />
            </IconButton>
          </div>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mt: { xs: 2, sm: 2.5, md: 3, lg: 3.5, xl: 4 },
              minHeight: { xs: '44px', sm: '48px', md: '52px', lg: '56px', xl: '60px' },
              width: '100%',
              '& .MuiTabs-flexContainer': {
                gap: { xs: 0, sm: 0, md: 2 },
                justifyContent: { xs: 'space-between', sm: 'space-between', md: 'center' },
                width: '100%'
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem', lg: '0.9375rem', xl: '1rem' },
                minHeight: { xs: '44px', sm: '48px', md: '52px', lg: '56px', xl: '60px' },
                padding: { xs: '8px 4px', sm: '10px 8px', md: '12px 16px', lg: '14px 20px', xl: '16px 24px' },
                fontWeight: 500,
                whiteSpace: { xs: 'normal', sm: 'normal', md: 'nowrap' },
                textTransform: 'none',
                minWidth: { xs: 0, sm: 0, md: 'auto' },
                flex: { xs: '1 1 0%', sm: '1 1 0%', md: '0 1 auto' },
                maxWidth: { xs: 'none', sm: 'none', md: 'none' }
              },
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
            variant={isSmallScreen || isTablet ? 'fullWidth' : 'standard'}
            scrollButtons={false}
            allowScrollButtonsMobile={false}
          >
            <Tab label={`All (${tabCounts.all})`} />
            <Tab label={`Unread (${tabCounts.unread})`} />
            <Tab label={`Read (${tabCounts.read})`} />
            <Tab label={`Favourite (${tabCounts.favorite})`} />
          </Tabs>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: isSmallScreen ? 'calc(100vh - 180px)' : 'calc(90vh - 180px)',
            minHeight: 0,
            '&.MuiDialogContent-root': {
              padding: 0
            }
          }}
        >
          <ScrollWrapper hidden={false} isMobile={true}>
            {loading ? (
              <div className='flex items-center justify-center p-8'>
                <CircularProgress size={24} />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className='flex items-center justify-center p-8'>
                <Typography variant='body2' color='text.secondary'>
                  No notifications
                </Typography>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const { _id, title, message, isRead, isFavorite, createdAt, type, actionUrl } = notification

                return (
                  <div
                    key={_id || index}
                    className={classnames('flex cursor-pointer group', {
                      'border-be': index !== filteredNotifications.length - 1,
                      'bg-actionHover': !isRead,
                      'hover:bg-actionHover': isRead
                    })}
                    style={{
                      padding: isSmallScreen
                        ? '10px 12px'
                        : isTablet
                          ? '12px 14px'
                          : isXLargeScreen
                            ? '14px 16px'
                            : '12px 16px',
                      gap: isSmallScreen ? '10px' : isTablet ? '12px' : isXLargeScreen ? '14px' : '12px',
                      backgroundColor: !isRead
                        ? settings.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.08)'
                          : 'rgba(25, 118, 210, 0.08)'
                        : 'transparent'
                    }}
                    onClick={e => {
                      if (!isRead) {
                        handleReadNotification(e, _id)
                      }
                      if (actionUrl) {
                        const localizedUrl = actionUrl.startsWith('http')
                          ? actionUrl
                          : getLocalizedUrl(actionUrl, locale || 'en')
                        router.push(localizedUrl)
                        handleClose()
                      }
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        '& .MuiAvatar-root': {
                          width: { xs: 32, sm: 36, md: 40, lg: 42, xl: 44 },
                          height: { xs: 32, sm: 36, md: 40, lg: 42, xl: 44 }
                        }
                      }}
                    >
                      {getAvatar(notification)}
                    </Box>
                    <div className='flex flex-col flex-auto' style={{ minWidth: 0 }}>
                      <Typography
                        className='font-medium'
                        color={!isRead ? 'primary' : 'text.primary'}
                        sx={{
                          fontWeight: !isRead ? 600 : 500,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem', lg: '1rem', xl: '1rem' },
                          lineHeight: 1.25,
                          mb: { xs: 0.25, sm: 0.375, md: 0.5 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 1, sm: 2 },
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem', lg: '0.875rem', xl: '0.9375rem' },
                          lineHeight: 1.3,
                          mb: { xs: 0.25, sm: 0.375, md: 0.5 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 1, sm: 2, md: 2 },
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: { xs: '0.625rem', sm: '0.6875rem', md: '0.75rem', lg: '0.75rem', xl: '0.8125rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {formatTime(createdAt)}
                      </Typography>
                    </div>
                    <Box
                      sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }
                      }}
                    >
                      {(activeTab === 0 || activeTab === 3) && (
                        <IconButton
                          size='medium'
                          onClick={e => handleToggleFavorite(e, _id)}
                          className={classnames({
                            'text-warning': isFavorite,
                            'text-textSecondary': !isFavorite
                          })}
                          sx={{
                            minWidth: { xs: '32px', sm: '36px', md: '40px', lg: '40px', xl: '44px' },
                            minHeight: { xs: '32px', sm: '36px', md: '40px', lg: '40px', xl: '44px' },
                            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.25rem', xl: '1.375rem' },
                            padding: { xs: '6px', sm: '8px', md: '8px', lg: '10px', xl: '10px' }
                          }}
                        >
                          <i className={isFavorite ? 'ri-star-fill' : 'ri-star-line'} />
                        </IconButton>
                      )}
                    </Box>
                  </div>
                )
              })
            )}
          </ScrollWrapper>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NotificationDropdown
