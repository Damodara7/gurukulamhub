import React from 'react'
import {
  Grid,
  Divider,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { RiAddFill } from 'react-icons/ri'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CurrentWorkingPositionModal, { WorkingPositionViewModal } from './CurrentWorkingPositionModal'

const WorkExperienceSection = ({
  formData,
  profileData,
  pendingPositions,
  removedPositionIds,
  isModalOpen,
  editingWorkingPosition,
  viewingPosition,
  isViewWorkingPositionModalOpen,
  handleOpenModal,
  handleCloseModal,
  handleCloseViewWorkingPositionModal,
  handleEditWorkingPosition,
  handleViewWorkingPosition,
  handleDeleteWorkingPosition,
  handleAddWorkingPositionToState,
  handleUpdateWorkingPositionInState,
  handleFormChange,
  session
}) => {
  return (
    <>
      {/* ----Work History---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider> Work History </Divider>
      </Grid>
      {/* Add New Position Button and Open To Work / Hiring */}
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: 2
          }}
        >
          {/* Add New Position Button - Left Side */}
          <Button
            startIcon={<RiAddFill />}
            variant='text'
            color='primary'
            onClick={() => handleOpenModal('workingPosition')}
            sx={{ flexShrink: 0 }}
          >
            Add New Position
          </Button>

          {/* Open To Work for Individual - Right Side */}
          {formData.accountType === 'INDIVIDUAL' && (
            <FormGroup sx={{ flexShrink: 0 }}>
              <FormControlLabel
                checked={formData.openToWork}
                control={<Checkbox />}
                label='Open to work'
                name='openToWork'
                onChange={(e, checked) => handleFormChange('openToWork', checked)}
              />
            </FormGroup>
          )}

          {/* Hiring for Business/NGO - Right Side */}
          {(formData.accountType === 'BUSINESS' || formData.accountType === 'NGO') && (
            <FormGroup sx={{ flexShrink: 0 }}>
              <FormControlLabel
                name='hiring'
                checked={formData.hiring}
                control={<Checkbox />}
                label='Hiring'
                onChange={(e, checked) => handleFormChange('hiring', checked)}
              />
            </FormGroup>
          )}
        </Box>
      </Grid>

      {/* Display Working Positions List */}
      {((profileData?.workingPositions && profileData.workingPositions.length > 0) || pendingPositions.length > 0) && (
        <Grid item xs={12}>
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                maxHeight: '160px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.5)'
                  }
                }
              }}
            >
              <Grid container spacing={2}>
                {/* Display existing positions that are not marked for removal */}
                {profileData?.workingPositions
                  ?.filter(position => !removedPositionIds.includes(position._id))
                  ?.map((position, index) => (
                    <Grid item xs={12} md={6} key={position._id || index}>
                      <Box
                        sx={{
                          p: 2,
                          height: '100%',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: 'background.paper'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant='body2'
                                  color='text.primary'
                                  sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                                >
                                  Job Title:
                                </Typography>
                                <Chip
                                  label={position.title}
                                  size='small'
                                  variant='outlined'
                                  sx={{
                                    maxWidth: '200px',
                                    '& .MuiChip-label': {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant='body2'
                                  color='text.primary'
                                  sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                                >
                                  Company:
                                </Typography>
                                <Chip
                                  label={position.companyName}
                                  size='small'
                                  variant='outlined'
                                  sx={{
                                    maxWidth: '200px',
                                    '& .MuiChip-label': {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                            <IconButton size='small' color='info' onClick={() => handleViewWorkingPosition(position)}>
                              <VisibilityIcon fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleEditWorkingPosition(position)}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteWorkingPosition(position._id)}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                {/* Display pending positions */}
                {pendingPositions.map((position, index) => (
                  <Grid item xs={12} md={6} key={position._id || index}>
                    <Box
                      sx={{
                        p: 2,
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        opacity: 0.8 // Visual indicator that it's pending
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant='body2'
                                color='text.primary'
                                sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                              >
                                Job Title:
                              </Typography>
                              <Chip
                                label={position.title}
                                size='small'
                                variant='outlined'
                                sx={{
                                  maxWidth: '200px',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant='body2'
                                color='text.primary'
                                sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                              >
                                Company:
                              </Typography>
                              <Chip
                                label={position.companyName}
                                size='small'
                                variant='outlined'
                                sx={{
                                  maxWidth: '200px',
                                  '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                          <IconButton size='small' color='info' onClick={() => handleViewWorkingPosition(position)}>
                            <VisibilityIcon fontSize='small' />
                          </IconButton>
                          <IconButton size='small' color='primary' onClick={() => handleEditWorkingPosition(position)}>
                            <EditIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDeleteWorkingPosition(position._id)}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>
      )}

      {/* Working Position Modal */}
      {isModalOpen.workingPosition && (
        <CurrentWorkingPositionModal
          email={session?.user?.email}
          open={isModalOpen.workingPosition}
          onClose={() => handleCloseModal('workingPosition')}
          onAddWorkingPositionToState={handleAddWorkingPositionToState}
          onUpdateWorkingPositionInState={handleUpdateWorkingPositionInState}
          existingPositions={profileData?.workingPositions || []}
          editingWorkingPosition={editingWorkingPosition}
        />
      )}

      {/* Working Position View Modal */}
      <WorkingPositionViewModal
        open={isViewWorkingPositionModalOpen}
        onClose={() => handleCloseViewWorkingPositionModal('workingPosition')}
        position={viewingPosition}
        onEdit={handleEditWorkingPosition}
      />
    </>
  )
}

export default WorkExperienceSection
