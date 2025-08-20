'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GroupCard from '@/components/groups/GroupCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress } from '@mui/material'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
const AllGroupsPage = () => {
  const router = useRouter()
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        setGroups(res.result || [])
        console.log('total group data', res.result)
      } else {
        console.error('Error fetching groups:', res)
        toast.error('Failed to load groups')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('An error occurred while loading groups')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  const handleFinalDeleteGame = async groupId => {
    if (!session?.user?.email) {
      toast.error('Authentication required')
      throw new Error('Authentication required')
    }
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`, { email: session?.user?.email })
      if (result?.status === 'success') {
        toast.success('Group deleted successfully!')
        return result
      } else {
        console.error('Error deleting group:', result)
        const message = result?.message || 'Failed to delete group'
        toast.error(message)
        throw new Error(message)
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('An error occurred while deleting group')
      throw error
    }
  }

  const handleEditGroup = groupId => {
    console.log('Edit group:', groupId)
    router.push(`/management/groups/${groupId}/edit`)
  }

  const handleViewGroup = groupId => {
    console.log('View group:', groupId)
    router.push(`/management/groups/${groupId}`)
  }
  const handleCreateNewGroup = () => {
    router.push('/management/groups/create')
  }

  const handleDeleteConfirmation = group => {
    setGroupToDelete(group)
    setConfirmationDialogOpen(true)
  }

  return (
    <Box>
      <GroupCard
        groups={groups}
        onEditGroup={handleEditGroup}
        onViewGroup={handleViewGroup}
        onDeleteGroup={handleDeleteConfirmation}
      />
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-group' // Customize based on your context
        onConfirm={async () => {
          await handleFinalDeleteGame(groupToDelete?._id)
          setGroups(prev => prev.filter(g => g._id !== groupToDelete?._id))
          setGroupToDelete(null)
        }}
      />
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

export default AllGroupsPage
