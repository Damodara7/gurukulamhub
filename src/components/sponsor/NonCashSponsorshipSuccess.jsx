'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Box, Container, IconButton, Tooltip, useTheme } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'
import successAnimation from '../../../public/animations/payment-success.json' // Replace with your Lottie file
import { revalidatePathAction } from '@/actions/revalidatePathAction'
import IconButtonTooltip from '@/components/IconButtonTooltip'

function NonCashSponsorshipSuccess({ sponsorship }) {
  const router = useRouter()
  const theme = useTheme()
  const [copied, setCopied] = useState({ sponsorshipId: false })
  const [countdown, setCountdown] = useState(10)

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const redirectTimer = setTimeout(() => {
      revalidatePathAction('/sponsor/list')
      router.push('/sponsor/list')
    }, 10 * 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [field]: true })
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
  }

  const handleGoHome = () => {
    revalidatePathAction('/sponsor/list')
    router.push('/sponsor/list')
  }

  const formattedValue = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: sponsorship.currency || 'INR'
  }).format(sponsorship.rewardValue)

  return (
    <Container
      maxWidth='sm'
      sx={{
        mt: { xs: 4, sm: 8 },
        '@media print': {
          mt: 0,
          '& button': { display: 'none' }
        }
      }}
    >
      <Card
        sx={{
          textAlign: 'center',
          p: { xs: 2, sm: 4 },
          boxShadow: theme.shadows[10],
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : 'transparent'
        }}
      >
        <CardContent>
          {/* Animated Success */}
          <Box sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}>
            <Lottie animationData={successAnimation} loop={false} />
          </Box>

          <Typography variant='h4' component='h1' gutterBottom sx={{ fontWeight: 700 }}>
            Sponsorship Confirmed!
          </Typography>

          <Typography variant='body1' color='text.secondary' paragraph>
            Thank you for your physical gift sponsorship. We'll contact you shortly about delivery details.
          </Typography>

          {/* Gift Details */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
              borderRadius: 2,
              p: 3,
              my: 3,
              color: 'common.white',
              boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'white' }}>
              Gift Details
            </Typography>
            <Typography variant='h5' sx={{ mt: 1, fontWeight: 800, color: 'white' }}>
              {sponsorship.nonCashItem}
            </Typography>
            <Typography variant='h6' sx={{ mt: 1, fontWeight: 600, color: 'white' }}>
              Quantity: {sponsorship.numberOfNonCashItems}
            </Typography>
            <Typography variant='h6' sx={{ mt: 1, fontWeight: 600, color: 'white' }}>
              Total Value: {formattedValue}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'left', mt: 3 }}>
            {sponsorship.sponsorType === 'game' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  You sponsored for games:
                </Typography>
                <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                  {sponsorship.games.join(', ')}
                </Typography>
              </Box>
            )}
            {sponsorship.sponsorType === 'quiz' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    You sponsored for quizzes:
                  </Typography>
                  <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                    {sponsorship?.quizzes?.map(q => q.title).join(', ')}
                  </Typography>
                </Box>
                {(() => {
                  let area = ``
                  if (sponsorship.location?.country) {
                    area += `${sponsorship.location?.country}`
                  }
                  if (sponsorship.location?.region) {
                    area += `, ${sponsorship.location?.region}`
                  }
                  if (sponsorship.location?.city) {
                    area += `, ${sponsorship.location?.city}`
                  }
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        You sponsored for games in area:
                      </Typography>
                      <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                        {area}
                      </Typography>
                    </Box>
                  )
                })()}
              </>
            )}
            {sponsorship.sponsorType === 'area' &&
              (() => {
                let area = ``
                if (sponsorship.location?.country) {
                  area += `${sponsorship.location?.country}`
                }
                if (sponsorship.location?.region) {
                  area += `, ${sponsorship.location?.region}`
                }
                if (sponsorship.location?.city) {
                  area += `, ${sponsorship.location?.city}`
                }
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      You sponsored for games in area:
                    </Typography>
                    <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                      {area}
                    </Typography>
                  </Box>
                )
              })()}
          </Box>

          {/* Sponsorship Details */}
          <Box sx={{ textAlign: 'left', mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Sponsorship ID:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                {sponsorship._id}
              </Typography>
              <Tooltip title={copied.sponsorshipId ? 'Copied!' : 'Copy'}>
                <IconButtonTooltip 
                  title='Copy'
                  size='small'
                  onClick={() => handleCopy(sponsorship._id, 'sponsorshipId')}
                  aria-label='Copy sponsorship ID'
                >
                  <ContentCopyIcon fontSize='small' />
                </IconButtonTooltip>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Status:
              </Typography>
              <Typography 
                variant='body1' 
                component='span' 
                sx={{ 
                  fontFamily: 'monospace',
                  color: sponsorship.nonCashSponsorshipStatus === 'pending' ? 
                    theme.palette.warning.main : 
                    sponsorship.nonCashSponsorshipStatus === 'completed' ? 
                    theme.palette.success.main : 
                    theme.palette.error.main
                }}
              >
                {sponsorship.nonCashSponsorshipStatus.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant='contained'
              color='primary'
              component='label'
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s',
                color: 'white'
              }}
            >
              Your Sponsorships
            </Button>

            <Button
              variant='outlined'
              color='primary'
              onClick={() => window.print()}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { transform: 'translateY(-2px)' },
                '@media print': { display: 'none' }
              }}
            >
              Print Confirmation
            </Button>
          </Box>

          {/* Countdown Notice */}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 3, fontStyle: 'italic' }}>
            Redirecting to homepage in {countdown} seconds...
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default NonCashSponsorshipSuccess