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

  const getGroupsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)

      if (result?.status === 'success') {
        const groups = result.result || []
        // Get user's email from session
        const userEmail = session?.user?.email

        // Filter user's groups (groups where user is a member)
        // We need to check both the members array and the user's groupIds
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

  const handleRequestProcessed = () => {
    // When a request is processed (approved), refresh the groups data
    // This will move the group from channels to groups if the user was approved
    getGroupsData()
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <GroupChannellist groups={userGroups} channels={channels} onRequestProcessed={handleRequestProcessed} />
    </Box>
  )
}
