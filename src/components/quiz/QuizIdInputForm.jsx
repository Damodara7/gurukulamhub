'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, TextField, Button, Typography, Alert, Collapse, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const QuizIdInputForm = ({ mode = 'play' }) => {
  const [quizId, setQuizId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Function to validate MongoDB ObjectId
  const isValidObjectId = id => {
    return /^[0-9a-fA-F]{24}$/.test(id)
  }

  const fetchQuizData = async quizId => {
    try {
      const response = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
      return response
    } catch (error) {
      console.error('Error fetching quiz data:', error)
      throw error
    }
  }

  const handleSubmit = async e => {
    console.log('hello')
    setError('')
    setLoading(true)

    try {
      // Validate input
      if (!quizId.trim()) {
        throw new Error('Please enter a valid Quiz ID')
      }

      if (!isValidObjectId(quizId)) {
        throw new Error('Invalid Quiz ID')
      }

      // Then verify quiz exists
      const quizDataRes = await fetchQuizData(quizId)
      if (quizDataRes?.status !== 'success') {
        throw new Error('Invalid Quiz ID')
      }

      // Redirect if all checks pass
      router.push(`/publicquiz/play/${quizId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      height='100%'
      bgcolor='#46178f'
      // className='bg-primary'
    >
      {/* Logo Title */}
      <Typography
        variant='h2'
        component='label'
        sx={{
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          mb: 6,
          fontSize: '3rem',
          letterSpacing: '0.05em'
        }}
      >
        <Box className='flex gap-2 items-center'>
          <div>GurukulamHub </div>
        </Box>
      </Typography>

      {/* Form */}
      <form
        className='flex flex-col items-center justify-between gap-2 p-4 rounded-lg shadow-lg'
        style={{
          backgroundColor: 'white',
          width: '380px',
          maxWidth: '90%'
        }}
      >
        {/* Input Field */}
        <TextField
          label=''
          placeholder='Quiz Id'
          variant='outlined'
          value={quizId}
          onChange={e => setQuizId(e.target.value)}
          InputProps={{
            classes: {
              notchedOutline: 'border-2' // Adding Tailwind's 2px border width class
            }
          }}
          sx={{
            mb: 2,
            width: '100%',
            '& .MuiInputBase-input': {
              textAlign: 'center',
              padding: '10px',
              fontSize: '18px',
              letterSpacing: '0.05em',
              fontWeight: 'bold'
            }
          }}
          error={!!error}
          helperText='Ex: 6792294e5237090e08b0a0e8'
        />

        {/* Enter Button */}
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || quizId.length !== 24}
          component='label'
          style={{
            backgroundColor: 'rgb(66, 66, 66)',
            color: 'white',
            width: '100%',
            fontWeight: 'bold',
            fontSize: '18px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textTransform: 'none',
            padding: '10px',
            '&:hover': {
              backgroundColor: 'white'
            }
          }}
        >
          {loading ? 'Loading...' : 'Enter Quiz Id'}
        </Button>

        {/* Error Message */}
        <Collapse in={!!error} sx={{ width: '100%', maxWidth: '380px' }}>
          <Alert
            severity='error'
            action={
              <IconButtonTooltip
                title='Close'
                aria-label='close'
                color='inherit'
                size='small'
                onClick={() => setError('')}
              >
                <Close fontSize='inherit' />
              </IconButtonTooltip>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Collapse>
      </form>
    </Box>
  )
}

export default QuizIdInputForm
