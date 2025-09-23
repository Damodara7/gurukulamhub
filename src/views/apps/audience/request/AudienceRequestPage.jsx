'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Box, Button, CircularProgress, Alert } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import JoinRequestScreen from '@/components/audience/JoinRequestScreenaudience'

const AudienceRequestPage = () => {
  const router = useRouter()
  const params = useParams()
  const [audience, setAudience] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const audienceId = params.id

  useEffect(() => {
    if (audienceId) {
      fetchAudienceDetails()
    } else {
      setError('No audience ID provided')
      setLoading(false)
    }
  }, [audienceId])

  const fetchAudienceDetails = async () => {
    try {
      console.log('Fetching audience details for audienceId:', audienceId)
      console.log('API URL:', `${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}`)

      const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}`)
      console.log('API Response:', result)

      if (result?.status === 'success') {
        setAudience(result.result)
      } else {
        console.error('API returned error:', result)
        setError(result?.message || 'Failed to fetch audience details')
      }
    } catch (error) {
      console.error('Error fetching audience details:', error)
      setError(`Failed to fetch audience details: ${error.message}`)
    } finally {
      setLoading(false)
    }
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

  if (!audience) {
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
          Audience not found
        </Alert>
        <Button variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
  }

  return <JoinRequestScreen audience={audience} />
}
export default AudienceRequestPage
