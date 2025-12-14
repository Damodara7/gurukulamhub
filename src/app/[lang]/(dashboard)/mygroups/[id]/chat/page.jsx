'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GroupChatPage from '@/views/apps/group/GroupChatPage'
import { Box, CircularProgress, Typography } from '@mui/material'
import GroupFallBackCard from '@/components/group/GroupFallBackCard'
import { alpha, useTheme } from '@mui/material'
import { toast } from 'react-toastify'

export default function Page({ params }) {
  const { id: groupId } = params
  const theme = useTheme()
  const { data: session } = useSession()
  const router = useRouter()
  const [groupData, setGroupData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId || !session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)

        if (res?.status === 'success') {
          const fetchedGroup = res.result
          // Check if the current user is a member or the creator
          const isCreator = session.user.email === fetchedGroup.creatorEmail
          // Ensure members are populated to check membership correctly
          const isMember = fetchedGroup.members?.some(member => member.email === session.user.email)

          if (!isCreator && !isMember) {
            setError('You are not authorized to access this group chat.')
            toast.error('You are not authorized to access this group chat.')
            router.push('/mygroups') // Redirect to mygroups list
            return
          }
          setGroupData(fetchedGroup)
        } else {
          setError(res.message || 'Failed to fetch group data')
          toast.error(res.message || 'Failed to fetch group data')
        }
      } catch (err) {
        console.error('Error fetching group details for chat:', err)
        setError('An error occurred while fetching group details.')
        toast.error('An error occurred while fetching group details.')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupDetails()
  }, [groupId, session?.user?.email, router])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '89vh',
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05)} 0%, transparent 50%),
                       ${theme.palette.background.default}`
        }}
      >
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Loading chat...
        </Typography>
      </Box>
    )
  }

  if (error || !groupData) {
    return (
      <GroupFallBackCard
        content={error || 'Group chat not found or unauthorized.'}
        path='/mygroups'
        btnText='Back To My Groups'
      />
    )
  }

  return <GroupChatPage groupId={groupId} groupData={groupData} backPath='/mygroups' />
}

