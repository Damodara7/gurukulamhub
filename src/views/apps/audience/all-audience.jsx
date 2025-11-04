'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AudienceCard from '@/components/audience/AudienceCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Container, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
const AllAudiencePage = () => {
  const theme = useTheme()
  const router = useRouter()
  const [audiences, setAudiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [dynamicCounts, setDynamicCounts] = useState({}) // Store real-time counts for all audiences
  const [loadingCounts, setLoadingCounts] = useState(false) // Single loading state for all counts
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Note: Individual handlers removed - WebSocket now updates entire state directly

  // Note: Individual handlers removed - WebSocket now updates entire state directly

  // Function to fetch dynamic counts for all audiences at once
  const fetchAllDynamicCounts = async audiencesList => {
    if (!audiencesList || audiencesList.length === 0) return

    setLoadingCounts(true)
    const counts = {}

    try {
      // Fetch all counts in parallel for better performance
      const promises = audiencesList.map(async audience => {
        try {
          const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${audience._id}&action=users`)
          return {
            audienceId: audience._id,
            count: result?.status === 'success' ? result.result?.length || 0 : 0
          }
        } catch (error) {
          console.error(`Error fetching count for audience ${audience._id}:`, error)
          return {
            audienceId: audience._id,
            count: 0
          }
        }
      })

      const results = await Promise.all(promises)

      // Convert results to counts object
      results.forEach(({ audienceId, count }) => {
        counts[audienceId] = count
      })

      setDynamicCounts(counts)
    } catch (error) {
      console.error('Error fetching dynamic counts:', error)
      // Fallback to static counts
      const fallbackCounts = {}
      audiencesList.forEach(audience => {
        fallbackCounts[audience._id] = 0
      })
      setDynamicCounts(fallbackCounts)
    } finally {
      setLoadingCounts(false)
    }
  }

  const fetchAudience = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        const audiencesData = res.result || []
        setAudiences(audiencesData)
        console.log('total audience data', audiencesData)

        // Fetch dynamic counts for all audiences
        fetchAllDynamicCounts(audiencesData)
      } else {
        console.error('Error fetching audience:', res)
        toast.error('Failed to load audience')
        setAudiences([])
      }
    } catch (error) {
      console.error('Error fetching audience:', error)
      toast.error('An error occurred while loading audience')
      setAudiences([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudience()
  }, [])

  // WebSocket connection for audiences list updates
  useEffect(() => {
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/audiences`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log('[WS] AllAudiencePage connected to audiences list updates')
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'audiencesList') {
            console.log('[WS] AllAudiencePage received audiences list update:', msg.data)

            // Update audiences state directly (like games do) - no refresh feeling
            const updatedAudiences = msg.data || []
            setAudiences(updatedAudiences)

            // Fetch dynamic counts for updated audiences
            fetchAllDynamicCounts(updatedAudiences)
          }
        } catch (e) {
          console.error('[WS] AllAudiencePage error parsing audiences list message', e)
        }
      }
      wsRef.onerror = err => {
        console.error('[WS] AllAudiencePage audiences list error', err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log('[WS] AllAudiencePage audiences list connection closed')
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
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
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              mb: 2
            }}
          />
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
            Loading audiences...
          </Typography>
        </Box>
      </Box>
    )
  }

  const handleEditAudience = audienceId => {
    console.log('Edit audience:', audienceId)
    router.push(`/management/audience/${audienceId}/edit`)
  }

  const handleViewAudience = audienceId => {
    console.log('View audience:', audienceId)
    router.push(`/management/audience/${audienceId}`)
  }
  const handleCreateNewAudience = () => {
    router.push('/management/audience/create')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-team-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Audience Management
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Create, manage, and target specific user audiences with smart filtering
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <AudienceCard
          audiences={audiences}
          onEditAudience={handleEditAudience}
          onViewAudience={handleViewAudience}
          dynamicCounts={dynamicCounts}
          loadingCounts={loadingCounts}
        />

        {/* Floating Action Button */}
        <Button
          variant='contained'
          component='label'
          sx={{
            color: 'white',
            position: 'fixed',
            fontsize: '1.2rem',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1001,
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            
          }}
          startIcon={<AddIcon />}
          onClick={handleCreateNewAudience}
        >
          Create Audience
        </Button>
      </Container>
    </Box>
  )
}

export default AllAudiencePage
