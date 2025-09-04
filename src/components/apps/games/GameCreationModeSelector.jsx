import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  RequestQuote as RequestIcon
} from '@mui/icons-material'

const GameCreationModeSelector = ({ onModeSelect }) => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h4' gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Create New Game
      </Typography>
      
      <Typography variant='body1' sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
        Choose how you want to create your game
      </Typography>

      <Grid container spacing={3}>
        {/* Option 1: Create & Schedule with existing sponsors */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={() => onModeSelect('existing_sponsors')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant='h5' gutterBottom>
                Create & Schedule Game
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Use existing sponsorships to create and immediately schedule your game
              </Typography>
              <Button 
                variant='contained' 
                fullWidth
                component='label'
                sx={{ color: 'white' }}
              >
                Create with Existing Sponsors
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Option 2: Create game & Request sponsorship */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={() => onModeSelect('request_sponsorship')}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <RequestIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant='h5' gutterBottom>
                Create Game & Request Sponsorship
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Create your game first and request sponsors to fund the rewards
              </Typography>
              <Button 
                variant='contained' 
                color='secondary'
                fullWidth
                component='label'
                sx={{ color: 'white' }}
              >
                Request Sponsorship
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Option 1:</strong> Best when you already have sponsors committed to your game
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          <strong>Option 2:</strong> Best when you want to create the game first and find sponsors later
        </Typography>
      </Box>
    </Box>
  )
}

export default GameCreationModeSelector
