import React from 'react'
import { Grid, Divider, Box, Typography, Chip, IconButton, Button } from '@mui/material'
import { RiAddFill } from 'react-icons/ri'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EducationModal, { EducationViewModal } from './EducationModal'

const EducationSection = ({
  formData,
  profileData,
  pendingEducations,
  removedEducationIds,
  isModalOpen,
  editingEducation,
  viewingEducation,
  isViewEducationModalOpen,
  handleOpenModal,
  handleCloseModal,
  handleCloseViewEducationModal,
  handleEditEducation,
  handleViewEducation,
  handleDeleteEducation,
  handleAddEducationToState,
  handleUpdateEducationInState,
  session
}) => {
  return (
    <>
      {/* ----Education---- */}
      {formData.accountType === 'INDIVIDUAL' && (
        <>
          <Grid item xs={12} marginLeft={'0.25rem'}>
            <Divider>Education</Divider>
          </Grid>
          {/* Add New Education Button */}
          <Grid item xs={12}>
            <Button
              startIcon={<RiAddFill />}
              variant='text'
              color='primary'
              onClick={() => handleOpenModal('education')}
            >
              Add New Education
            </Button>
          </Grid>

          {/* Display Education List */}
          {((profileData?.schools && profileData.schools.length > 0) || pendingEducations.length > 0) && (
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
                    {/* Display existing education that are not marked for removal */}
                    {profileData?.schools
                      ?.filter(school => !removedEducationIds.includes(school._id))
                      ?.map((school, index) => (
                        <Grid item xs={12} md={6} key={school._id || index}>
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
                                      {school.highestQualification === '7th Grade' ||
                                      school.highestQualification === '10th Grade'
                                        ? 'School:'
                                        : 'College:'}
                                    </Typography>
                                    <Chip
                                      label={school.school}
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
                                  {school.degree && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography
                                        variant='body2'
                                        color='text.primary'
                                        sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                                      >
                                        Degree:
                                      </Typography>
                                      <Chip
                                        label={school.degree}
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
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                                <IconButton size='small' color='info' onClick={() => handleViewEducation(school)}>
                                  <VisibilityIcon fontSize='small' />
                                </IconButton>
                                <IconButton size='small' color='primary' onClick={() => handleEditEducation(school)}>
                                  <EditIcon fontSize='small' />
                                </IconButton>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => handleDeleteEducation(school._id)}
                                >
                                  <DeleteIcon fontSize='small' />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    {/* Display pending education */}
                    {pendingEducations.map((education, index) => (
                      <Grid item xs={12} md={6} key={education._id || index}>
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
                                    {education.highestQualification === '7th Grade' ||
                                    education.highestQualification === '10th Grade'
                                      ? 'School:'
                                      : 'College:'}
                                  </Typography>
                                  <Chip
                                    label={education.school}
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
                                {education.degree && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                      variant='body2'
                                      color='text.primary'
                                      sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                                    >
                                      Degree:
                                    </Typography>
                                    <Chip
                                      label={education.degree}
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
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                              <IconButton size='small' color='info' onClick={() => handleViewEducation(education)}>
                                <VisibilityIcon fontSize='small' />
                              </IconButton>
                              <IconButton size='small' color='primary' onClick={() => handleEditEducation(education)}>
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDeleteEducation(education._id)}
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

          {/* Education Modal */}
          {isModalOpen.education && (
            <EducationModal
              email={session?.user?.email}
              open={isModalOpen.education}
              onClose={() => handleCloseModal('education')}
              onAddEducationToState={handleAddEducationToState}
              onUpdateEducationInState={handleUpdateEducationInState}
              existingSchools={profileData?.schools || []}
              editingEducation={editingEducation}
            />
          )}

          {/* Education View Modal */}
          <EducationViewModal
            open={isViewEducationModalOpen}
            onClose={() => handleCloseViewEducationModal('education')}
            education={viewingEducation}
            onEdit={handleEditEducation}
          />
        </>
      )}
    </>
  )
}

export default EducationSection
