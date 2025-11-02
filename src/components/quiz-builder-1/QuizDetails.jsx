import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Divider } from '@mui/material'
import { Title, Info, Translate, Key } from '@mui/icons-material' // Icons for quiz details
import MinimizableComponent from './MinimizableComponent'

const QuizDetails = ({ quiz }) => {
  if (!quiz) {
    return (
      <Typography variant='h6' color='error' sx={{ textAlign: 'center', mt: 2 }}>
        *Please select a quiz or create a new one
      </Typography>
    )
  }

  return (
    <MinimizableComponent
      panelName='Quiz Details'
      containerStyles={{}}
      buttonStyles={{ alignSelf: 'center' }}
      autoMinimizeAfter={5000}
    >
      <Card
        elevation={0}
        sx={{
          margin: 'auto',
          borderRadius: '12px',
          border: '1px solid #d0d0d0',
          backgroundColor: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#667eea',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Quiz Title */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' mb={1}>
                <Title sx={{ mr: 1.5, color: '#667eea', fontSize: '1.5rem' }} />
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#667eea', fontSize: '0.95rem' }}>
                  Title:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary' sx={{ ml: 5, fontWeight: 500 }}>
                {quiz.title || 'N/A'}
              </Typography>
            </Grid>

            {/* Quiz Details */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' mb={1}>
                <Info sx={{ mr: 1.5, color: '#667eea', fontSize: '1.5rem' }} />
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#667eea', fontSize: '0.95rem' }}>
                  Details:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary' sx={{ ml: 5, fontWeight: 500 }}>
                {quiz.details || 'N/A'}
              </Typography>
            </Grid>

            {/* Primary Language */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' mb={1}>
                <Translate sx={{ mr: 1.5, color: '#667eea', fontSize: '1.5rem' }} />
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#667eea', fontSize: '0.95rem' }}>
                  Primary Language:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary' sx={{ ml: 5, fontWeight: 500 }}>
                {quiz.language?.name || 'N/A'}
              </Typography>
            </Grid>

            {/* Quiz ID */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center' mb={1}>
                <Key sx={{ mr: 1.5, color: '#667eea', fontSize: '1.5rem' }} />
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#667eea', fontSize: '0.95rem' }}>
                  Quiz ID:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary' sx={{ ml: 5, fontWeight: 500 }}>
                {quiz.id || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </MinimizableComponent>
  )
}

export default QuizDetails
