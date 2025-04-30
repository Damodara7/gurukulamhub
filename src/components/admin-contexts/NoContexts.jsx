import React, { useState } from 'react'
import { Button, Box, Typography } from '@mui/material'
import ContextForm from './ContextForm'

function NoContexts({ onCreateRootContext, contextType={contextType} }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' height='100%'>
      <Typography variant='h6' gutterBottom>
        No contexts exist.
      </Typography>
      {!showForm ? (
        <Button style={{color: 'white'}} component='label' variant='contained' color='primary' onClick={() => setShowForm(true)}>
          Create Root Context
        </Button>
      ) : (
        <ContextForm
          showForm={showForm}
          contextType={contextType}
          isRoot={true}
          onSubmit={onCreateRootContext}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Box>
  )
}

export default NoContexts
