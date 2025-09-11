'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GroupCard from '@/components/group/GroupCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress } from '@mui/material'
const AllGroupPage = () => {
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Note: Individual handlers removed - WebSocket now updates entire state directly

  const fetchGroup = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        setGroups(res.result || [])
        console.log('total group data', res.result)
      } else {
        console.error('Error fetching group:', res)
        toast.error('Failed to load group')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      toast.error('An error occurred while loading group')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroup()
  }, [])

  // WebSocket connection for groups list updates
  useEffect(() => {
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/groups`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log('[WS] AllGroupPage connected to groups list updates')
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'groupsList') {
            console.log('[WS] AllGroupPage received groups list update:', msg.data)

            // Update groups state directly (like games do) - no refresh feeling
            setGroups(msg.data || [])
          }
        } catch (e) {
          console.error('[WS] AllGroupPage error parsing groups list message', e)
        }
      }
      wsRef.onerror = err => {
        console.error('[WS] AllGroupPage groups list error', err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log('[WS] AllGroupPage groups list connection closed')
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

  const handleEditGroup = groupId => {
    console.log('Edit group:', groupId)
    router.push(`/management/group/${groupId}/edit`)
  }

  const handleViewGroup = groupId => {
    console.log('View group:', groupId)
    router.push(`/management/group/${groupId}`)
  }
  const handleCreateNewGroup = () => {
    router.push('/management/group/create')
  }

  return (
    <Box>
      <GroupCard groups={groups} onEditGroup={handleEditGroup} onViewGroup={handleViewGroup} />
      <Box sx={{ position: 'relative' }}>
        <Button
          variant='contained'
          component='label'
          style={{ color: 'white', position: 'fixed', bottom: 20, right: 10, zIndex: 1001 }}
          startIcon={<AddIcon />}
          onClick={handleCreateNewGroup}
        >
          Create New
        </Button>
      </Box>
    </Box>
  )
}

export default AllGroupPage
