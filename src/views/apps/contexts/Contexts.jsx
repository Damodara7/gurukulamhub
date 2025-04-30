'use client'

import React, { useEffect, useState } from 'react'

// Utility functions
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Material-UI Imports
import { Box, Typography } from '@mui/material'

// Component Imports
import AdminContextTree from '@/components/admin-contexts/AdminContextTree'
import ContextForm from '@/components/admin-contexts/ContextForm'
import NoContexts from '@/components/admin-contexts/NoContexts'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import { toast } from 'react-toastify'

function Contexts({ contextType = 'GENERIC' }) {
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
    <Box className='w-full' style={{ overflow: 'auto', padding: '16px' }}>
      {loading.contexts ? (
        <Typography variant='h6' align='center'>
          Loading contexts...
        </Typography>
      ) : contexts.length === 0 ? (
        <NoContexts contextType={contextType} onCreateRootContext={handleAddNode} />
      ) : (
        <Box className='w-full' style={{ overflow: 'auto' }}>
          <AdminContextTree
            onAddClick={handleAddChildNodeClick}
            onRemoveClick={handleRemoveNodeClick}
            onEditClick={handleEditNodeClick}
            data={contexts}
            headingLabel={`Contexts`}
          />
        </Box>
      )}

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
        type='delete-context' // Set the type based on your context
        onConfirm={handleRemoveNode}
      />
    </Box>
  )
}

export default Contexts
