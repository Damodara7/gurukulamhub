'use client'

import React from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const NonCashSponsorshipSuccess = dynamic(() => import('@/components/sponsor/NonCashSponsorshipSuccess'), {
  ssr: false
})

const NonCashSponsorshipClient = ({ sponsorship, errorType, sponsorshipId, message }) => {
  const router = useRouter()

  if (sponsorship) {
    return <NonCashSponsorshipSuccess sponsorship={sponsorship} />
  }

  switch (errorType) {
    case 'missingId':
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom color="error">
              Invalid Sponsorship ID
            </Typography>
            <Typography variant="body1" paragraph>
              The sponsorship ID is missing from the URL. Please check the link and try again.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/sponsor/quizzes')}
              sx={{ mt: 2 }}
            >
              Return to Sponsorship Page
            </Button>
          </Box>
        </Container>
      )
    
    case 'notFound':
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom color="error">
              Sponsorship Not Found
            </Typography>
            <Typography variant="body1" paragraph>
              We couldn't find a sponsorship with ID: {sponsorshipId}
            </Typography>
            <Typography variant="body2" paragraph>
              {message || 'The sponsorship may have been deleted or the ID might be incorrect.'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/sponsor/quizzes')}
              sx={{ mt: 2 }}
            >
              Return to Sponsorship Page
            </Button>
          </Box>
        </Container>
      )
    
    case 'serverError':
    default:
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom color="error">
              Error Loading Sponsorship
            </Typography>
            <Typography variant="body1" paragraph>
              We encountered an error while trying to load your sponsorship details.
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
              {message || 'Please try again later.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/sponsor/quizzes')}
              >
                Return to Sponsorship Page
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Container>
      )
  }
}

export default NonCashSponsorshipClient