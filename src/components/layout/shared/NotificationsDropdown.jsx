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
  Popper,
  Fade,
  Paper,
  ClickAwayListener,
  Typography,
  Chip,
  Tooltip,
  Divider,
  Avatar,
  useMediaQuery,
  Button,
  Box,
  CircularProgress
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

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden max-bs-[420px]'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='max-bs-[420px]' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getNotificationIcon = (type) => {
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

const getNotificationColor = (type) => {
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

const formatTime = (dateString) => {
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
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

const getAvatar = (notification) => {
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

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const { data: session } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const userId = session?.user?.id ? String(session.user.id) : null

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log('[Notifications] No userId available, skipping fetch')
      return
    }

    try {
      setLoading(true)
      console.log('[Notifications] Fetching notifications for userId:', userId)
      const result = await RestApi.get(`${API_URLS.v0.NOTIFICATIONS}?limit=20&sortBy=createdAt&sortOrder=desc`)
      
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
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/notifications/${userId}`
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
            // Notification updated (e.g., marked as read)
            const updatedNotification = msg.data
            setNotifications(prev =>
              prev.map(n => (n._id === updatedNotification._id ? updatedNotification : n))
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

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (open && userId) {
      fetchNotifications()
    }
  }, [open, userId, fetchNotifications])

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Mark notification as read/unread
  const handleReadNotification = async (event, notificationId, isRead) => {
    event.stopPropagation()
    
    try {
      const result = await RestApi.put(`${API_URLS.v0.NOTIFICATIONS}/${notificationId}`, { isRead })
      
      if (result?.status === 'success') {
        setNotifications(prev =>
          prev.map(n => (n._id === notificationId ? { ...n, isRead } : n))
        )
        if (isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        } else {
          setUnreadCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error updating notification:', error)
    }
  }

  // Delete notification
  const handleRemoveNotification = async (event, notificationId) => {
    event.stopPropagation()
    
    try {
      const result = await RestApi.del(`${API_URLS.v0.NOTIFICATIONS}?id=${notificationId}`)
      
      if (result?.status === 'success') {
        setNotifications(prev => {
          const notification = prev.find(n => n._id === notificationId)
          const wasUnread = notification && !notification.isRead
          if (wasUnread) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
          return prev.filter(n => n._id !== notificationId)
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
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-4 z-[1]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-4 z-[1]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <div>
                  <div className='flex items-center justify-between plb-2 pli-4 is-full gap-4'>
                    <Typography variant='h5' className='flex-auto'>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Chip size='small' variant='tonal' color='primary' label={`${unreadCount} New`} />
                    )}
                    <Tooltip
                      title={readAll ? 'Mark all as unread' : 'Mark all as read'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notifications.length > 0 ? (
                        <IconButtonTooltip
                          title='Mark all as read'
                          size='small'
                          onClick={readAllNotifications}
                          className='text-textPrimary'
                        >
                          <i className={readAll ? 'ri-mail-line' : 'ri-mail-open-line'} />
                        </IconButtonTooltip>
                      ) : (
                        <></>
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading ? (
                      <div className='flex items-center justify-center p-8'>
                        <CircularProgress size={24} />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className='flex items-center justify-center p-8'>
                        <Typography variant='body2' color='text.secondary'>
                          No notifications
                        </Typography>
                      </div>
                    ) : (
                      notifications.map((notification, index) => {
                        const { _id, title, message, isRead, createdAt, type, actionUrl } = notification

                        return (
                          <div
                            key={_id || index}
                            className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                              'border-be': index !== notifications.length - 1
                            })}
                            onClick={e => {
                              if (!isRead) {
                                handleReadNotification(e, _id, true)
                              }
                              if (actionUrl) {
                                // Ensure URL is localized
                                const localizedUrl = actionUrl.startsWith('http') 
                                  ? actionUrl 
                                  : getLocalizedUrl(actionUrl, locale || 'en')
                                router.push(localizedUrl)
                                handleClose()
                              }
                            }}
                          >
                            {getAvatar(notification)}
                            <div className='flex flex-col flex-auto'>
                              <Typography className='font-medium mbe-1' color='text.primary'>
                                {title}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' className='mbe-2'>
                                {message}
                              </Typography>
                              <Typography variant='caption'>{formatTime(createdAt)}</Typography>
                            </div>
                            <div className='flex flex-col items-end gap-2.5'>
                              <Badge
                                variant='dot'
                                color={isRead ? 'secondary' : 'primary'}
                                onClick={e => handleReadNotification(e, _id, !isRead)}
                                className={classnames('mbs-1 mie-1', {
                                  'invisible group-hover:visible': isRead
                                })}
                              />
                              <i
                                className='ri-close-line text-xl invisible group-hover:visible text-textSecondary'
                                onClick={e => handleRemoveNotification(e, _id)}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      size='small'
                      sx={{ color: 'white' }}
                      onClick={() => {
                        router.push('/notifications')
                        handleClose()
                      }}
                    >
                      View All Notifications
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
