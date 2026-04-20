'use client'

import React from 'react'
import { Card, CardContent, Typography, Stack, Box, Chip, IconButton, Tooltip, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  NotificationsActive as NotificationIcon,
  RadioButtonUnchecked as UnreadIcon,
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as SeenIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const formatDate = dateStr => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

const AdminNotificationCard = ({ groups, onMarkRead, onDelete, onRefresh, onDeleteClick, onEditClick, isAdmin = false }) => {
  const theme = useTheme()

  const handleMarkRead = async notification => {
    if (notification.isRead) return
    try {
      const result = await RestApi.put(API_URLS.v0.NOTIFICATIONS, { markAsRead: notification._id })
      if (result?.status === 'success') {
        onMarkRead?.(notification._id)
        onRefresh?.()
      } else {
        toast.error(result?.message || 'Failed to mark as read')
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to mark as read')
    }
  }

  if (!groups?.length) {
    return null
  }

  return (
    <Box sx={{ flex: 1, height: '100%' }}>
      <Stack direction='column' spacing={2}>
        {groups.map(group => {
          const title = group.title || 'No title'
          const message = group.message || ''
          const { seen, total } = group
          const firstNotification = group.notifications?.[0]
          const isSingle = total === 1
          const isRead = isSingle && !!firstNotification?.isRead

          return (
            <Card
              key={group.adminNotificationId}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 2, sm: 3 },
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                    : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                      : `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction='row' alignItems='flex-start' spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: alpha(theme.palette.primary.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <NotificationIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap' sx={{ mb: 0.5 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.9375rem', sm: '1rem' },
                          color: 'text.primary',
                          opacity: isSingle && isRead ? 0.85 : 1
                        }}
                      >
                        {title}
                      </Typography>
                      {isSingle && !isRead && (
                        <Chip
                          size='small'
                          label='Unread'
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.info.main, 0.12),
                            color: theme.palette.info.main
                          }}
                        />
                      )}
                      <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
                        {formatDate(group.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {message}
                    </Typography>
                    {/* Seen / Total users - dynamic */}
                    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mt: 1 }}>
                      <SeenIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                        Seen: {seen} / {total} user{total !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction='row' spacing={0.5}>
                    {isSingle && firstNotification && !isRead && (
                      <Tooltip title='Mark as read'>
                        <IconButton
                          size='small'
                          onClick={() => handleMarkRead(firstNotification)}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                          }}
                        >
                          <UnreadIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    {group.actionUrl && (
                      <Tooltip title='Open link'>
                        <IconButton
                          size='small'
                          component='a'
                          href={group.actionUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          sx={{
                            color: theme.palette.info.main,
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.08) }
                          }}
                        >
                          <OpenIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEditClick && (
                      <Tooltip title='Edit'>
                        <IconButton
                          size='small'
                          onClick={() => onEditClick(group)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={group.total > 1 ? 'Delete announcement' : 'Delete'}>
                      <IconButton
                        size='small'
                        onClick={() => onDeleteClick?.(group)}
                        sx={{
                          color: theme.palette.error.main,
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                        }}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}

export default AdminNotificationCard
