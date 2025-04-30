'use client'
import { Button, Typography } from '@mui/material'
import React from 'react'

const AccessDenied = () => (
  <div className='flex flex-col items-center justify-center bg-gray-100 p-4 text-center'>
    <div className='bg-white shadow-md rounded-lg p-8 max-w-md mx-auto'>
      <Typography variant='h3' color='error'>
        Access Denied!
      </Typography>
      <p className='text-gray-700 mb-6 '>You do not have permission to view this page.</p>
      <Button
        className='mt-2 px-6 py-2'
        variant='contained'
        onClick={() => (window.location.href = '/')} // Redirects to homepage or login page
      >
        Go to Home
      </Button>
    </div>
  </div>
)

export default AccessDenied
