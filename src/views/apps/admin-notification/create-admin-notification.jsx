'use client'

import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateAdminNotificationForm from '@/components/admin-notification/CreateAdminNotificationForm'

function CreateAdminNotificationPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async values => {
    const userId = session?.user?.id
    if (!userId) {
      toast.error('You must be signed in to create a notification.')
      return
    }

    setLoading(true)
    try {
      const sendToAll = values.sendTo === 'all'

      if (sendToAll || values.sendTo === 'filtered') {
        const includeForNewUsers = values.includeForNewUsers !== false && values.includeForNewUsers !== 'false'
        const payload = {
          title: values.title,
          message: values.message,
          sendToAll: values.sendTo !== 'filtered',
          includeForNewUsers
        }
        if (values.actionUrl) payload.actionUrl = values.actionUrl
        if (values.actionLabel) payload.actionLabel = values.actionLabel
        if (values.sendTo === 'filtered' && values.targetUserIds?.length) {
          payload.targetUserIds = values.targetUserIds
          if (values.filters?.length) payload.filters = values.filters
        }

        const result = await RestApi.post(API_URLS.v0.ANNOUNCEMENT, payload)

        if (result?.status === 'success') {
          const sentCount = result?.result?.sentCount
          const isFiltered = values.sendTo === 'filtered'
          const message = isFiltered
            ? (sentCount != null
                ? `Notification sent to ${sentCount} filtered user(s).${includeForNewUsers ? ' New users who match filters will also receive it.' : ''}`
                : 'Notification sent to filtered users.')
            : includeForNewUsers
              ? (sentCount != null
                  ? `Announcement created and sent to ${sentCount} user(s). New users who join later will also receive it.`
                  : 'Announcement created successfully.')
              : (sentCount != null
                  ? `Notification sent to ${sentCount} existing user(s). New users who join later will not receive it.`
                  : 'Notification sent to existing users.')
          toast.success(message)
          router.push('/management/admin-notification')
        } else {
          toast.error(result?.message || result?.error || 'Failed to create announcement')
        }
      } else {
        const payload = {
          userId: String(userId),
          type: 'ADMIN_NOTIFICATION',
          title: values.title,
          message: values.message
        }
        if (values.actionUrl) payload.actionUrl = values.actionUrl
        if (values.actionLabel) payload.actionLabel = values.actionLabel

        const result = await RestApi.post(API_URLS.v0.NOTIFICATIONS, payload)

        if (result?.status === 'success') {
          toast.success('Notification created successfully.')
          router.push('/management/admin-notification')
        } else {
          toast.error(result?.message || result?.error || 'Failed to create notification')
        }
      }
    } catch (error) {
      console.error('Error creating admin notification:', error)
      toast.error(
        error?.message || error?.response?.data?.message || 'An error occurred while creating the notification'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/admin-notification')
  }

  return <CreateAdminNotificationForm onSubmit={handleSubmit} onCancel={handleCancel} />
}

export default CreateAdminNotificationPage
