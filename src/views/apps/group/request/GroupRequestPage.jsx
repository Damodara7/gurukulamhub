'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import JoinRequestScreen from '@/components/group/JoinRequestScreen'

const GroupRequestPage = () => {
  const router = useRouter()
  const params = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const groupId = params.id

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails()
    } else {
      setError('No group ID provided')
      setLoading(false)
    }
  }, [groupId])

  const fetchGroupDetails = async () => {
    try {
      console.log('Fetching group details for groupId:', groupId)
      console.log('API URL:', `${API_URLS.v0.USERS_GROUP}?id=${groupId}`)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)
      console.log('API Response:', result)

      if (result?.status === 'success') {
        setGroup(result.result)
      } else {
        console.error('API returned error:', result)
        setError(result?.message || 'Failed to fetch group details')
      }
    } catch (error) {
      console.error('Error fetching group details:', error)
      setError(`Failed to fetch group details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back() // Navigate back when closing
  }

  // Removed handleRequestProcessed - no automatic refreshes

  const handleGroupCreated = () => {
    // Handle group created logic if needed
    console.log('Group created')
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity='error' sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Alert>
        <Button variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
  }

  if (!group) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Alert severity='warning' sx={{ mb: 3, maxWidth: 500 }}>
          Group not found
        </Alert>
        <Button variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
  }

  return <JoinRequestScreen group={group} onGroupCreated={handleGroupCreated} onBack={handleBack} />
}
export default GroupRequestPage
