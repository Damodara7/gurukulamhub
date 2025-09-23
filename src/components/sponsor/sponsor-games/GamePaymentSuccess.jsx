'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Box, Container, IconButton, Tooltip, useTheme } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'
import successAnimation from '../../../../public/animations/payment-success.json'
import { revalidatePathAction } from '@/actions/revalidatePathAction'
import IconButtonTooltip from '@/components/IconButtonTooltip'

function GamePaymentSuccess({ paymentId, sponsorship, amount, game, reward }) {
  const router = useRouter()
  const theme = useTheme()
  const [copied, setCopied] = useState({ paymentId: false, sponsorshipId: false })
  const [countdown, setCountdown] = useState(10)

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const redirectTimer = setTimeout(() => {
      revalidatePathAction('/sponsor/games')
      router.push('/sponsor/games')
    }, 10 * 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  const handleCopy = (text, field) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied({ ...copied, [field]: true })
      setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
    }
  }

  const handleGoHome = () => {
    revalidatePathAction('/sponsor/games')
    router.push('/sponsor/games')
  }

  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR'
  }).format(amount)

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
            Game Sponsorship Successful!
          </Typography>

          <Typography variant='body1' color='text.secondary' paragraph>
            Thank you for sponsoring this game reward. A confirmation has been sent to your email.
          </Typography>

          {/* Amount Paid */}
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
              Amount Paid
            </Typography>
            <Typography variant='h3' sx={{ mt: 1, fontWeight: 800, color: 'white' }}>
              {formattedAmount}
            </Typography>
          </Box>

          {/* Game & Reward Details */}
          <Box sx={{ textAlign: 'left', mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Game:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                {game.title}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Reward:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                Position {reward.position} - {reward.rewardType === 'cash' 
                  ? `${reward.currency} ${reward.rewardValuePerWinner} per winner`
                  : reward.nonCashReward
                }
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Sponsor:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                {sponsorship.fullname} ({sponsorship.email})
              </Typography>
            </Box>
          </Box>

          {/* IDs with Copy Functionality */}
          <Box sx={{ textAlign: 'left', mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Payment ID:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                {paymentId}
              </Typography>
              <Tooltip title={copied.paymentId ? 'Copied!' : 'Copy'}>
                <IconButtonTooltip title='Copy'
                  size='small'
                  onClick={() => handleCopy(paymentId, 'paymentId')}
                  aria-label='Copy payment ID'
                >
                  <ContentCopyIcon fontSize='small' />
                </IconButtonTooltip>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Sponsorship ID:
              </Typography>
              <Typography variant='body1' component='span' sx={{ fontFamily: 'monospace' }}>
                {sponsorship._id}
              </Typography>
              <Tooltip title={copied.sponsorshipId ? 'Copied!' : 'Copy'}>
                <IconButtonTooltip title='Copy'
                  size='small'
                  onClick={() => handleCopy(sponsorship._id, 'sponsorshipId')}
                  aria-label='Copy sponsorship ID'
                >
                  <ContentCopyIcon fontSize='small' />
                </IconButtonTooltip>
              </Tooltip>
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
              Back to Games
            </Button>

            <Button
              variant='outlined'
              color='primary'
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.print()
                }
              }}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { transform: 'translateY(-2px)' },
                '@media print': { display: 'none' }
              }}
            >
              Print Receipt
            </Button>
          </Box>

          {/* Countdown Notice */}
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 3, fontStyle: 'italic' }}>
            Redirecting to games page in {countdown} seconds...
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}

export default GamePaymentSuccess
