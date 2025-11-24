'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  Container,
  Stack,
  CircularProgress,
  DialogTitle
} from '@mui/material'
import { 
  AttachMoney, 
  CardGiftcard, 
  LocationOn, 
  Email, 
  Phone, 
  Business, 
  Language,
  ArrowBack,
  AdminPanelSettings,
  InfoOutlined
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const statusColorMap = {
  completed: 'success',
  pending: 'warning',
  rejected: 'error',
  failed: 'error',
  expired: 'secondary',
  created: 'default'
}

const SponsorshipDetailPage = ({ id = null }) => {
  const router = useRouter()
  const theme = useTheme()
  const {data: session} = useSession()
  const [sponsorship, setSponsorship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchSponsorshipDetails()
  }, [id])

  const fetchSponsorshipDetails = async () => {
    try {
      const response = await RestApi.get(`${API_URLS.v0.SPONSORSHIP}?id=${id}`)
      if (response.status === 'success') {
        setSponsorship(response.result)
      }
    } catch (error) {
      console.error('Error fetching sponsorship details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    try {
      const response = await RestApi.put(`${API_URLS.v0.SPONSORSHIP}`, {
        id: id,
        nonCashSponsorshipStatus: 'completed'
      })

      if (response.status === 'success') {
        router.push('/management/sponsorships?filter=awaiting')
      }
    } catch (error) {
      console.error('Error completing sponsorship:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      const response = await RestApi.put(`${API_URLS.v0.SPONSORSHIP}`, {
        id: id,
        nonCashSponsorshipStatus: 'rejected',
        nonCashSponsorshipRejectionReason: rejectionReason,
        rejectorEmail: session?.user?.email
      })

      if (response.status === 'success') {
        setRejectDialogOpen(false)
        router.push('/management/sponsorships?filter=awaiting')
      }
    } catch (error) {
      console.error('Error rejecting sponsorship:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        bgcolor: theme.palette.background.default
      }}>
        <Stack spacing={2} alignItems='center'>
          <CircularProgress size={48} />
          <Typography color='text.secondary'>Loading sponsorship details...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!sponsorship) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Container maxWidth='sm'>
          <Card sx={{ 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 8px 24px rgba(0,0,0,0.08)',
            bgcolor: theme.palette.background.paper
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <InfoOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
                Sponsorship Not Found
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                The sponsorship you're looking for doesn't exist or has been removed.
              </Typography>
              <Button variant='contained' onClick={() => router.back()} startIcon={<ArrowBack />}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
  }

  const formatCurrency = (value, currency = 'INR') =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency
    }).format(value || 0)
  

  const status = sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus
  const statusColor = {
    completed: 'success',
    pending: 'warning',
    rejected: 'error',
    created: 'default',
    expired: 'secondary',
    failed: 'error'
  }[status] || 'default'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
          pt: { xs: 4, md: 5 },
          pb: { xs: 4, md: 5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}
      >
        <Container maxWidth='lg'>
          <Stack spacing={3}>
            <Button
              variant='text'
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{
                width: 'fit-content',
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                px: 0,
                '&:hover': {
                  bgcolor: 'transparent',
                  color: 'primary.main'
                }
              }}
            >
              Back
            </Button>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent='space-between'>
              <Stack spacing={1.5}>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <AdminPanelSettings sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                  <Typography
                    variant='h3'
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2
                    }}
                  >
                    Sponsorship Details
                  </Typography>
                </Stack>
                <Typography variant='body1' sx={{ color: 'text.secondary', maxWidth: 600 }}>
                  Review and manage sponsorship information, approve or reject pending requests.
                </Typography>
              </Stack>
              <Chip
                icon={sponsorship.rewardType === 'cash' ? <AttachMoney /> : <CardGiftcard />}
                label={status}
                color={statusColor}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  height: 36,
                  px: 1
                }}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth='lg' sx={{ mt: 4 }}>

        {/* Basic Information */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Sponsor Type
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                    {sponsorship.sponsorType || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Sponsorer Type
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                    {sponsorship.sponsorerType || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(
                      sponsorship.rewardType === 'cash' ? theme.palette.success.main : theme.palette.warning.main,
                      theme.palette.mode === 'dark' ? 0.1 : 0.05
                    ),
                    border: `1px solid ${alpha(
                      sponsorship.rewardType === 'cash' ? theme.palette.success.main : theme.palette.warning.main,
                      0.2
                    )}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Reward Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {sponsorship.rewardType === 'cash' ? (
                      <>
                        <AttachMoney fontSize="small" sx={{ color: 'success.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Cash</Typography>
                      </>
                    ) : (
                      <>
                        <CardGiftcard fontSize="small" sx={{ color: 'warning.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Physical Gift</Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(
                      statusColor === 'success' ? theme.palette.success.main :
                      statusColor === 'warning' ? theme.palette.warning.main :
                      statusColor === 'error' ? theme.palette.error.main :
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.1 : 0.05
                    ),
                    border: `1px solid ${alpha(
                      statusColor === 'success' ? theme.palette.success.main :
                      statusColor === 'warning' ? theme.palette.warning.main :
                      statusColor === 'error' ? theme.palette.error.main :
                      theme.palette.primary.main,
                      0.2
                    )}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={status}
                      color={statusColor}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    {sponsorship.rewardType === 'physicalGift' && 
                     sponsorship.nonCashSponsorshipStatus === 'rejected' && 
                     sponsorship.nonCashSponsorshipRejectionReason && (
                      <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.08) }}>
                        <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                          Rejection Reason:
                        </Typography>
                        <Typography variant="body2" color="error.main" sx={{ fontSize: '0.8rem' }}>
                          {sponsorship.nonCashSponsorshipRejectionReason}
                        </Typography>
                        {sponsorship.rejectorEmail && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontSize: '0.75rem' }}>
                            <strong>Rejected by:</strong> {sponsorship.rejectorEmail}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
          </Grid>
        </CardContent>
      </Card>

        {/* Sponsorer Details */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Sponsorer Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, color: 'text.primary' }}>
                    {sponsorship.fullname || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Email
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Email fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {sponsorship.email || sponsorship.accountHolderEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                    Mobile
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Phone fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {sponsorship.mobileNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {sponsorship.sponsorerType === 'organization' && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Organization Name
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Business fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {sponsorship.orgName || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Organization Type
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, color: 'text.primary' }}>
                        {sponsorship.orgType || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Website
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Language fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {sponsorship.website || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </>
              )}
          </Grid>
        </CardContent>
      </Card>

        {/* Location Information */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Location
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <LocationOn sx={{ color: 'secondary.main', fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {sponsorship.location && 
                 [sponsorship.location.country, sponsorship.location.region, sponsorship.location.city]
                   .filter(Boolean)
                   .join(', ') || 'Not specified'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Reward Details */}
        {sponsorship.rewardType === 'physicalGift' ? (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Physical Gift Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Item
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                      {sponsorship.nonCashItem || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                      {sponsorship.numberOfNonCashItems || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Value Per Item
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                      {formatCurrency(sponsorship.rewardValuePerItem, sponsorship.currency)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Total Value
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
                      {formatCurrency(sponsorship.rewardValue, sponsorship.currency)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Available Items
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                      {sponsorship.availableItems || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {sponsorship.rewardDescription && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                    {sponsorship.rewardDescription}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Cash Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Amount
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 700, color: 'success.main', fontSize: '1.2rem' }}>
                      {formatCurrency(sponsorship.sponsorshipAmount, sponsorship.currency)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Available Amount
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                      {formatCurrency(sponsorship.availableAmount, sponsorship.currency)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      Currency
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
                      {sponsorship.currency || 'INR'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Sponsored Content */}
        {(sponsorship.quizzes?.length > 0 || sponsorship.games?.length > 0) && (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Sponsored Content
              </Typography>
              {sponsorship.quizzes && sponsorship.quizzes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                    Sponsored Quizzes
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {sponsorship.quizzes.map((quiz, index) => (
                      <Chip
                        key={index}
                        label={quiz.title}
                        variant="outlined"
                        size="medium"
                        sx={{
                          fontWeight: 500,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {sponsorship.games && sponsorship.games.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                    Sponsored Games
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {sponsorship.games.map((game, index) => (
                      <Chip
                        key={index}
                        label={game}
                        variant="outlined"
                        size="medium"
                        sx={{
                          fontWeight: 500,
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        {sponsorship.rewardType === 'physicalGift' && sponsorship.nonCashSponsorshipStatus === 'pending' && (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(0,0,0,0.06)',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Admin Actions
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  component='label'
                  onClick={handleComplete}
                  startIcon={<i className="ri-check-line" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: 2
                  }}
                >
                  Complete Sponsorship
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  component='label'
                  onClick={() => setRejectDialogOpen(true)}
                  startIcon={<i className="ri-close-line" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: 2
                  }}
                >
                  Reject Sponsorship
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Rejection Dialog */}
      <Dialog
        maxWidth={'sm'}
        fullWidth
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          Reject Sponsorship
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
            Please provide a reason for rejecting this sponsorship. This reason will be visible to the sponsor.
          </Typography>
          <TextField
            autoFocus
            margin='dense'
            label='Rejection Reason'
            type='text'
            fullWidth
            variant='outlined'
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : 'transparent'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            component='label'
            sx={{ textTransform: 'none', fontWeight: 600, px: 3, color: 'white' }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SponsorshipDetailPage
