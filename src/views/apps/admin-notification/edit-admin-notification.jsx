'use client'

import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateAdminNotificationForm from '@/components/admin-notification/CreateAdminNotificationForm'
import { Box, CircularProgress, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'

function EditAdminNotificationPage({ adminNotificationId }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [initialData, setInitialData] = useState(null)
  const router = useRouter()
  const theme = useTheme()

  useEffect(() => {
    if (!adminNotificationId || !session?.user?.email) return
    const fetchData = async () => {
      setLoadingData(true)
      try {
        const result = await RestApi.get(
          `${API_URLS.v0.ANNOUNCEMENT}?adminNotificationId=${encodeURIComponent(adminNotificationId)}`
        )
        if (result?.status === 'success' && result?.result) {
          setInitialData(result.result)
        } else {
          toast.error(result?.message || 'Failed to load announcement')
          router.push('/management/admin-notification')
        }
      } catch (error) {
        console.error('Error loading announcement:', error)
        toast.error('Failed to load announcement')
        router.push('/management/admin-notification')
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [adminNotificationId, session?.user?.email, router])

  const handleSubmit = async values => {
    if (!session?.user?.email) {
      toast.error('You must be signed in to update a notification.')
      return
    }
    if (!adminNotificationId) return

    setLoading(true)
    try {
      const sendToAll = values.sendTo === 'all'
      const includeForNewUsers = values.includeForNewUsers !== false && values.includeForNewUsers !== 'false'
      const payload = {
        adminNotificationId,
        title: values.title,
        message: values.message,
        sendToAll,
        includeForNewUsers
      }
      if (values.actionUrl) payload.actionUrl = values.actionUrl
      if (values.actionLabel) payload.actionLabel = values.actionLabel
      if (values.sendTo === 'filtered' && values.targetUserIds?.length) {
        payload.targetUserIds = values.targetUserIds
        if (values.filters?.length) payload.filters = values.filters
      }

      const result = await RestApi.put(API_URLS.v0.ANNOUNCEMENT, payload)

      if (result?.status === 'success') {
        const sentCount = result?.result?.sentCount
        const message =
          sentCount != null
            ? `Announcement updated and sent to ${sentCount} user(s).`
            : 'Announcement updated successfully.'
        toast.success(message)
        router.push('/management/admin-notification')
      } else {
        toast.error(result?.message || result?.error || 'Failed to update announcement')
      }
    } catch (error) {
      console.error('Error updating admin notification:', error)
      toast.error(
        error?.message || error?.response?.data?.message || 'An error occurred while updating the notification'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/admin-notification')
  }

  if (loadingData) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                       ${theme.palette.background.default}`
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
              fontWeight: 600
            }}
          >
            Loading announcement...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (!initialData) {
    return null
  }

  return (
    <CreateAdminNotificationForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      editMode
      adminNotificationId={adminNotificationId}
      initialData={initialData}
    />
  )
}

export default EditAdminNotificationPage
