'use client'

import React, { useEffect, useState } from 'react'

// Utility functions
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Material-UI Imports
import { Box, Typography, Container, Stack } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

// Component Imports
import AdminContextTree from '@/components/admin-contexts/AdminContextTree'
import ContextForm from '@/components/admin-contexts/ContextForm'
import NoContexts from '@/components/admin-contexts/NoContexts'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import { toast } from 'react-toastify'

function Contexts({ contextType = 'GENERIC' }) {
  const theme = useTheme()
  const [loading, setLoading] = useState({ contexts: false, refetchContexts: false })
  const [contexts, setContexts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [dataToForm, setDataToForm] = useState(null)

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  async function getContexts() {
    setLoading(prev => ({ ...prev, contexts: true }))
    try {
      const result = await RestApi.get(`${API_URLS.v0.USERS_CONTEXT}?contextType=${contextType}`)
      if (result?.status === 'success') {
        console.log('Context Fetched result', result.result)
        setContexts(result.result)
      } else {
        console.error('Error fetching contexts:', result.message)
        setContexts([])
      }
    } catch (error) {
      console.error('Error fetching contexts(catch):', error)
    } finally {
      setLoading(prev => ({ ...prev, contexts: false }))
    }
  }

  useEffect(() => {
    getContexts()
  }, [])

  const handleAddNode = async formData => {
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_CONTEXT, formData)
      if (result?.status === 'success') {
        console.log('Context created:', result.result)
        setShowForm(false)
        setDataToForm(null)
        getContexts()
      } else {
        console.error('Error creating context:', result.message)
      }
    } catch (error) {
      console.error('Error creating context(catch):', error)
    }
  }

  const handleEditNode = async formData => {
    const { _id, title, description, tags } = formData
    try {
      const result = await RestApi.patch(API_URLS.v0.USERS_CONTEXT, { id: _id, title, description, tags })
      if (result?.status === 'success') {
        console.log('Context edited:', result.result)
        setShowForm(false)
        setDataToForm(null)
        getContexts()
      } else {
        console.error('Error editing context:', result.message)
      }
    } catch (error) {
      console.error('Error editing context(catch):', error)
    }
  }

  const handleRemoveNode = async () => {
    if (!dataToForm?.id || dataToForm?.action !== 'REMOVE') {
      setConfirmationDialogOpen(false)
      setDataToForm(null)
      toast.error('No context selected to remove.')
      return
    }
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_CONTEXT}?id=${dataToForm.id}&status='active`)
      if (result?.status === 'success') {
        console.log('Context deleted:', result)
        setConfirmationDialogOpen(false)
        setDataToForm(null)
        getContexts()
      } else {
        console.error('Error deleting context:', result.message)
      }
    } catch (error) {
      console.error('Error deleting context(catch):', error)
      throw new Error(error) // handling in Confirmation dialog
    }
  }

  async function handleAddChildNodeClick({ node }) {
    console.log('Add clicked node:', node)
    // Open the context form for adding a child node, passing the node ID as parentContextId
    setShowForm(true)
    setDataToForm({
      isRoot: false,
      parentContextId: node.id,
      parentContextObjectId: node._id,
      action: 'ADD'
    })
  }

  async function handleEditNodeClick({ node }) {
    console.log('Edit clicked node:', node)
    // Open the context form for editing the selected node, passing its properties
    setShowForm(true)
    setDataToForm({
      ...node,
      action: 'EDIT'
    })
  }

  async function handleRemoveNodeClick({ node }) {
    setConfirmationDialogOpen(true)
    setDataToForm({ id: node._id, action: 'REMOVE' })
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 18% 18%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 55%),
                     radial-gradient(circle at 82% 82%, ${alpha(
                       theme.palette.secondary.main,
                       0.06
                     )} 0%, transparent 55%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(16px)',
          bgcolor: alpha('#fff', 0.78),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            <Stack
              direction='row'
              spacing={{ xs: 1.5, sm: 2 }}
              justifyContent='center'
              alignItems='center'
              sx={{ mb: { xs: 1.75, sm: 2 } }}
            >
              <Box
                sx={{
                  width: { xs: 46, sm: 54 },
                  height: { xs: 46, sm: 54 },
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.28)}`
                }}
              >
                <i
                  className='ri-node-tree'
                  style={{ fontSize: 'clamp(22px, 6vw, 28px)', color: '#fff', lineHeight: 1 }}
                />
              </Box>
              <Stack spacing={0.5} alignItems='flex-start' sx={{ textAlign: 'left' }}>
                <Typography
                  sx={{
                    fontSize:{xs:'1.5rem',sm:'1.75rem',md:'2.5rem'},
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.018em'
                  }}
                >
                  Context Management
                </Typography>
              </Stack>
            </Stack>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.8,
                maxWidth: { xs: '100%', sm: '620px' },
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Organize and manage hierarchical contexts for your content structure
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container
        maxWidth='lg'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          py: { xs: 3, md: 4 }
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderRadius: 3,
            p: { xs: 2.5, sm: 3.5, md: 4 },
            boxShadow: '0 12px 32px rgba(15, 15, 45, 0.06)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          {loading.contexts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Stack spacing={2} alignItems='center'>
                <i
                  className='ri-loader-4-line'
                  style={{ fontSize: '48px', color: theme.palette.primary.main, animation: 'spin 1s linear infinite' }}
                />
                <Typography variant='h6' color='text.secondary'>
                  Loading contexts...
                </Typography>
              </Stack>
            </Box>
          ) : contexts.length === 0 ? (
            <NoContexts contextType={contextType} onCreateRootContext={handleAddNode} />
          ) : (
            <Box
              sx={{
                mt: { xs: 1.5, sm: 2 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <AdminContextTree
                onAddClick={handleAddChildNodeClick}
                onRemoveClick={handleRemoveNodeClick}
                onEditClick={handleEditNodeClick}
                data={contexts}
                headingLabel={`Contexts`}
              />
            </Box>
          )}
        </Box>

        {/* Dialog for non-root context forms */}
        {showForm && (
          <ContextForm
            showForm={showForm}
            contextType={contextType}
            isRoot={dataToForm?.isRoot || true}
            initialData={dataToForm || {}}
            parentContextId={dataToForm?.parentContextId || ''}
            parentContextObjectId={dataToForm?.parentContextObjectId || ''}
            onSubmit={dataToForm?.action === 'EDIT' ? handleEditNode : handleAddNode}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          type='delete-context'
          onConfirm={handleRemoveNode}
        />

        <style jsx global>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Container>
    </Box>
  )
}

export default Contexts
