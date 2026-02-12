'use client'
import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateGroupForm from '@/components/group/CreateGroupForm'
import { Box, Card, CardContent, Typography, Button, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Group as GroupIcon, School as SchoolIcon } from '@mui/icons-material'

function CreateGroupPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [groupType, setGroupType] = useState(null) // null | 'normal' | 'classroom'
  const router = useRouter()
  const theme = useTheme()

  const handleSubmit = async values => {
    try {
      console.log(' form Data', values)
      // Prepare the payload
      const payload = {
        groupName: values.groupName,
        description: values.description,
        filters: values.filters || [], // Send filters array
        status: values.status,
        isAnnouncementOnly: values.isAnnouncementOnly || false,
        createdBy: session?.user?.id, // Use the found user ID
        creatorEmail: session?.user?.email,
        members: values.members,
        membersCount: values.membersCount
      }

      if (groupType === 'classroom') {
        payload.groupType = 'classroom'
        payload.trainerId = values.trainerId || null
        payload.trainerEmail = values.trainerEmail || null
        payload.groupManagerId = values.groupManagerId || null
        payload.groupManagerEmail = values.groupManagerEmail || null
        payload.needApprovalForMessages = values.needApprovalForMessages ?? false
      } else {
        payload.groupType = 'normal'
      }

      console.log('payload data ', payload)

      // Call your API
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP, payload)
      console.log('result', result)

      if (result?.status === 'success') {
        const groupId = result.result._id
        console.log('Group created successfully with ID:', groupId)
        toast.success('Group created successfully!')
        router.push('/management/group')
      } else {
        console.error('Error creating group:', result)
        const errorMessage = result?.message || result?.error || 'Failed to create group'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error creating group:', error)
      const errorMessage =
        error?.message || error?.response?.data?.message || 'An error occurred while creating the group'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (groupType === null) {
      router.push('/management/group')
    } else {
      setGroupType(null)
    }
  }

  // Step 1: Choose group type
  if (groupType === null) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%),
                       ${theme.palette.background.default}`
        }}
      >
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
          Create a group
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Choose the type of group you want to create
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560 }}>
          <Card
            onClick={() => setGroupType('normal')}
            sx={{
              cursor: 'pointer',
              minWidth: 240,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <GroupIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant='h6'>Normal group</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Standard group with members. No roles or message approval.
              </Typography>
              <Button variant='outlined' size='small' sx={{ mt: 2 }}>Select</Button>
            </CardContent>
          </Card>
          <Card
            onClick={() => setGroupType('classroom')}
            sx={{
              cursor: 'pointer',
              minWidth: 240,
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              '&:hover': { borderColor: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.04) }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant='h6'>Classroom group</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Trainer, group manager, and students. Optional message approval by manager.
              </Typography>
              <Button variant='outlined' color='secondary' size='small' sx={{ mt: 2 }}>Select</Button>
            </CardContent>
          </Card>
        </Box>
        <Button onClick={() => router.push('/management/group')} sx={{ mt: 3 }}>Cancel</Button>
      </Box>
    )
  }

  return (
    <CreateGroupForm
      groupType={groupType}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  )
}

export default CreateGroupPage
