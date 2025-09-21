import React from 'react'
import { Grid, Divider, Box, Typography, Chip, IconButton, Button } from '@mui/material'
import { RiAddFill } from 'react-icons/ri'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import NewAssociatedOrganization, { AssociatedOrganizationViewModal } from './NewAssociatedOrganization'

const OrganizationSection = ({
  formData,
  profileData,
  pendingOrganizations,
  removedOrganizationIds,
  isModalOpen,
  editingAssociatedOrganization,
  viewingOrganization,
  isViewAssociatedOrganizationModalOpen,
  handleOpenModal,
  handleCloseModal,
  handleCloseViewAssociatedOrganizationModal,
  handleEditAssociatedOrganization,
  handleViewAssociatedOrganization,
  handleDeleteAssociatedOrganization,
  handleAddAssociatedOrganizationToState,
  handleUpdateAssociatedOrganizationInState,
  session
}) => {
  return (
    <>
      {/* ----Associated Organizations---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider>Associated Organizations</Divider>
      </Grid>
      {/* Add New Organization Button */}
      <Grid item xs={12}>
        <Button
          startIcon={<RiAddFill />}
          variant='text'
          color='primary'
          onClick={() => handleOpenModal('associatedOrganization')}
        >
          Add New Organization
        </Button>
      </Grid>

      {/* Display Organizations List */}
      {((profileData?.associatedOrganizations && profileData.associatedOrganizations.length > 0) ||
        pendingOrganizations.length > 0) && (
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
                {/* Display existing organizations that are not marked for removal */}
                {profileData?.associatedOrganizations
                  ?.filter(organization => !removedOrganizationIds.includes(organization._id))
                  ?.map((organization, index) => (
                    <Grid item xs={12} md={6} key={organization._id || index}>
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
                                  Organization:
                                </Typography>
                                <Chip
                                  label={organization.organization}
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
                                  Org-Type:
                                </Typography>
                                <Chip
                                  label={organization.organizationType}
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
                            <IconButton
                              size='small'
                              color='info'
                              onClick={() => handleViewAssociatedOrganization(organization)}
                            >
                              <VisibilityIcon fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleEditAssociatedOrganization(organization)}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteAssociatedOrganization(organization._id)}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                {/* Display pending organizations */}
                {pendingOrganizations.map((organization, index) => (
                  <Grid item xs={12} md={6} key={organization._id || index}>
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
                                Organization:
                              </Typography>
                              <Chip
                                label={organization.organization}
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
                                Type:
                              </Typography>
                              <Chip
                                label={organization.organizationType}
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
                          <IconButton
                            size='small'
                            color='info'
                            onClick={() => handleViewAssociatedOrganization(organization)}
                          >
                            <VisibilityIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleEditAssociatedOrganization(organization)}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleDeleteAssociatedOrganization(organization._id)}
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

      {/* Associated Organization Modal */}
      {isModalOpen.associatedOrganization && (
        <NewAssociatedOrganization
          email={session?.user?.email}
          open={isModalOpen.associatedOrganization}
          onClose={() => handleCloseModal('associatedOrganization')}
          onAddAssociatedOrganizationToState={handleAddAssociatedOrganizationToState}
          onUpdateAssociatedOrganizationInState={handleUpdateAssociatedOrganizationInState}
          existingOrganizations={profileData?.associatedOrganizations || []}
          editingAssociatedOrganization={editingAssociatedOrganization}
        />
      )}

      {/* Associated Organization View Modal */}
      <AssociatedOrganizationViewModal
        open={isViewAssociatedOrganizationModalOpen}
        onClose={() => handleCloseViewAssociatedOrganizationModal('associatedOrganization')}
        organization={viewingOrganization}
        onEdit={handleEditAssociatedOrganization}
      />
    </>
  )
}

export default OrganizationSection
