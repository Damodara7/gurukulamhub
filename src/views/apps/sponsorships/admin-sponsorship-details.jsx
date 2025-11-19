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
  DialogTitle
} from '@mui/material'
import { AttachMoney, CardGiftcard, LocationOn, Email, Phone, Business, Language, ArrowBack } from '@mui/icons-material'
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
  const { data: session } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color='text.secondary'>Loading sponsorship details...</Typography>
      </Box>
    )
  }

  if (!sponsorship) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color='text.secondary'>Sponsorship not found</Typography>
      </Box>
    )
  }

  const formatCurrency = (value, currency = 'INR') =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency
    }).format(value || 0)

  const statusKey =
    sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus
  const statusColor = statusColorMap[statusKey] || 'default'
  const locationText =
    sponsorship.location &&
    [sponsorship.location.country, sponsorship.location.region, sponsorship.location.city].filter(Boolean).join(', ')
  const showAdminActions = sponsorship.rewardType === 'physicalGift' && statusKey === 'pending'
  const cardStyles = {
    borderRadius: 3,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    backgroundColor: '#fff'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, ${alpha(
                      theme.palette.secondary.main,
                      0.05
                    )} 0%, transparent 50%),
                    ${theme.palette.background.default}`,
        py: { xs: 3, md: 4 }
      }}
    >
      <Container maxWidth='lg'>
        <Stack spacing={3}>
          <Card sx={{ ...cardStyles, overflow: 'hidden' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between' flexWrap='wrap'>
                  <Stack direction='row' spacing={2} alignItems='center' sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`
                      }}
                    >
                      <i className='ri-hand-heart-line' style={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        Sponsorship Overview
                      </Typography>
                      <Typography color='text.secondary' sx={{ mt: 0.5 }}>
                        Track contributor details, allocations, and approval actions
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ flex: { xs: '1 0 100%', md: 'initial' }, width: { xs: '100%', md: 'auto' } }}
                  >
                    <Chip label={statusKey} color={statusColor} sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                    <Box sx={{ ml: 'auto' }}>
                      <Button
                        variant='outlined'
                        startIcon={<ArrowBack />}
                        onClick={() => router.back()}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Back
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={cardStyles}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 700 }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Sponsor Type', value: sponsorship.sponsorType },
                  { label: 'Sponsorer Type', value: sponsorship.sponsorerType },
                  {
                    label: 'Reward Type',
                    value:
                      sponsorship.rewardType === 'cash' ? (
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <AttachMoney fontSize='small' />
                          <Typography>Cash</Typography>
                        </Stack>
                      ) : (
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <CardGiftcard fontSize='small' />
                          <Typography>Physical Gift</Typography>
                        </Stack>
                      )
                  }
                ].map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.label}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {item.label}
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {item.value || 'N/A'}
                    </Typography>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Status
                  </Typography>
                  <Chip label={statusKey} color={statusColor} size='small' sx={{ textTransform: 'capitalize' }} />
                  {statusKey === 'rejected' && sponsorship.nonCashSponsorshipRejectionReason && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant='caption' color='error.main' sx={{ fontWeight: 600, display: 'block' }}>
                        Rejection Reason
                      </Typography>
                      <Typography variant='body2' color='error.main'>
                        {sponsorship.nonCashSponsorshipRejectionReason}
                      </Typography>
                      {sponsorship.rejectorEmail && (
                        <Typography variant='caption' color='text.secondary'>
                          Rejected by: {sponsorship.rejectorEmail}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems='stretch'>
            <Box sx={{ flex: { lg: 7 }, width: '100%' }}>
              <Card sx={cardStyles}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Typography variant='h6' sx={{ mb: 3, fontWeight: 700 }}>
                    Sponsorer Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Full Name
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {sponsorship.fullname || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Email
                      </Typography>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Email fontSize='small' color='primary' />
                        <Typography variant='body1'>{sponsorship.email || sponsorship.accountHolderEmail}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Mobile
                      </Typography>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Phone fontSize='small' color='primary' />
                        <Typography variant='body1'>{sponsorship.mobileNumber || 'N/A'}</Typography>
                      </Stack>
                    </Grid>
                    {sponsorship.sponsorerType === 'organization' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Organization Name
                          </Typography>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Business fontSize='small' color='primary' />
                            <Typography variant='body1'>{sponsorship.orgName || 'N/A'}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Organization Type
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            {sponsorship.orgType || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Website
                          </Typography>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Language fontSize='small' color='primary' />
                            <Typography variant='body1'>{sponsorship.website || 'N/A'}</Typography>
                          </Stack>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { lg: 5 }, width: '100%' }}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Card sx={cardStyles}>
                  <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Typography variant='h6' sx={{ mb: 3, fontWeight: 700 }}>
                      Location
                    </Typography>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                      <LocationOn color='primary' />
                      <Typography variant='body1'>{locationText || 'Not specified'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>

                {(sponsorship.quizzes?.length > 0 || sponsorship.games?.length > 0) && (
                  <Card sx={cardStyles}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                      <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                        Sponsored Content
                      </Typography>
                      {sponsorship.quizzes?.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                            Quizzes
                          </Typography>
                          <Stack direction='row' spacing={1} flexWrap='wrap'>
                            {sponsorship.quizzes.map((quiz, index) => (
                              <Chip key={index} label={quiz.title} variant='outlined' size='small' />
                            ))}
                          </Stack>
                        </Box>
                      )}
                      {sponsorship.games?.length > 0 && (
                        <Box>
                          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                            Games
                          </Typography>
                          <Stack direction='row' spacing={1} flexWrap='wrap'>
                            {sponsorship.games.map((game, index) => (
                              <Chip key={index} label={game} variant='outlined' size='small' />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Box>
          </Stack>

          <Card sx={cardStyles}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 700 }}>
                {sponsorship.rewardType === 'physicalGift' ? 'Physical Gift Details' : 'Cash Details'}
              </Typography>
              <Grid container spacing={3}>
                {sponsorship.rewardType === 'physicalGift' ? (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Item
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {sponsorship.nonCashItem || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Quantity
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {sponsorship.numberOfNonCashItems || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Value Per Item
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatCurrency(sponsorship.rewardValuePerItem, sponsorship.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Total Value
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatCurrency(sponsorship.rewardValue, sponsorship.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Available Items
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {sponsorship.availableItems || 0}
                      </Typography>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Amount
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatCurrency(sponsorship.sponsorshipAmount, sponsorship.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Available Amount
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatCurrency(sponsorship.availableAmount, sponsorship.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant='subtitle2' color='text.secondary'>
                        Currency
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {sponsorship.currency}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
              {sponsorship.rewardDescription && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Description
                  </Typography>
                  <Typography variant='body1'>{sponsorship.rewardDescription}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {showAdminActions && (
            <Card sx={cardStyles}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant='h6' sx={{ mb: 2, fontWeight: 700 }}>
                  Admin Actions
                </Typography>
                <Stack
                  direction='row'
                  spacing={2}
                  alignItems='center'
                  sx={{ flexWrap: 'wrap', '& > *': { flex: { xs: '1 0 calc(50% - 8px)', sm: 'initial' } } }}
                >
                  <Button
                    fullWidth={false}
                    variant='contained'
                    component='label'
                    color='error'
                    onClick={() => setRejectDialogOpen(true)}
                    startIcon={<i className='ri-close-line' />}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Reject
                  </Button>
                  <Button
                    fullWidth={false}
                    variant='contained'
                    component='label'
                    color='success'
                    onClick={handleComplete}
                    startIcon={<i className='ri-check-line' />}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                  >
                    Accept
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>

      <Dialog
        maxWidth='sm'
        fullWidth
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Sponsorship</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a reason for rejecting this sponsorship.
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
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant='outlined' sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleReject} color='error' variant='contained' component='label' sx={{ borderRadius: 2 }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SponsorshipDetailPage
