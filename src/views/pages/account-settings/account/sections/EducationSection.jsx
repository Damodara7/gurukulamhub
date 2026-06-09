import React, { useMemo } from 'react'
import { Grid, Divider, Box, Typography, Chip, IconButton, Button } from '@mui/material'
import { RiAddFill } from 'react-icons/ri'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EducationModal, { EducationViewModal } from '../EducationModal'
import {
  formatEducationDuration,
  formatEducationGrade,
  getCompletionStatusColor,
  getCompletionStatusLabel,
  getEducationCategoryConfig,
  getEducationDisplayTitle,
  getEducationSubtitle,
  getInstitutionLabel,
  resolveEducationCategory,
  sortEducationsByEndDate
} from '@/utils/educationUtils'

function EducationEntryCard({ education, onView, onEdit, onDelete, isPending = false }) {
  const category = resolveEducationCategory(education)
  const categoryConfig = getEducationCategoryConfig(category)
  const institutionLabel = getInstitutionLabel(education.highestQualification, category)
  const status = education.isCurrentlyStudying ? 'in_progress' : education.completionStatus || 'completed'

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        opacity: isPending ? 0.85 : 1
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
            {getEducationDisplayTitle(education)}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
            {institutionLabel}: {education.school}
            {getEducationSubtitle(education) ? ` · ${getEducationSubtitle(education)}` : ''}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
            {formatEducationDuration(education)}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label={getCompletionStatusLabel(status)}
              size='small'
              color={getCompletionStatusColor(status)}
              variant='outlined'
            />
            {(categoryConfig.label || education.highestQualification) && (
              <Chip
                label={categoryConfig.label || education.highestQualification}
                size='small'
                variant='outlined'
              />
            )}
            {formatEducationGrade(education) && (
              <Chip label={formatEducationGrade(education)} size='small' variant='outlined' />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
          <IconButton size='small' color='info' onClick={() => onView(education)}>
            <VisibilityIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' color='primary' onClick={() => onEdit(education)}>
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' color='error' onClick={() => onDelete(education._id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

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
  const sortedEducations = useMemo(() => {
    const existingEducations =
      profileData?.schools?.filter(school => !removedEducationIds.includes(school._id)) || []

    return sortEducationsByEndDate([...existingEducations, ...pendingEducations])
  }, [profileData?.schools, pendingEducations, removedEducationIds])

  return (
    <>
      {formData.accountType === 'INDIVIDUAL' && (
        <>
          <Grid item xs={12} marginLeft={'0.25rem'}>
            <Divider>Education</Divider>
          </Grid>

          <Grid item xs={12}>
            <Button
              startIcon={<RiAddFill />}
              variant='text'
              color='primary'
              onClick={() => handleOpenModal('education')}
            >
              Add Education
            </Button>
          </Grid>

          {sortedEducations.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    maxHeight: '280px',
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
                    {sortedEducations.map((education, index) => (
                      <Grid item xs={12} md={6} key={education._id || index}>
                        <EducationEntryCard
                          education={education}
                          isPending={String(education._id || '').startsWith('temp_')}
                          onView={handleViewEducation}
                          onEdit={handleEditEducation}
                          onDelete={handleDeleteEducation}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Grid>
          )}

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
