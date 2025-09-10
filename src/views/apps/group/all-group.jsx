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
