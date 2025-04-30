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
      containerStyles={{  }}
      buttonStyles={{ alignSelf: 'center' }}
      autoMinimizeAfter={5000}
    >
      <Card elevation={3} sx={{ margin: 'auto' }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Quiz Title */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center'>
                <Title sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  Title:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary'>
                {quiz.title || 'N/A'}
              </Typography>
            </Grid>

            {/* Quiz Details */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center'>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  Details:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary'>
                {quiz.details || 'N/A'}
              </Typography>
            </Grid>

            {/* Primary Language */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center'>
                <Translate sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  Primary Language:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary'>
                {quiz.language?.name || 'N/A'}
              </Typography>
            </Grid>

            {/* Quiz ID */}
            <Grid item xs={12} md={6}>
              <Box display='flex' alignItems='center'>
                <Key sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='subtitle1' fontWeight='bold'>
                  Quiz ID:
                </Typography>
              </Box>
              <Typography variant='body1' color='text.secondary'>
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
