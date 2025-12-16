import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Grid,
  Box,
  Divider,
  Tooltip,
  Badge,
  Button,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '../IconButtonTooltip'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import AudienceFallBackCard from './AudienceFallBackCard'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

const AudienceCard = ({ audiences, onEditAudience, onViewAudience, dynamicCounts = {}, loadingCounts = false }) => {
  const theme = useTheme()
  const { data: session } = useSession()
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
      const result = await RestApi.del(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceToDelete._id}`)

      if (result?.status === 'success') {
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
    <Box
      sx={{
        width: '100%',
        // Only apply max-height and scrolling on mobile
        pr: { xs: 0, sm: 0 },
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
        {audiences.map(audience => {
          // Capitalize first letter of audience name
          const audienceName = audience?.audienceName
            ? audience.audienceName.charAt(0).toUpperCase() + audience.audienceName.slice(1)
            : 'Untitled Audience'

          const memberCount = dynamicCounts[audience._id] || 0

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={audience?._id || audience?.audienceName}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: { xs: 2, sm: 3 },
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                      : `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`
                        : `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.3)
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Header - Audience Name with Member Count Badge */}
                  <Box sx={{ mb: 1.5 }}>
                    <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={1}>
                      <Tooltip title={audienceName} arrow>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.1rem' },
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3,
                            flex: 1
                          }}
                        >
                          {audienceName}
                        </Typography>
                      </Tooltip>
                      <Chip
                        icon={<PeopleIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                        label={loadingCounts ? '...' : memberCount}
                        size='small'
                        sx={{
                          height: { xs: 22, sm: 24 },
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                            theme.palette.secondary.main,
                            0.1
                          )})`,
                          color: theme.palette.primary.main,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '& .MuiChip-icon': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    </Stack>
                  </Box>

                  {/* Description - Fixed Height for 2 Lines with Ellipsis */}
                  <Box
                    sx={{
                      height: { xs: 36, sm: 42 },
                      mb: { xs: 0.75, sm: 0.5 }
                    }}
                  >
                    <Tooltip title={audience?.description || 'No description'} arrow>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}
                      >
                        {audience?.description || 'No description provided'}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Creator Info - Compact */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.5, sm: 0.75 },
                      mb: { xs: 1, sm: 1.5 },
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: { xs: 1, sm: 1.5 },
                      background: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: theme.palette.primary.main }} />
                    <Tooltip
                      title={`Created by: ${
                        audience?.creatorEmail || (audience?.createdBy ? String(audience.createdBy) : 'Unknown')
                      }`}
                      arrow
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {audience?.creatorEmail ||
                          (audience?.createdBy ? String(audience.createdBy).slice(0, 8) : 'Unknown')}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Filters Section - Compact */}
                  <Box sx={{ mb: { xs: 1, sm: 1.5 }, flexGrow: 1 }}>
                    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
                      <FilterIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: theme.palette.primary.main }} />
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          textTransform: 'uppercase'
                        }}
                      >
                        Filters
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(
                          theme.palette.secondary.main,
                          0.03
                        )})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        minHeight: { xs: 60, sm: 78 },
                        maxHeight: { xs: 80, sm: 100 },
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
                                <Tooltip
                                  key='age'
                                  arrow
                                  title={`Age Range: ${audience.ageGroup.min}-${audience.ageGroup.max} years`}
                                >
                                  <Chip
                                    size='small'
                                    label={`Age: ${audience.ageGroup.min}-${audience.ageGroup.max}`}
                                    icon={<CakeIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                    sx={{
                                      height: { xs: 26, sm: 30 },
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      fontWeight: 600,
                                      borderRadius: 1.5,
                                      background:
                                        theme.palette.mode === 'dark'
                                          ? `linear-gradient(135deg, ${alpha(theme.palette.grey[600], 0.3)}, ${alpha(
                                              theme.palette.grey[600],
                                              0.2
                                            )})`
                                          : `linear-gradient(135deg, ${alpha(theme.palette.grey[600], 0.2)}, ${alpha(
                                              theme.palette.grey[600],
                                              0.15
                                            )})`,
                                      boxShadow:
                                        theme.palette.mode === 'dark'
                                          ? `0 1px 3px ${alpha(theme.palette.grey[400], 0.15)}`
                                          : `0 1px 3px ${alpha(theme.palette.grey[400], 0.08)}`,
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.grey[100]
                                          : theme.palette.grey[900],
                                      border: `1px solid ${alpha(
                                        theme.palette.grey[600],
                                        theme.palette.mode === 'dark' ? 0.3 : 0.2
                                      )}`,
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        background:
                                          theme.palette.mode === 'dark'
                                            ? `linear-gradient(135deg, ${alpha(theme.palette.grey[600], 0.4)}, ${alpha(
                                                theme.palette.grey[600],
                                                0.3
                                              )})`
                                            : `linear-gradient(135deg, ${alpha(theme.palette.grey[600], 0.28)}, ${alpha(
                                                theme.palette.grey[600],
                                                0.22
                                              )})`,
                                        boxShadow: `0 2px 4px ${alpha(
                                          theme.palette.grey[600],
                                          theme.palette.mode === 'dark' ? 0.2 : 0.12
                                        )}`,
                                        transform: 'translateY(-1px)'
                                      },
                                      '& .MuiChip-icon': {
                                        fontSize: 16,
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[300]
                                            : theme.palette.grey[600],
                                        marginLeft: '8px',
                                        marginRight: '-2px'
                                      },
                                      '& .MuiChip-label': {
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[100]
                                            : theme.palette.grey[600],
                                        paddingLeft: '10px',
                                        paddingRight: '12px'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              )
                            })
                          }

                          if (audience?.gender) {
                            const genderValues = audience.gender.values
                              ? audience.gender.values
                              : Array.isArray(audience.gender)
                                ? audience.gender
                                : [String(audience.gender)]
                            const genderLabel = genderValues.join(', ')
                            filters.push({
                              type: 'gender',
                              order: audience.gender.order || 1,
                              chip: (
                                <Tooltip key='gender' arrow title={`Gender: ${genderLabel}`}>
                                  <Chip
                                    size='small'
                                    label={genderLabel.length > 18 ? genderLabel.substring(0, 18) + '...' : genderLabel}
                                    icon={<PersonIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                    sx={{
                                      height: { xs: 26, sm: 30 },
                                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                      fontWeight: 600,
                                      borderRadius: 1.5,
                                      background:
                                        theme.palette.mode === 'dark'
                                          ? alpha(theme.palette.grey[400], 0.25)
                                          : alpha(theme.palette.grey[400], 0.15),
                                      boxShadow:
                                        theme.palette.mode === 'dark'
                                          ? `0 1px 3px ${alpha(theme.palette.grey[400], 0.15)}`
                                          : `0 1px 3px ${alpha(theme.palette.grey[400], 0.08)}`,
                                      color:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.grey[200]
                                          : theme.palette.grey[600],
                                      border: `1px solid ${alpha(
                                        theme.palette.grey[400],
                                        theme.palette.mode === 'dark' ? 0.3 : 0.2
                                      )}`,
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        background:
                                          theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.grey[400], 0.35)
                                            : alpha(theme.palette.grey[400], 0.22),
                                        boxShadow: `0 2px 4px ${alpha(
                                          theme.palette.grey[400],
                                          theme.palette.mode === 'dark' ? 0.2 : 0.12
                                        )}`,
                                        transform: 'translateY(-1px)'
                                      },
                                      '& .MuiChip-icon': {
                                        fontSize: 16,
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[300]
                                            : theme.palette.grey[600],
                                        marginLeft: '8px',
                                        marginRight: '-2px'
                                      },
                                      '& .MuiChip-label': {
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[200]
                                            : theme.palette.grey[600],
                                        paddingLeft: '10px',
                                        paddingRight: '12px'
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
                            const locationLabel = parts.join(', ')

                            if (locationLabel) {
                              filters.push({
                                type: 'location',
                                order: audience.location.order || 1,
                                chip: (
                                  <Tooltip key='location' arrow title={`Location: ${locationLabel}`}>
                                    <Chip
                                      size='small'
                                      label={
                                        locationLabel.length > 20
                                          ? locationLabel.substring(0, 20) + '...'
                                          : locationLabel
                                      }
                                      icon={<LocationIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                      sx={{
                                        height: { xs: 26, sm: 30 },
                                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                        background:
                                          theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.grey[500], 0.2)
                                            : alpha(theme.palette.grey[500], 0.12),
                                        boxShadow:
                                          theme.palette.mode === 'dark'
                                            ? `0 1px 3px ${alpha(theme.palette.grey[500], 0.15)}`
                                            : `0 1px 3px ${alpha(theme.palette.grey[500], 0.08)}`,
                                        color:
                                          theme.palette.mode === 'dark'
                                            ? theme.palette.grey[200]
                                            : theme.palette.grey[700],
                                        border: `1px solid ${alpha(
                                          theme.palette.grey[500],
                                          theme.palette.mode === 'dark' ? 0.35 : 0.25
                                        )}`,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          background:
                                            theme.palette.mode === 'dark'
                                              ? alpha(theme.palette.grey[500], 0.28)
                                              : alpha(theme.palette.grey[500], 0.18),
                                          boxShadow: `0 2px 4px ${alpha(
                                            theme.palette.grey[500],
                                            theme.palette.mode === 'dark' ? 0.2 : 0.12
                                          )}`,
                                          transform: 'translateY(-1px)'
                                        },
                                        '& .MuiChip-icon': {
                                          fontSize: 16,
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.grey[300]
                                              : theme.palette.grey[700],
                                          marginLeft: '8px',
                                          marginRight: '-2px'
                                        },
                                        '& .MuiChip-label': {
                                          color:
                                            theme.palette.mode === 'dark'
                                              ? theme.palette.grey[200]
                                              : theme.palette.grey[700],
                                          paddingLeft: '10px',
                                          paddingRight: '12px'
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
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                width: '100%',
                                py: 1
                              }}
                            >
                              <FilterIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.disabled' }} />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  color: 'text.disabled',
                                  fontStyle: 'italic'
                                }}
                              >
                                No filters applied
                              </Typography>
                            </Box>
                          )}
                      </Stack>
                    </Box>
                  </Box>

                  {/* Action Buttons - With Text Labels */}
                  <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
                  <Stack direction='row' spacing={{ xs: 0.5, sm: 1 }} justifyContent='space-between'>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => onViewAudience(audience._id)}
                      sx={{
                        flex: 1,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        py: { xs: 0.5, sm: 0.75 },
                        px: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.info.main, 0.2),
                        color: alpha(theme.palette.info.main, 0.6),
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.info.main,
                          color: theme.palette.info.main,
                          background: alpha(theme.palette.info.main, 0.08),
                          transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' },
                          boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`
                        }
                      }}
                      startIcon={<VisibilityIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    >
                      View
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => onEditAudience(audience._id)}
                      sx={{
                        flex: 1,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        py: { xs: 0.5, sm: 0.75 },
                        px: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.warning.main, 0.2),
                        color: alpha(theme.palette.warning.main, 0.6),
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.warning.main,
                          color: theme.palette.warning.main,
                          background: alpha(theme.palette.warning.main, 0.08),
                          transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' },
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`
                        }
                      }}
                      startIcon={<EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    >
                      Edit
                    </Button>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => handleDeleteClick(audience)}
                      sx={{
                        flex: 1,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        py: { xs: 0.5, sm: 0.75 },
                        px: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.error.main, 0.2),
                        color: alpha(theme.palette.error.main, 0.6),
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.error.main,
                          color: theme.palette.error.main,
                          background: alpha(theme.palette.error.main, 0.08),
                          transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' },
                          boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                        }
                      }}
                      startIcon={<DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

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
    </Box>
  )
}

export default AudienceCard
