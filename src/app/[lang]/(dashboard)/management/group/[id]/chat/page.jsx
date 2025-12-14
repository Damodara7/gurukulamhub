'use client'
import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GroupChatPage from '@/views/apps/group/GroupChatPage'
import { Box, CircularProgress } from '@mui/material'
import GroupFallBackCard from '@/components/group/GroupFallBackCard'
import { alpha, useTheme } from '@mui/material'

export default function ChatPage({ params }) {
  const { id } = params
  const theme = useTheme()
  const [groupData, setGroupData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true)
        setError(null)

        const groupResult = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${id}`)

        if (groupResult?.status === 'success') {
          // Ensure members are populated with email for chat functionality
          const group = groupResult.result
          setGroupData(group)
        } else {
          setError(groupResult.message || 'Failed to fetch group data')
        }
      } catch (error) {
        console.error('Error fetching group data:', error)
        setError('An error occurred while fetching group data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGroupData()
    }
  }, [id])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '89vh',
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                       ${theme.palette.background.default}`
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !groupData) {
    return (
      <GroupFallBackCard
        content={error || 'Group not found'}
        path={`/management/group/${id}`}
        btnText='Back to Group'
      />
    )
  }

  return <GroupChatPage groupId={id} groupData={groupData} />
}

