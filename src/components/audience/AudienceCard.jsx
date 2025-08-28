import React from 'react'
import { Card, CardContent, Typography, Stack, Chip, Grid, Box, Divider, Tooltip } from '@mui/material'
import IconButtonTooltip from '../IconButtonTooltip'
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'

const AudienceCard = ({ audiences, onEditAudience, onViewAudience, onDeleteAudience }) => {
  if (!audiences.length) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <Typography variant='body1' color='text.secondary'>
          No audiences found
        </Typography>
      </Box>
    )
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
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 'bold' }}>
                  {audienceName || 'no Audiencename is mentioned'}
                </Typography>

                {audience?.description ? (
                    <Tooltip title={audience.description} arrow>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        mb: 1.5,
                        width: '100%',
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
                      {audience?.creatorEmail || (audience?.createdBy ? String(audience.createdBy).slice(0, 8) : 'Unknown')}
                    </Typography>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize='small' color='action' />
                  <Typography variant='caption' color='text.secondary'>
                    {audience?.membersCount === 0 ? 'No Members': audience?.membersCount > 1 ? `${audience?.membersCount} members` : `${audience?.membersCount} member`}
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
                    {audience?.ageGroup && (
                      <Tooltip arrow title={`Age: ${audience.ageGroup.min}-${audience.ageGroup.max}`}>
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
                    )}
                    {audience?.gender && (
                      <Tooltip
                        arrow
                        title={`Gender: ${
                          Array.isArray(audience.gender) ? audience.gender.join(', ') : String(audience.gender)
                        }`}
                      >
                        <Chip
                          size='small'
                          label={`Gender: ${
                            Array.isArray(audience.gender) ? audience.gender.join(', ') : String(audience.gender)
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
                      const parts = [audience?.location?.country, audience?.location?.region, audience?.location?.city].filter(
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
                      <EditIcon  />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Delete' onClick={() => onDeleteAudience(audience)} color='error'>
                      <DeleteIcon />
                    </IconButtonTooltip>  
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

  export default AudienceCard
