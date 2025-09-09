'use client'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { Box, CircularProgress, Alert } from '@mui/material'
import { useSession } from 'next-auth/react'
import GroupChannellist from '@/components/mygroups/GroupChannellist'
export default function MyGroupsPage() {
  const [allGroups, setAllGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { data: session } = useSession()

  // console.log('session', session)
  // console.log('user email:', session?.user?.email)

  const getGroupsData = async () => {
    try {
      console.log('getGroupsData called - fetching groups...')
      setLoading(true)
      setError(null)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('API result:', result)

      if (result?.status === 'success') {
        const groups = result.result || []
        setAllGroups(groups)
        // console.log('All groups fetched:', groups.length)
        // console.log('Sample group:', groups[0])

        // Get user's email from session
        const userEmail = session?.user?.email
        // console.log('Current user email:', userEmail)

        // Filter user's groups (groups where user is a member)
        const userGroupsFiltered = groups.filter(group => {
          const isMember = group.members?.some(member => {
            // Check if member is a user object with email or just an ObjectId
            if (typeof member === 'object' && member.email) {
              return member.email === userEmail
            }
            // If member is just an ObjectId, we need to check differently
            // For now, we'll use a different approach - check if user is in groupIds
            return false
          })
          // console.log(`Group "${group.groupName}": isMember=${isMember}`)
          return isMember
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
          // console.log(`Group "${group.groupName}": isPublic=${isPublic}, isNotMember=${isNotMember}`)
          return isPublic && isNotMember
        })
        setChannels(channelsFiltered)

        // console.log('User groups count:', userGroupsFiltered.length)
        // console.log('Channels count:', channelsFiltered.length)
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
  }, [ session?.user?.email])

  // console.log('All groups:', allGroups.length)
  // console.log('User groups:', userGroups.length)
  // console.log('Channels:', channels.length)
  // console.log('userGroups', userGroups)
  // console.log('channels', channels)
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

  const handleGroupUpdate = updatedGroup => {
    // Update the specific group in the userGroups array
    setUserGroups(prevGroups => prevGroups.map(group => (group._id === updatedGroup._id ? updatedGroup : group)))
  }

  const handleGroupCreated = newGroup => {
    // Add the newly created group to userGroups immediately
    setUserGroups(prevGroups => [newGroup, ...prevGroups])
    // Also update allGroups
    setAllGroups(prevGroups => [newGroup, ...prevGroups])
    // Remove from channels if it was there
    setChannels(prevChannels => prevChannels.filter(channel => channel._id !== newGroup._id))
  }

  const refreshGroupsData = () => {
    // Refresh all groups data
    getGroupsData()
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <GroupChannellist
        groups={userGroups}
        channels={channels}
        onGroupUpdate={handleGroupUpdate}
        onGroupCreated={handleGroupCreated}
        onRefreshGroups={refreshGroupsData}
      />
    </Box>
  )
}
