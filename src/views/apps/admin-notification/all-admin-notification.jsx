'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminNotificationCard from '@/components/admin-notification/AdminNotificationCard'
import AdminNotificationFallBackCard from '@/components/admin-notification/AdminNotificationFallBackCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Container, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

function AllAdminNotificationPage({ isAdmin = false }) {
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.email) return
    setLoading(true)
    try {
      const res = await RestApi.get(
        `${API_URLS.v0.NOTIFICATIONS}?createdByEmail=${encodeURIComponent(
          session.user.email
        )}&type=ADMIN_NOTIFICATION&limit=500&sortBy=createdAt&sortOrder=desc`
      )
      if (res?.status === 'success') {
        const data = res.result
        const list =
          data?.notifications && Array.isArray(data.notifications)
            ? data.notifications
            : Array.isArray(data)
              ? data
              : []
        setNotifications(list)
      } else {
        toast.error(res?.message || 'Failed to load notifications')
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching admin notifications:', error)
      toast.error('An error occurred while loading notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleCreateNotification = () => {
    router.push('/management/admin-notification/create')
  }

  const handleMarkRead = id => {
    setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)))
  }

  const handleDelete = (idOrAdminNotificationId, isGroup) => {
    if (isGroup) {
      setNotifications(prev => prev.filter(n => n.adminNotificationId !== idOrAdminNotificationId))
    } else {
      setNotifications(prev => prev.filter(n => n._id !== idOrAdminNotificationId))
    }
  }

  // Group by adminNotificationId for seen/total; fallback: one notification = one group (by _id)
  const groups = React.useMemo(() => {
    if (!notifications.length) return []
    const byKey = {}
    notifications.forEach(n => {
      const key = n.adminNotificationId || n._id
      if (!byKey[key]) byKey[key] = []
      byKey[key].push(n)
    })
    return Object.values(byKey).map(list => {
      // Exclude announcement template from seen/total (single-model: template has isAnnouncementTemplate true)
      const userNotifications = list.filter(n => !n.isAnnouncementTemplate)
      const first = list[0]
      const seen = userNotifications.filter(n => n.isRead).length
      const total = userNotifications.length
      return {
        adminNotificationId: first.adminNotificationId || first._id,
        title: first.title,
        message: first.message,
        createdAt: first.createdAt,
        actionUrl: first.actionUrl,
        actionLabel: first.actionLabel,
        seen,
        total,
        notifications: list
      }
    })
  }, [notifications])

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          background: `radial-gradient(circle at 20% 20%, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(
                         theme.palette.secondary.main,
                         0.05
                       )} 0%, transparent 50%),
                       ${theme.palette.background.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main, mb: 2 }} />
          <Typography
            variant='body1'
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600
            }}
          >
            Loading admin notifications...
          </Typography>
        </Box>
      </Box>
    )
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
      {/* Header - same style as group management */}
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
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.4 : 0.3
                  )}`
                }}
              >
                <i className='ri-notification-3-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Admin Notifications
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1.05rem' },
                lineHeight: { xs: 1.5, sm: 1.6, md: 1.8 },
                width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Create and view admin notifications. New items appear here after you create them.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {groups.length === 0 ? (
          <AdminNotificationFallBackCard
            content='No admin notifications yet. Create one to get started.'
            path='/management/Admin-Notification'
            btnText='Back to Admin Notifications'
          />
        ) : (
          <AdminNotificationCard
            groups={groups}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            onRefresh={fetchNotifications}
          />
        )}
      </Box>

      {/* Create button - same pattern as group */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'block' },
          justifyContent: 'center',
          mt: { xs: 3, sm: 0 },
          mb: { xs: 0, sm: 0 }
        }}
      >
        <Button
          variant='contained'
          component='label'
          onClick={handleCreateNotification}
          startIcon={<AddIcon />}
          sx={{
            color: 'white',
            position: { xs: 'static', sm: 'fixed' },
            bottom: { xs: 'auto', sm: 24 },
            right: { xs: 'auto', sm: 24 },
            zIndex: { xs: 'auto', sm: 1001 },
            fontSize: { xs: '1rem', sm: '1.2rem' },
            borderRadius: '12px',
            px: { xs: 3, sm: 4 },
            py: { xs: 1.25, sm: 1.5 },
            minWidth: { xs: 200, sm: 220 }
          }}
        >
          Create Notification
        </Button>
      </Box>
    </Box>
  )
}

export default AllAdminNotificationPage
