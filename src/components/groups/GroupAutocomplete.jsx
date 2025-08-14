'use client'
import React, { useState, useEffect } from 'react'
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material'
import { Add as AddIcon, Group as GroupIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateGroupForm from './CreateGroupForm'
import GroupDetailsPopup from './GroupDetailsPopup'
import { useSession } from 'next-auth/react'

const GroupAutocomplete = ({
  value,
  onChange,
  label = 'Select Group (Optional)',
  placeholder = 'Search groups...'
}) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const { data: session } = useSession()

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups()
  }, [])

  // Set initial value if provided
  useEffect(() => {
    if (value && groups.length > 0) {
      const group = groups.find(g => g._id === value)
      if (group) {
        setSelectedGroup(group)
      }
    }
  }, [value, groups])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      if (res?.status === 'success') {
        setGroups(res.result || [])
      } else {
        console.error('Error fetching groups:', res)
        toast.error('Failed to load groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('An error occurred while loading groups')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = (event, newValue) => {
    setSelectedGroup(newValue)
    onChange(newValue?._id || null)
  }

  const handleCreateGroup = async groupData => {
    try {
      // Get user ID from database using email from session
      let userId = null
      try {
        const userResult = await RestApi.get(`${API_URLS.v0.USER}`)
        if (userResult?.status === 'success' && userResult.result) {
          const users = Array.isArray(userResult.result) ? userResult.result : [userResult.result]
          const user = users.find(u => u.email === session.user.email)
          if (user) {
            userId = user._id
          }
        }
      } catch (error) {
        console.error('Error fetching user ID:', error)
        toast.error('Failed to fetch user information. Please try again.')
        return
      }

      if (!userId) {
        toast.error('User ID not found. Please login again.')
        return
      }

      // Prepare the payload with all necessary fields
      const payload = {
        groupName: groupData.groupName,
        description: groupData.description,
        location: groupData.location,
        gender: groupData.gender,
        ageGroup: groupData.ageGroup,
        createdBy: userId,
        creatorEmail: session.user.email,
        members: groupData.members || []
      }

      const result = await RestApi.post(API_URLS.v0.USERS_GROUP, payload)
      if (result?.status === 'success') {
        const groupId = result.result._id

        // Update users with the new group ID if members are selected
        if (groupData.members && groupData.members.length > 0) {
          try {
            await Promise.all(
              groupData.members.map(async userId => {
                const userResult = await RestApi.get(`${API_URLS.v0.USER}`)
                if (userResult?.status === 'success' && userResult.result) {
                  const users = Array.isArray(userResult.result) ? userResult.result : [userResult.result]
                  const user = users.find(u => u._id === userId)

                  if (user && user.email) {
                    const currentUserResult = await RestApi.get(`${API_URLS.v0.USER}`)
                    let currentUser = null
                    if (currentUserResult?.status === 'success' && currentUserResult.result) {
                      const allUsers = Array.isArray(currentUserResult.result)
                        ? currentUserResult.result
                        : [currentUserResult.result]
                      currentUser = allUsers.find(u => u._id === userId)
                    }

                    if (currentUser) {
                      const currentGroupIds = currentUser.groupIds || []
                      const updatedGroupIds = [...new Set([...currentGroupIds, groupId])]

                      await RestApi.put(`${API_URLS.v0.USER}`, {
                        email: user.email,
                        groupIds: updatedGroupIds
                      })
                    }
                  }
                }
              })
            )
          } catch (error) {
            console.error('Error updating users:', error)
            toast.warning('Group created but some users could not be updated')
          }
        }

        toast.success('Group created successfully!')
        setOpenCreateDialog(false)
        // Refresh groups list
        await fetchGroups()
        // Auto-select the newly created group
        const newGroup = result.result
        setSelectedGroup(newGroup)
        onChange(newGroup._id)
      } else {
        toast.error(result?.message || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('An error occurred while creating the group')
    }
  }

  const handleViewGroupDetails = group => {
    setSelectedGroup(group)
    setOpenDetailsDialog(true)
  }

  const getOptionLabel = option => {
    if (typeof option === 'string') return option
    return option?.groupName || ''
  }

  const renderOption = (props, option) => (
    <Box
      component='li'
      {...props}
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant='body1' fontWeight='medium'>
          {option.groupName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {option.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          {option.ageGroup && (
            <Chip size='small' label={`Age: ${option.ageGroup.min}-${option.ageGroup.max}`} variant='outlined' />
          )}
          {option.gender && <Chip size='small' label={`Gender: ${option.gender}`} variant='outlined' />}
          {option.location?.city && <Chip size='small' label={`${option.location.city}`} variant='outlined' />}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
        <Tooltip title='View group details'>
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              handleViewGroupDetails(option)
            }}
          >
            <VisibilityIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
        <GroupIcon sx={{ color: 'text.secondary' }} />
        <Typography variant='body2' color='text.secondary'>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Autocomplete
          sx={{ flex: 1 }}
          options={groups}
          value={selectedGroup}
          onChange={handleGroupSelect}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          loading={loading}
          placeholder={placeholder}
          renderInput={params => (
            <TextField
              {...params}
              placeholder={placeholder}
              InputProps={{
                ...params.InputProps,
                endAdornment: <>{loading ? null : params.InputProps.endAdornment}</>
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />

        <Button
          variant='outlined'
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ flexShrink: 0 }}
        >
          Add New
        </Button>
      </Box>

      {/* Create Group Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <CreateGroupForm onSubmit={handleCreateGroup} onCancel={() => setOpenCreateDialog(false)} isInline={true} />
        </DialogContent>
      </Dialog>

      {/* Group Details Dialog */}
      <GroupDetailsPopup open={openDetailsDialog} group={selectedGroup} onClose={() => setOpenDetailsDialog(false)} />
    </Box>
  )
}

export default GroupAutocomplete
