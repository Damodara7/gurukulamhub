'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AudienceCard from '@/components/audience/AudienceCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress } from '@mui/material'
const AllAudiencePage = () => {
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
            count: result?.status === 'success' ? result.result?.length || 0 : audience.membersCount || 0
          }
        } catch (error) {
          console.error(`Error fetching count for audience ${audience._id}:`, error)
          return {
            audienceId: audience._id,
            count: audience.membersCount || 0
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
        fallbackCounts[audience._id] = audience.membersCount || 0
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
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
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
    <Box>
      <AudienceCard
        audiences={audiences}
        onEditAudience={handleEditAudience}
        onViewAudience={handleViewAudience}
        dynamicCounts={dynamicCounts}
        loadingCounts={loadingCounts}
      />
      <Box sx={{ position: 'relative' }}>
        <Button
          variant='contained'
          component='label'
          style={{ color: 'white', position: 'fixed', bottom: 20, right: 10, zIndex: 1001 }}
          startIcon={<AddIcon />}
          onClick={handleCreateNewAudience}
        >
          Create New
        </Button>
      </Box>
    </Box>
  )
}

export default AllAudiencePage
