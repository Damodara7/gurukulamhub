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
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
const AllAudiencePage = () => {
  const router = useRouter()
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [audienceToDelete, setAudienceToDelete] = useState(null)
  const [audiences, setAudiences] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

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

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  const handleFinalDeleteAudience = async audienceId => {
    if (!session?.user?.email) {
      toast.error('Authentication required')
      throw new Error('Authentication required')
    }
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}`, {
        email: session?.user?.email
      })
      if (result?.status === 'success') {
        toast.success('Audience deleted successfully!')
        return result
      } else {
        console.error('Error deleting audience:', result)
        const message = result?.message || 'Failed to delete audience'
        toast.error(message)
        throw new Error(message)
      }
    } catch (error) {
      console.error('Error deleting audience:', error)
      toast.error('An error occurred while deleting audience')
      throw error
    }
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

  const handleDeleteConfirmation = audience => {
    setAudienceToDelete(audience)
    setConfirmationDialogOpen(true)
  }

  return (
    <Box>
      <AudienceCard
        audiences={audiences}
        onEditAudience={handleEditAudience}
        onViewAudience={handleViewAudience}
        onDeleteAudience={handleDeleteConfirmation}
      />
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-audience' // Customize based on your context
        onConfirm={async () => {
          await handleFinalDeleteAudience(audienceToDelete?._id)
          setAudiences(prev => prev.filter(a => a._id !== audienceToDelete?._id))
          setAudienceToDelete(null)
        }}
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
