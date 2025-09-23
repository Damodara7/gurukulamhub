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
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Note: Individual handlers removed - WebSocket now updates entire state directly

  const fetchAudience = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        setAudiences(res.result || [])
        console.log('total audience data', res.result)
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
            setAudiences(msg.data || [])
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
      <AudienceCard audiences={audiences} onEditAudience={handleEditAudience} onViewAudience={handleViewAudience} />
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
