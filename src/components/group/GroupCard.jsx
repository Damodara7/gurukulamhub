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
  Lock as LockIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material'
import GroupFallBackCard from './GroupFallBackCard'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const GroupCard = ({ groups, onEditGroup, onViewGroup }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState({})
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)

  // Check for pending requests for each group
  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!session?.user?.email) return

      for (const group of groups) {
        try {
          const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP_REQUEST}?groupId=${group._id}&status=pending`)
          if (result?.status === 'success') {
            setPendingRequests(prev => ({
              ...prev,
              [group._id]: result.result?.length || 0
            }))
          }
        } catch (error) {
          console.error('Error checking pending requests:', error)
        }
      }
    }

    checkPendingRequests()
  }, [groups, session?.user?.email])

  const handleJoinRequestClick = group => {
    // Navigate to the group request page with groupId in the URL path
    router.push(`/management/group/${group._id}/request`)
  }

  const handleDeleteClick = group => {
    setGroupToDelete(group)
    setConfirmationDialogOpen(true)
  }

  const handleFinalDeleteGroup = async () => {
    if (!groupToDelete) return

    try {
      console.log('Attempting to delete group:', groupToDelete._id)
      const result = await RestApi.del(`${API_URLS.v0.USERS_GROUP}?id=${groupToDelete._id}`)
      console.log('Delete group API response:', result)

      if (result?.status === 'success') {
        console.log('Group deleted successfully')
        // Group will remain visible until page refresh
        // WebSocket implementation will handle real-time updates later
      } else {
        console.error('Error deleting group:', result)
        throw new Error(result?.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }

  if (!groups.length) {
    return <GroupFallBackCard content='No groups found' path='/' btnText='Back To Home Page' />
  }

  return (
    <Grid container spacing={2}>
      {groups.map(group => {
        // Capitalize first letter of group name
        const groupName = group?.groupName
          ? group.groupName.charAt(0).toUpperCase() + group.groupName.slice(1)
          : 'Untitled Group'

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={group?._id || group?.groupName}>
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
                {/* Group Name and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Tooltip title={groupName || 'no Groupname is mentioned'} arrow>
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
                      {groupName || 'no Groupname is mentioned'}
                    </Typography>
                  </Tooltip>

                  {group?.status === 'public' ? (
                    <Chip
                      size='small'
                      icon={<PublicIcon sx={{ fontSize: 16 }} />}
                      label='Public'
                      color='success'
                      variant='outlined'
                    />
                  ) : (
                    <Chip
                      size='small'
                      icon={<LockIcon sx={{ fontSize: 16 }} />}
                      label='Private'
                      color='warning'
                      variant='outlined'
                    />
                  )}
                </Box>

                {group?.description ? (
                  <Tooltip title={group.description} arrow>
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
                      {group.description || 'No description available'}
                    </Typography>
                  </Tooltip>
                ) : null}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PersonIcon fontSize='small' color='action' />
                  <Tooltip
                    title={`Created by: ${
                      group?.creatorEmail || (group?.createdBy ? String(group.createdBy) : 'Unknown')
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
                      {group?.creatorEmail || (group?.createdBy ? String(group.createdBy).slice(0, 8) : 'Unknown')}
                    </Typography>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize='small' color='action' />
                  <Typography variant='caption' color='text.secondary'>
                    {group?.membersCount === 0
                      ? 'No Members'
                      : group?.membersCount > 1
                        ? `${group?.membersCount} members`
                        : `${group?.membersCount} member`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ mb: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 'medium' }}>
                    Group by:
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
                    {group?.ageGroup && (
                      <Tooltip arrow title={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`}>
                        <Chip
                          size='small'
                          label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`}
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
                    )}
                    {group?.gender && (
                      <Tooltip
                        arrow
                        title={`Gender: ${
                          Array.isArray(group.gender) ? group.gender.join(', ') : String(group.gender)
                        }`}
                      >
                        <Chip
                          size='small'
                          label={`Gender: ${
                            Array.isArray(group.gender) ? group.gender.join(', ') : String(group.gender)
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
                    )}
                    {(() => {
                      const parts = [group?.location?.country, group?.location?.region, group?.location?.city].filter(
                        Boolean
                      )
                      const label = parts.length > 0 ? `Location: ${parts.join(', ')}` : null
                      return label ? (
                        <Tooltip arrow title={label}>
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
                      ) : null
                    })()}
                    {!group?.ageGroup &&
                      !group?.gender &&
                      !group?.location?.country &&
                      !group?.location?.region &&
                      !group?.location?.city && (
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
                    <IconButtonTooltip title='View Details' onClick={() => onViewGroup(group._id)} color='info'>
                      <VisibilityIcon />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Edit' onClick={() => onEditGroup(group._id)} color='warning'>
                      <EditIcon />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Delete' onClick={() => handleDeleteClick(group)} color='error'>
                      <DeleteIcon />
                    </IconButtonTooltip>
                    {pendingRequests[group._id] > 0 && session?.user?.email === group?.creatorEmail && (
                      <Badge badgeContent={pendingRequests[group._id]} color='error'>
                        <IconButtonTooltip
                          title={`${pendingRequests[group._id]} pending join requests`}
                          onClick={() => handleJoinRequestClick(group)}
                          color='primary'
                        >
                          <GroupAddIcon />
                        </IconButtonTooltip>
                      </Badge>
                    )}
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
        type='delete-group'
        onConfirm={() => {
          handleFinalDeleteGroup()
          setGroupToDelete(null) // Reset after confirmation
        }}
      />
    </Grid>
  )
}

export default GroupCard
