'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const RegisterForm = ({ game }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Registering:', formData)
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ color: 'primary.main' }}>
              <Typography variant='h6' color='primary'>
                Game Summary
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Title:</strong> {game.title || 'N/A'}
              </Typography>
              <Typography>
                <strong>Start Time:</strong> {new Date(game.startTime).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Registration End Time:</strong>{' '}
                {game.registrationEndTime ? new Date(game.registrationEndTime).toLocaleString() : 'N/A'}
              </Typography>
              <Typography>
                <strong>Location:</strong>{' '}
                {`${game.location?.city || ''}, ${game.location?.region || ''}, ${game.location?.country || ''}`}
              </Typography>

              
              <Typography>
                <strong>Total Reward Value:</strong> ₹{game.totalRewardValue || 0}
              </Typography>

              {game.promotionalVideoUrl && (
                <Typography>
                  <strong>Promotional Video:</strong>{' '}
                  <a href={game.promotionalVideoUrl} target='_blank' rel='noopener noreferrer'>
                    View
                  </a>
                </Typography>
              )}

              {game.thumbnailPoster && (
                <Typography>
                  <strong>Thumbnail:</strong>{' '}
                  <a href={game.thumbnailPoster} target='_blank' rel='noopener noreferrer'>
                    View Image
                  </a>
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Typography variant='h6' gutterBottom color='primary'>
              Register
            </Typography>
            <Stack spacing={2}>
              <TextField label='First Name' name='firstName' required onChange={handleChange} />
              <TextField label='Last Name' name='lastName' required onChange={handleChange} />
              <TextField label='Email' name='email' type='email' required onChange={handleChange} />
              <TextField label='Phone' name='phone' type='tel' required onChange={handleChange} />
            </Stack>
          </CardContent>
          <CardContent>
            <Button type='submit' variant='contained' color='primary' fullWidth>
              Submit
            </Button>
          </CardContent>
        </form>
      </Card>
    </>
  )
}

export default RegisterForm
