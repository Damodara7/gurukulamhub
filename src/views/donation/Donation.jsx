'use client'

import React, { useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  TextField,
  Paper,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  AlertTitle
} from '@mui/material'
import CenterBox from '@/components/CenterBox'
import AlertMessage from '@/components/alert-messages/AlertMessage'

const Donation = () => {
  // State for form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')

  // State for error handling and success
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Basic validation
    if (!name || !email || !amount) {
      setError('All fields are required')
      return
    }

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount')
      return
    }

    // Mocking successful form submission
    console.log('Donation submitted:', { name, email, amount })

    // Reset form and show success message
    setName('')
    setEmail('')
    setAmount('')
    setSuccess(true)
  }

  return (
    <Container maxWidth='lg' sx={{ py: 5 }}>
      {/* Page Header */}
      <CenterBox>
        <AlertMessage
          description={
            <>
              This page is currently under development — <strong>stay tuned for updates!</strong>
            </>
          }
          title={'Page Under Development'}
          severity='info'
          showIcon={true}
        />
      </CenterBox>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant='h3' gutterBottom color='primary'>
          Support Gurukulhub with a Donation
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Your donation helps us to improve and bring more amazing quizzes to the GurukulHub community. We appreciate your
          generosity!
        </Typography>
      </Box>

      {/* Progress Bar Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant='h5' gutterBottom color='primary'>
          Fundraising Goal: $10,000
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          We are currently at 70% of our goal! Help us reach the target to build more exciting features.
        </Typography>
        <Box sx={{ my: 2 }}>
          <LinearProgress variant='determinate' value={70} sx={{ height: '12px', borderRadius: '6px' }} />
        </Box>
      </Box>

      {/* Donation Info and Form */}
      <Grid container spacing={4}>
        {/* Donation Card */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <CardContent>
              <Typography variant='h5' color='secondary' gutterBottom>
                Why Donate?
              </Typography>
              <Typography variant='body1' gutterBottom>
                Your contributions help us build new features, enhance the user experience, and continue to make
                learning fun for everyone.
              </Typography>
              <Typography variant='h6' color='text.primary'>
                Make a difference with your support!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Donation Form */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom>
              Make a Donation
            </Typography>

            {/* Display error or success messages */}
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                Thank you for your donation!
              </Alert>
            )}

            {/* Form */}
            <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label='Full Name'
                variant='outlined'
                value={name}
                onChange={e => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Email Address'
                variant='outlined'
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label='Donation Amount'
                type='number'
                variant='outlined'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type='submit' fullWidth variant='contained' color='primary' size='large'>
                Donate Now
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* FAQ Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant='h4' color='primary' gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant='h6' color='secondary' gutterBottom>
                How does my donation help?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Your donation allows us to continuously enhance our platform with new features, improve our
                infrastructure, and bring better quizzes for learners around the world.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant='h6' color='secondary' gutterBottom>
                Is my donation secure?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Yes! We take data security seriously, and all donations are processed through secure payment gateways.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant='h6' color='secondary' gutterBottom>
                Can I get a refund?
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Donations are final, but if there are any issues, please reach out to our support team, and we will do
                our best to assist you.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Thank You Note */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          Thank you for considering a donation. Together, we can make learning more engaging and fun for everyone in the
          Gurukulhub community!
        </Typography>
      </Box>
    </Container>
  )
}

export default Donation
