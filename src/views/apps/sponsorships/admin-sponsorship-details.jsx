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
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid
} from '@mui/material'
import { 
  AttachMoney, 
  CardGiftcard, 
  LocationOn, 
  Email, 
  Phone, 
  Business, 
  Language,
  ArrowBack
} from '@mui/icons-material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'

const SponsorshipDetailPage = ({id=null}) => {
  const router = useRouter()
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
        router.push('/management/sponsorships?sponsorType=awaiting')
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
        router.push('/management/sponsorships?sponsorType=awaiting')
      }
    } catch (error) {
      console.error('Error rejecting sponsorship:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!sponsorship) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Sponsorship not found</Typography>
      </Box>
    )
  }

  const formatCurrency = (value, currency = 'INR') => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    }).format(value || 0)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sponsorship Details</Typography>
        <Button variant="outlined" onClick={() => router.back()} startIcon={<ArrowBack />}>
          Back
        </Button>
      </Box>

      {/* Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Sponsor Type</Typography>
                <Typography variant="body1">{sponsorship.sponsorType}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Sponsorer Type</Typography>
                <Typography variant="body1">{sponsorship.sponsorerType}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Reward Type</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {sponsorship.rewardType === 'cash' ? (
                    <>
                      <AttachMoney fontSize="small" />
                      <Typography>Cash</Typography>
                    </>
                  ) : (
                    <>
                      <CardGiftcard fontSize="small" />
                      <Typography>Physical Gift</Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus}
                  color={
                    (sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus) === 'completed' ? 'success' :
                    (sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus) === 'pending' ? 'warning' :
                    (sponsorship.rewardType === 'cash' ? sponsorship.sponsorshipStatus : sponsorship.nonCashSponsorshipStatus) === 'rejected' ? 'error' : 'default'
                  }
                  size="small"
                />
                {/* Show rejection details if status is rejected */}
                {sponsorship.rewardType === 'physicalGift' && 
                 sponsorship.nonCashSponsorshipStatus === 'rejected' && 
                 sponsorship.nonCashSponsorshipRejectionReason && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 0.5 }}>
                      <strong>Rejection Reason:</strong>
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ fontSize: '0.875rem' }}>
                      {sponsorship.nonCashSponsorshipRejectionReason}
                    </Typography>
                    {sponsorship.rejectorEmail && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <strong>Rejected by:</strong> {sponsorship.rejectorEmail}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sponsorer Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sponsorer Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1">{sponsorship.fullname || 'N/A'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" />
                  <Typography variant="body1">{sponsorship.email || sponsorship.accountHolderEmail}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" />
                  <Typography variant="body1">{sponsorship.mobileNumber || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
            {sponsorship.sponsorerType === 'organization' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Organization Name</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" />
                      <Typography variant="body1">{sponsorship.orgName || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Organization Type</Typography>
                    <Typography variant="body1">{sponsorship.orgType || 'N/A'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Website</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Language fontSize="small" />
                      <Typography variant="body1">{sponsorship.website || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Location
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            <Typography>
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Physical Gift Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Item</Typography>
                  <Typography variant="body1">{sponsorship.nonCashItem || 'N/A'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{sponsorship.numberOfNonCashItems || 0}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Value Per Item</Typography>
                  <Typography variant="body1">{formatCurrency(sponsorship.rewardValuePerItem, sponsorship.currency)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Value</Typography>
                  <Typography variant="body1">{formatCurrency(sponsorship.rewardValue, sponsorship.currency)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Available Items</Typography>
                  <Typography variant="body1">{sponsorship.availableItems || 0}</Typography>
                </Box>
              </Grid>
            </Grid>
            {sponsorship.rewardDescription && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{sponsorship.rewardDescription}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cash Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1">{formatCurrency(sponsorship.sponsorshipAmount, sponsorship.currency)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Available Amount</Typography>
                  <Typography variant="body1">{formatCurrency(sponsorship.availableAmount, sponsorship.currency)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Currency</Typography>
                  <Typography variant="body1">{sponsorship.currency}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Sponsored Content */}
      {(sponsorship.quizzes?.length > 0 || sponsorship.games?.length > 0) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sponsored Content
            </Typography>
            {sponsorship.quizzes && sponsorship.quizzes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sponsored Quizzes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sponsorship.quizzes.map((quiz, index) => (
                    <Chip key={index} label={quiz.title} variant="outlined" size="small" />
                  ))}
                </Box>
              </Box>
            )}
            {sponsorship.games && sponsorship.games.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Sponsored Games
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sponsorship.games.map((game, index) => (
                    <Chip key={index} label={game} variant="outlined" size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      {sponsorship.rewardType === 'physicalGift' && sponsorship.nonCashSponsorshipStatus === 'pending' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Admin Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleComplete}
                startIcon={<i className="ri-check-line" />}
                component='label'
              >
                Complete Sponsorship
              </Button>
              <Button
                variant="contained"
                color="error"
                component='label'
                onClick={() => setRejectDialogOpen(true)}
                startIcon={<i className="ri-close-line" />}
              >
                Reject Sponsorship
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog maxWidth={'sm'} fullWidth open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Sponsorship</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a reason for rejecting this sponsorship.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error">Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SponsorshipDetailPage 