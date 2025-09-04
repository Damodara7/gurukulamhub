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

  console.log('session', session)
  console.log('user memberId:', session?.user?.memberId)

  const getGroupsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('API result:', result)

      if (result?.status === 'success') {
        const groups = result.result || []
        setAllGroups(groups)
        console.log('All groups fetched:', groups.length)
        console.log('Sample group:', groups[0])

        // Get user's memberId from session
        const userMemberId = session?.user?.memberId
        console.log('Current user memberId:', userMemberId)

        // Filter user's groups (groups where user is a member)
        const userGroupsFiltered = groups.filter(group => {
          const isMember = group.members?.some(member => {
            // Check if member.memberId matches user's memberId
            return member.memberId === userMemberId
          })
          console.log(`Group "${group.groupName}": isMember=${isMember}`)
          return isMember
        })
        setUserGroups(userGroupsFiltered)

        // Filter channels (public groups where user is not a member)
        const channelsFiltered = groups.filter(group => {
          const isPublic = group.status === 'public'
          const isNotMember = !group.members?.some(member => {
            return member.memberId === userMemberId
          })
          console.log(`Group "${group.groupName}": isPublic=${isPublic}, isNotMember=${isNotMember}`)
          return isPublic && isNotMember
        })
        setChannels(channelsFiltered)

        console.log('User groups count:', userGroupsFiltered.length)
        console.log('Channels count:', channelsFiltered.length)
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
    if (session?.user?.memberId) {
      getGroupsData()
    }
  }, [session?.user?.memberId])

  console.log('All groups:', allGroups.length)
  console.log('User groups:', userGroups.length)
  console.log('Channels:', channels.length)
  console.log('userGroups', userGroups)
  console.log('channels', channels)
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
    <>
      <GroupChannellist groups={userGroups} channels={channels} />
    </>
  )
}
