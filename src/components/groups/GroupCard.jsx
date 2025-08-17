import React from 'react'
import { Card, CardContent, Typography, Stack, Chip, Grid, Box, Divider } from '@mui/material'
import IconButtonTooltip from '../IconButtonTooltip'

import { Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

const GroupCard = ({ groups, onEditGroup, onViewGroup, onDeleteGroup }) => {
  if (!groups.length) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <Typography variant='body1' color='text.secondary'>
          No groups found
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {groups.map(group => {
        return (
          <Grid item xs={12} sm={4} md={4} lg={3} key={group?._id || group?.groupName}>
            <Card variant='outlined' sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant='h6' align='center' gutterBottom>
                  {group?.groupName || 'Untitled Group'}
                </Typography>

                {group?.description ? (
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                    {group.description}
                  </Typography>
                ) : null}

                <Typography variant='caption' color='text.secondary'>
                  Created by:{' '}
                  {group?.creatorEmail || (group?.createdBy ? String(group.createdBy).slice(0, 8) : 'Unknown')}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box display='flex'>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5, mr: 1 }}>
                    Group by:
                  </Typography>

                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    {group?.ageGroup && (
                      <Chip size='small' label={`Age: ${group.ageGroup.min}-${group.ageGroup.max}`} />
                    )}
                    {group?.gender && <Chip size='small' label={`Gender: ${group.gender}`} />}
                    {(() => {
                      const parts = [group?.location?.country, group?.location?.region, group?.location?.city].filter(
                        Boolean
                      )
                      return parts.length > 0 ? <Chip size='small' label={`Location: ${parts.join(', ')}`} /> : null
                    })()}
                    {!group?.ageGroup &&
                      !group?.gender &&
                      !group?.location?.country &&
                      !group?.location?.region &&
                      !group?.location?.city && (
                        <Typography variant='caption' color='text.secondary'>
                          No filters applied
                        </Typography>
                      )}
                  </Stack>
                </Box>
                <Stack
                  direction='row'
                  spacing={1}
                  gap={1}
                  justifyContent='center'
                  className='border border-gray-200 rounded-md p-1'
                  mt={2}
                >
                  <IconButtonTooltip title='View Group Details' onClick={() => onViewGroup(group._id)} color='info'>
                    <VisibilityIcon />
                  </IconButtonTooltip>
                  <IconButtonTooltip title='Edit Group' onClick={() => onEditGroup(group._id)} color='warning'>
                    <EditIcon />
                  </IconButtonTooltip>
                  <IconButtonTooltip title='Delete Group' onClick={() => onDeleteGroup(group)} color='error'>
                    <DeleteIcon />
                  </IconButtonTooltip>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default GroupCard
