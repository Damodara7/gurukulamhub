'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Box, Container, IconButton, Tooltip, useTheme, alpha, useMediaQuery, Stack } from '@mui/material'
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
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    <Box sx={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      overflow: 'auto',
      p: { xs: 3, sm: 4 }
    }}
    >
      <Container
        maxWidth='sm'
        sx={{
          '@media print': {
            mt: 0,
            '& button': { display: 'none' }
          }
        }}
      >
        <Card
          sx={{
            textAlign: 'center',
            p: { xs: 2.5, sm: 3, md: 4 },
            boxShadow: isDarkMode
              ? `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`
              : theme.shadows[10],
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : 'white',
            borderRadius: { xs: 3, md: 4 }
          }}
        >
          <CardContent sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
            {/* Animated Success */}
            <Box sx={{ width: { xs: 120, sm: 140, md: 150 }, height: { xs: 120, sm: 140, md: 150 }, mx: 'auto', mb: { xs: 2, sm: 2.5 } }}>
              <Lottie animationData={successAnimation} loop={false} />
            </Box>

            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                color: 'text.primary'
              }}
            >
              Game Sponsorship Successful!
            </Typography>

            <Typography
              variant='body1'
              color='text.secondary'
              paragraph
              sx={{
                fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                px: { xs: 1, sm: 0 }
              }}
            >
              Thank you for sponsoring this game reward. A confirmation has been sent to your email.
            </Typography>

            {/* Amount Paid */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                borderRadius: { xs: 2, sm: 2.5 },
                p: { xs: 2.5, sm: 3 },
                my: { xs: 2.5, sm: 3 },
                color: 'common.white',
                boxShadow: isDarkMode
                  ? `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`
                  : theme.shadows[4]
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color: 'white',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                }}
              >
                Amount Paid
              </Typography>
              <Typography
                variant='h3'
                sx={{
                  mt: { xs: 0.75, sm: 1 },
                  fontWeight: 800,
                  color: 'white',
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {formattedAmount}
              </Typography>
            </Box>

            {/* Game & Reward Details */}
            <Box sx={{ textAlign: 'left', mt: { xs: 2.5, sm: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1, md: 2 },
                  mb: { xs: 1.25, sm: 1.5 }
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Game:
                </Typography>
                <Typography
                  variant='body1'
                  component='span'
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {game.title}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1, md: 2 },
                  mb: { xs: 1.25, sm: 1.5 }
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Reward:
                </Typography>
                <Typography
                  variant='body1'
                  component='span'
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  Position {reward.position} -{' '}
                  {reward.rewardType === 'cash'
                    ? `${reward.currency} ${reward.rewardValuePerWinner} per winner`
                    : reward.nonCashReward}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1, md: 2 },
                  mb: { xs: 1.25, sm: 1.5 }
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Sponsor:
                </Typography>
                <Typography
                  variant='body1'
                  component='span'
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {sponsorship.fullname} ({sponsorship.email})
                </Typography>
              </Box>
            </Box>

            {/* IDs with Copy Functionality */}
            <Box sx={{ textAlign: 'left', mt: { xs: 2.5, sm: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  mb: { xs: 1.25, sm: 1.5 },
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Payment ID:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography
                    variant='body1'
                    component='span'
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                      wordBreak: 'break-all'
                    }}
                  >
                    {paymentId}
                  </Typography>
                  <Tooltip title={copied.paymentId ? 'Copied!' : 'Copy'}>
                    <IconButtonTooltip
                      title='Copy'
                      size='small'
                      onClick={() => handleCopy(paymentId, 'paymentId')}
                      aria-label='Copy payment ID'
                    >
                      <ContentCopyIcon fontSize='small' />
                    </IconButtonTooltip>
                  </Tooltip>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                  }}
                >
                  Sponsorship ID:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <Typography
                    variant='body1'
                    component='span'
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                      wordBreak: 'break-all'
                    }}
                  >
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
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                mt: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: { xs: 1.5, sm: 2 }
              }}
            >
              <Button
                variant='contained'
                color='primary'
                component='label'
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                fullWidth={isMobile}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  color: 'white',
                  boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode
                      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                      : undefined
                  },
                  transition: 'transform 0.2s'
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
                fullWidth={isMobile}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  ...(isDarkMode && {
                    borderColor: alpha(theme.palette.divider, 0.3),
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }),
                  '&:hover': { transform: 'translateY(-2px)' },
                  '@media print': { display: 'none' },
                  transition: 'transform 0.2s'
                }}
              >
                Print Receipt
              </Button>
            </Box>

            {/* Countdown Notice */}
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{
                display: 'block',
                mt: { xs: 2.5, sm: 3 },
                fontStyle: 'italic',
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Redirecting to games page in {countdown} seconds...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default GamePaymentSuccess
