import React, { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Stack, Chip, Grid, Box, Divider, Tooltip, Badge, Button } from '@mui/material'
import IconButtonTooltip from '../IconButtonTooltip'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import AudienceFallBackCard from './AudienceFallBackCard'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const AudienceCard = ({ audiences, onEditAudience, onViewAudience, dynamicCounts = {}, loadingCounts = false }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [audienceToDelete, setAudienceToDelete] = useState(null)
  // WebSocket handling moved to parent component (AllAudiencePage)

  const handleDeleteClick = audience => {
    setAudienceToDelete(audience)
    setConfirmationDialogOpen(true)
  }

  const handleFinalDeleteAudience = async () => {
    if (!audienceToDelete) return

    try {
      console.log('Attempting to delete audience:', audienceToDelete._id)
      const result = await RestApi.del(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceToDelete._id}`)
      console.log('Delete audience API response:', result)

      if (result?.status === 'success') {
        console.log('Audience deleted successfully')
        // WebSocket will handle real-time updates automatically
        // Close the confirmation dialog
        setConfirmationDialogOpen(false)
        setAudienceToDelete(null)
      } else {
        console.error('Error deleting audience:', result)
        throw new Error(result?.message || 'Failed to delete audience')
      }
    } catch (error) {
      console.error('Error deleting audience:', error)
      throw error
    }
  }

  if (!audiences.length) {
    return <AudienceFallBackCard content='No audiences found' path='/' btnText='Back To Home Page' />
  }

  return (
    <Grid container spacing={2}>
      {audiences.map(audience => {
        // Capitalize first letter of audience name
        const audienceName = audience?.audienceName
          ? audience.audienceName.charAt(0).toUpperCase() + audience.audienceName.slice(1)
          : 'Untitled Audience'

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={audience?._id || audience?.audienceName}>
            <Card
              variant='outlined'
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Audience Name and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Tooltip title={audienceName || 'no Audiencename is mentioned'} arrow>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 'bold',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        mr: 1
                      }}
                    >
                      {audienceName || 'no Audiencename is mentioned'}
                    </Typography>
                  </Tooltip>

                  {/* Status field removed */}
                </Box>

                {audience?.description ? (
                  <Tooltip title={audience.description} arrow>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        mb: 1.5,
                        maxWidth: '250px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {audience.description || 'No description available'}
                    </Typography>
                  </Tooltip>
                ) : null}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PersonIcon fontSize='small' color='action' />
                  <Tooltip
                    title={`Created by: ${
                      audience?.creatorEmail || (audience?.createdBy ? String(audience.createdBy) : 'Unknown')
                    }`}
                    arrow
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {audience?.creatorEmail ||
                        (audience?.createdBy ? String(audience.createdBy).slice(0, 8) : 'Unknown')}
                    </Typography>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize='small' color='action' />
                  <Typography variant='caption' color='text.secondary'>
                    {loadingCounts
                      ? 'Loading...'
                      : (() => {
                          const count =
                            dynamicCounts[audience._id] !== undefined
                              ? dynamicCounts[audience._id]
                              : audience?.membersCount || 0
                          return count === 0 ? 'No Members' : count > 1 ? `${count} members` : `${count} member`
                        })()}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ mb: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 'medium' }}>
                    Audience by:
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 1,
                    borderRadius: 1,
                    maxHeight: 120,
                    overflowY: 'auto'
                  }}
                >
                  <Stack
                    direction='row'
                    spacing={1}
                    useFlexGap
                    sx={{
                      flexWrap: 'wrap',
                      rowGap: 1,
                      columnGap: 1,
                      width: '100%'
                    }}
                  >
                    {(() => {
                      // Create filter objects with their order for sorting
                      const filters = []

                      if (audience?.ageGroup) {
                        filters.push({
                          type: 'age',
                          order: audience.ageGroup.order || 1,
                          chip: (
                            <Tooltip key='age' arrow title={`Age: ${audience.ageGroup.min}-${audience.ageGroup.max}`}>
                              <Chip
                                size='small'
                                label={`Age: ${audience.ageGroup.min}-${audience.ageGroup.max}`}
                                sx={{
                                  maxWidth: 100,
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            </Tooltip>
                          )
                        })
                      }

                      if (audience?.gender) {
                        filters.push({
                          type: 'gender',
                          order: audience.gender.order || 1,
                          chip: (
                            <Tooltip
                              key='gender'
                              arrow
                              title={`Gender: ${
                                audience.gender.values
                                  ? audience.gender.values.join(', ')
                                  : Array.isArray(audience.gender)
                                    ? audience.gender.join(', ')
                                    : String(audience.gender)
                              }`}
                            >
                              <Chip
                                size='small'
                                label={`Gender: ${
                                  audience.gender.values
                                    ? audience.gender.values.join(', ')
                                    : Array.isArray(audience.gender)
                                      ? audience.gender.join(', ')
                                      : String(audience.gender)
                                }`}
                                sx={{
                                  maxWidth: 120,
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            </Tooltip>
                          )
                        })
                      }

                      if (audience?.location?.country || audience?.location?.region || audience?.location?.city) {
                        const parts = [
                          audience?.location?.country,
                          audience?.location?.region,
                          audience?.location?.city
                        ].filter(Boolean)
                        const label = parts.length > 0 ? `Location: ${parts.join(', ')}` : null

                        if (label) {
                          filters.push({
                            type: 'location',
                            order: audience.location.order || 1,
                            chip: (
                              <Tooltip key='location' arrow title={label}>
                                <Chip
                                  size='small'
                                  label={label}
                                  sx={{
                                    maxWidth: 180,
                                    '& .MuiChip-label': {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              </Tooltip>
                            )
                          })
                        }
                      }

                      // Sort filters by their order and return chips
                      return filters.sort((a, b) => a.order - b.order).map(filter => filter.chip)
                    })()}
                    {!audience?.ageGroup &&
                      !audience?.gender &&
                      !audience?.location?.country &&
                      !audience?.location?.region &&
                      !audience?.location?.city && (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Typography variant='caption' color='text.secondary'>
                            No filters applied
                          </Typography>
                        </Box>
                      )}
                  </Stack>
                </Box>
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Stack
                    direction='row'
                    spacing={1}
                    gap={1}
                    justifyContent='center'
                    className='border border-gray-200 rounded-md p-1'
                  >
                    <IconButtonTooltip title='View Details' onClick={() => onViewAudience(audience._id)} color='info'>
                      <VisibilityIcon />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Edit' onClick={() => onEditAudience(audience._id)} color='warning'>
                      <EditIcon />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Delete' onClick={() => handleDeleteClick(audience)} color='error'>
                      <DeleteIcon />
                    </IconButtonTooltip>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )
      })}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-audience'
        onConfirm={() => {
          handleFinalDeleteAudience()
          setAudienceToDelete(null) // Reset after confirmation
        }}
      />
    </Grid>
  )
}

export default AudienceCard
