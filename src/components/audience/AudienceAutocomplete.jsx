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
import {
  Add as AddIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  Cake as CakeIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateAudienceForm from './CreateAudienceForm'
import AudienceDetailsPopup from './AudienceDetailsPopup'
import { useSession } from 'next-auth/react'

const AudienceAutocomplete = ({
  value,
  onChange,
  label = 'Select Audience (Optional)',
  placeholder = 'Search audiences...'
}) => {
  const [audiences, setAudiences] = useState([])
  const [loading, setLoading] = useState(false)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState(null)
  const { data: session } = useSession()

  // Fetch groups on component mount
  useEffect(() => {
    fetchAudiences()
  }, [])

  // Set initial value if provided
  useEffect(() => {
    if (value && audiences.length > 0) {
      const audience = audiences.find(a => a._id === value)
      if (audience) {
        setSelectedAudience(audience)
      }
    }
  }, [value, audiences])

  const fetchAudiences = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}`)
      if (res?.status === 'success') {
        setAudiences(res.result || [])
      } else {
        console.error('Error fetching audiences:', res)
        toast.error('Failed to load audiences')
      }
    } catch (error) {
      console.error('Error fetching audiences:', error)
      toast.error('An error occurred while loading audiences')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = (event, newValue) => {
    setSelectedAudience(newValue)
    onChange(newValue?._id || null)
  }

  const handleCreateAudience = async audienceData => {
    try {
      console.log('form Data', groupData)

      // Prepare the payload
      const payload = {
        audienceName: audienceData.audienceName,
        description: audienceData.description,
        location: audienceData.location,
        gender: audienceData.gender,
        ageGroup: audienceData.ageGroup,
        createdBy: session?.user?.id, // Use the session user ID directly
        creatorEmail: session?.user?.email
      }

      console.log('payload data ', payload)

      // Call your API
      const result = await RestApi.post(API_URLS.v0.USERS_AUDIENCE, payload)
      console.log('result', result)

      if (result?.status === 'success') {
        const audienceId = result.result._id
        console.log('Audience created successfully with ID:', audienceId)
        toast.success('Audience created successfully!')
        setOpenCreateDialog(false)

        // Refresh groups list
        await fetchAudiences()

        // Auto-select the newly created group
        const newAudience = result.result
        setSelectedAudience(newAudience)
        onChange(newAudience._id)
      } else {
        console.error('Error creating audience:', result.message)
        toast.error(result?.message || 'Failed to create audience')
      }
    } catch (error) {
      console.error('Error creating audience:', error)
      toast.error('An error occurred while creating the audience')
    }
  }

  const handleViewAudienceDetails = audience => {
    setSelectedAudience(audience)
    setOpenDetailsDialog(true)
  }

  const getOptionLabel = option => {
    if (typeof option === 'string') return option
    return option?.audienceName || ''
  }

  const renderOption = (props, option) => (
    <Box
      component='li'
      {...props}
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant='body1' fontWeight='medium'>
          {option.audienceName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {option.description}
        </Typography>
        {(() => {
          const filterChips = []

          if (option.ageGroup?.min && option.ageGroup?.max) {
            filterChips.push(
              <Chip
                key='age'
                size='small'
                icon={<CakeIcon sx={{ fontSize: 16 }} />}
                label={`Age: ${option.ageGroup.min}-${option.ageGroup.max}`}
                variant='outlined'
                color='primary'
              />
            )
          }

          if (option.gender && Array.isArray(option.gender) && option.gender.length > 0) {
            filterChips.push(
              <Chip
                key='gender'
                size='small'
                icon={<PersonIcon sx={{ fontSize: 16 }} />}
                label={`Gender: ${option.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}`}
                variant='outlined'
                color='success'
              />
            )
          }

          if (option.location) {
            const locationParts = []
            if (option.location.country) locationParts.push(option.location.country)
            if (option.location.region) locationParts.push(option.location.region)
            if (option.location.city) locationParts.push(option.location.city)

            if (locationParts.length > 0) {
              filterChips.push(
                <Chip
                  key='location'
                  size='small'
                  icon={<LocationIcon sx={{ fontSize: 16 }} />}
                  label={`Location: ${locationParts.join(', ')}`}
                  variant='outlined'
                  color='secondary'
                />
              )
            }
          }

          return filterChips.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>{filterChips}</Box>
          ) : (
            <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic', mt: 0.5 }}>
              No filters applied
            </Typography>
          )
        })()}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
        <Tooltip title='View audience details'>
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              handleViewAudienceDetails(audienceOption)
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
          options={audiences}
          value={selectedAudience}
          onChange={handleAudienceSelect}
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
        <DialogTitle>Create New Audience</DialogTitle>
        <DialogContent>
          <CreateAudienceForm
            onSubmit={handleCreateAudience}
            onCancel={() => setOpenCreateDialog(false)}
            isInline={true}
          />
        </DialogContent>
      </Dialog>

      {/* Group Details Dialog */}
      <AudienceDetailsPopup
        open={openDetailsDialog}
        audience={selectedAudience}
        onClose={() => setOpenDetailsDialog(false)}
      />
    </Box>
  )
}

export default AudienceAutocomplete
