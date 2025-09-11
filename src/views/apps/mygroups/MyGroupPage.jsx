'use client'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, CircularProgress, Alert } from '@mui/material'
import { useSession } from 'next-auth/react'
import GroupChannellist from '@/components/mygroups/GroupChannellist'
export default function MyGroupsPage() {
  const [userGroups, setUserGroups] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Helper function to process groups data and update state
  const processGroupsData = groups => {
    const userEmail = session?.user?.email
    if (!userEmail) return

    // Filter user's groups (groups where user is a member)
    const userGroupsFiltered = groups.filter(group => {
      // First check if user is in the members array
      const isMemberInArray = group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })

      // For now, we'll rely on the groupIds approach which should be updated
      // when a user is added to a group through the request approval process
      return isMemberInArray
    })
    setUserGroups(userGroupsFiltered)

    // Filter channels (public groups where user is not a member)
    const channelsFiltered = groups.filter(group => {
      const isPublic = group.status === 'public'
      const isNotMember = !group.members?.some(member => {
        if (typeof member === 'object' && member.email) {
          return member.email === userEmail
        }
        return false
      })
      return isPublic && isNotMember
    })
    setChannels(channelsFiltered)
  }

  const getGroupsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)

      if (result?.status === 'success') {
        const groups = result.result || []
        processGroupsData(groups)
      } else {
        console.error('Error Fetching groups:', result.message)
        setError(result.message || 'Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      setError('An error occurred while fetching groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      getGroupsData()
    }
  }, [session?.user?.email])

  // WebSocket connection for groups list updates
  useEffect(() => {
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/groups`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log('[WS] Connected to groups list updates')
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'groupsList') {
            // Update groups data directly (no refresh feeling)
            console.log('[WS] Groups list updated, processing data directly')
            processGroupsData(msg.data || [])
          }
        } catch (e) {
          console.error('[WS] Error parsing groups list message', e)
        }
      }
      wsRef.onerror = err => {
        console.error('[WS] Groups list error', err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log('[WS] Groups list connection closed')
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <GroupChannellist groups={userGroups} channels={channels} />
    </Box>
  )
}
