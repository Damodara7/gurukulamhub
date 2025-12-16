import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Box,
  Divider,
  CircularProgress,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Chip,
  useMediaQuery
} from '@mui/material'
import { Close as CloseIcon, AttachMoney, CardGiftcard, Person, Business, EmojiEvents } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const REWARD_TYPES = {
  CASH: 'cash',
  PHYSICAL_GIFT: 'physicalGift'
}

const rewardTypeOptions = [
  { value: REWARD_TYPES.CASH, label: 'Cash (INR)' },
  { value: REWARD_TYPES.PHYSICAL_GIFT, label: 'Physical Gift' }
]

const initialFormData = {
  email: '',
  fullname: '',
  sponsorshipAmount: '',
  orgName: '',
  website: '',
  orgType: '',
  mobileNumber: '',
  nonCashItem: '',
  numberOfNonCashItems: '',
  rewardValuePerItem: '',
  rewardDescription: ''
}

const GameSponsorDialog = ({ open, onClose, game, reward, maxAmount }) => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data: session } = useSession()

  // Calculate sponsorship details
  const totalNeeded =
    reward.rewardType === 'cash'
      ? reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      : reward.numberOfWinnersForThisPosition

  const alreadySponsored =
    reward.sponsors?.reduce((sum, sponsor) => sum + (sponsor.allocated || sponsor.rewardDetails?.allocated || 0), 0) ||
    0

  const requiredAmount = totalNeeded - alreadySponsored

  const [sponsorerType, setSponsorerType] = useState('individual')
  const [rewardType, setRewardType] = useState(reward.rewardType)
  const [formData, setFormData] = useState({
    ...initialFormData,
    email: session?.user?.email || '',
    sponsorshipAmount: '',
    numberOfNonCashItems: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const initialData = {
        ...initialFormData,
        email: session?.user?.email || '',
        sponsorshipAmount: '',
        numberOfNonCashItems: ''
      }

      setFormData(initialData)
      setErrors({})
      setSponsorerType('individual')
      setRewardType(reward.rewardType)
    }
  }, [open, session?.user?.email, reward.rewardType])

  const validateMobileNumber = number => {
    const regex = /^[6-9]\d{9}$/ // Indian mobile number validation
    return regex.test(number)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullname) {
      newErrors.fullname = 'Full name is required'
    }

    if (sponsorerType === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required'
      if (!formData.website) newErrors.website = 'Website is required'
      if (!formData.orgType) newErrors.orgType = 'Organization type is required'
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number'
    }

    if (rewardType === REWARD_TYPES.CASH && !formData.sponsorshipAmount) {
      newErrors.sponsorshipAmount = 'Amount is required'
    } else if (
      rewardType === REWARD_TYPES.CASH &&
      (isNaN(formData.sponsorshipAmount) || parseFloat(formData.sponsorshipAmount) <= 0)
    ) {
      newErrors.sponsorshipAmount = 'Amount must be greater than 0'
    } else if (rewardType === REWARD_TYPES.CASH && parseFloat(formData.sponsorshipAmount) > requiredAmount) {
      newErrors.sponsorshipAmount = `Amount cannot exceed remaining need of ${requiredAmount}`
    }

    if (rewardType === REWARD_TYPES.PHYSICAL_GIFT) {
      if (!formData.nonCashItem) newErrors.nonCashItem = 'Item description is required'
      if (!formData.numberOfNonCashItems) {
        newErrors.numberOfNonCashItems = 'Quantity is required'
      } else if (isNaN(formData.numberOfNonCashItems) || parseInt(formData.numberOfNonCashItems) <= 0) {
        newErrors.numberOfNonCashItems = 'Quantity must be greater than 0'
      } else if (parseInt(formData.numberOfNonCashItems) > requiredAmount) {
        newErrors.numberOfNonCashItems = `Quantity cannot exceed remaining need of ${requiredAmount}`
      }
      if (!formData.rewardValuePerItem) newErrors.rewardValuePerItem = 'Estimated value is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        accountHolderEmail: session?.user?.email,
        email: formData?.email || session?.user?.email,
        fullname: formData?.fullname,
        sponsorType: 'game',
        sponsorerType,
        mobileNumber: formData.mobileNumber,
        rewardType,
        currency: 'INR',
        gameId: game._id,
        rewardId: reward._id || reward.position,
        ...(sponsorerType === 'organization' && {
          orgName: formData?.orgName,
          website: formData?.website,
          orgType: formData?.orgType
        }),
        ...(rewardType === REWARD_TYPES.CASH && {
          sponsorshipAmount: Number(formData.sponsorshipAmount),
          availableAmount: Number(formData.sponsorshipAmount),
          sponsorshipStatus: 'created',
          sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
        }),
        ...(rewardType === REWARD_TYPES.PHYSICAL_GIFT && {
          nonCashItem: formData.nonCashItem,
          numberOfNonCashItems: Number(formData.numberOfNonCashItems),
          availableItems: Number(formData.numberOfNonCashItems),
          rewardValuePerItem: Number(formData.rewardValuePerItem),
          rewardValue: Number(formData.rewardValuePerItem) * Number(formData?.numberOfNonCashItems),
          rewardDescription: formData.rewardDescription,
          nonCashSponsorshipStatus: 'completed'
        })
      }

      console.log('Game sponsorship payload:', payload)

      const res = await RestApi.post(API_URLS.v0.GAME_SPONSORSHIP, payload)
      if (res.status === 'success') {
        // Only redirect to payment for cash rewards
        if (rewardType === REWARD_TYPES.CASH) {
          router.push(`/sponsor/game/${res.result._id}/payment`)
        } else {
          // Handle successful physical gift submission
          toast.success('Game sponsorship is successful!')
          onClose()
          // Refresh the page or update the game data
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Game sponsorship submission error:', error)
      toast.error('Failed to submit game sponsorship. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 1.5, sm: 2 },
          boxShadow: isDarkMode
            ? `0 20px 60px ${alpha(theme.palette.common.black, 0.5)}`
            : '0 20px 60px rgba(0,0,0,0.2)',
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          pb: { xs: 2, sm: 2.5, md: 3 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
          spacing={{ xs: 1.5, sm: 0 }}
        >
          <Box>
            <Typography
              variant='h5'
              fontWeight={800}
              sx={{
                color: 'text.primary',
                mb: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              Sponsor Game Reward
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
              }}
            >
              Make a difference by sponsoring this reward
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size='small'
            sx={{
              bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.grey[100], 0.8),
              color: 'text.primary',
              '&:hover': {
                bgcolor: isDarkMode
                  ? alpha(theme.palette.background.default, 0.8)
                  : alpha(theme.palette.grey[200], 0.8),
                transform: 'rotate(90deg)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
        {/* Reward Info Card */}
        <Box
          sx={{
            mb: { xs: 3, sm: 4 },
            p: { xs: 2.5, sm: 3, md: 3.5 },
            borderRadius: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.12 : 0.05),
            border: `2px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.15)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: { xs: 4, sm: 6 },
              height: '100%',
              background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${
                theme.palette.secondary?.main || theme.palette.primary.light
              })`
            }
          }}
        >
          <Stack spacing={{ xs: 2, sm: 2.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1.5, sm: 2 }}
            >
              <Box
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDarkMode
                    ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                    : '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                {reward.rewardType === 'cash' ? (
                  <AttachMoney sx={{ fontSize: { xs: 24, sm: 26 }, color: theme.palette.success.main }} />
                ) : (
                  <CardGiftcard sx={{ fontSize: { xs: 24, sm: 26 }, color: theme.palette.warning.main }} />
                )}
              </Box>
              <Box>
                <Typography
                  variant='subtitle1'
                  fontWeight={700}
                  sx={{
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                  }}
                >
                  {game.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }
                  }}
                >
                  Position {reward.position} • {reward.numberOfWinnersForThisPosition} winner
                  {reward.numberOfWinnersForThisPosition > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1.5 }} flexWrap='wrap'>
              <Chip
                icon={
                  reward.rewardType === 'cash' ? (
                    <AttachMoney sx={{ fontSize: { xs: 14, sm: 16 } }} />
                  ) : (
                    <CardGiftcard sx={{ fontSize: { xs: 14, sm: 16 } }} />
                  )
                }
                label={
                  reward.rewardType === 'cash'
                    ? `${reward.currency} ${reward.rewardValuePerWinner} per winner`
                    : reward.nonCashReward
                }
                sx={{
                  bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : 'white',
                  color: reward.rewardType === 'cash' ? theme.palette.success.main : theme.palette.warning.main,
                  fontWeight: 700,
                  border: `2px solid`,
                  borderColor:
                    reward.rewardType === 'cash'
                      ? alpha(theme.palette.success.main, isDarkMode ? 0.4 : 0.3)
                      : alpha(theme.palette.warning.main, isDarkMode ? 0.4 : 0.3),
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '& .MuiChip-icon': {
                    color: reward.rewardType === 'cash' ? theme.palette.success.main : theme.palette.warning.main
                  }
                }}
              />
              <Chip
                label={`Max: ${
                  reward.rewardType === 'cash' ? `${reward.currency} ${requiredAmount}` : `${requiredAmount} items`
                }`}
                sx={{
                  bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  border: `2px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.3)}`,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Personal Information Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Person sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant='subtitle1'
              fontWeight={700}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
              }}
            >
              Personal Information
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {/* Sponsor Type */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    ...(isDarkMode && {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.divider, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    })
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? theme.palette.text.primary : undefined
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              >
                <InputLabel>Sponsor Type *</InputLabel>
                <Select value={sponsorerType} onChange={e => setSponsorerType(e.target.value)} label='Sponsor Type *'>
                  <MenuItem value='individual'>
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Person fontSize='small' sx={{ color: theme.palette.primary.main }} />
                      <span>Individual</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value='organization'>
                    <Stack direction='row' alignItems='center' spacing={1.5}>
                      <Business fontSize='small' sx={{ color: theme.palette.primary.main }} />
                      <span>Organization</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Full Name *'
                name='fullname'
                value={formData.fullname}
                onChange={handleChange}
                error={!!errors.fullname}
                helperText={errors.fullname}
                placeholder='Enter your full name'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    ...(isDarkMode && {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.divider, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    })
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? theme.palette.text.primary : undefined
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  },
                  '& .MuiFormHelperText-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email *'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='your@email.com'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    ...(isDarkMode && {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.divider, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    })
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? theme.palette.text.primary : undefined
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mobile Number *'
                name='mobileNumber'
                value={formData.mobileNumber}
                onChange={handleChange}
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber || '10-digit Indian mobile'}
                placeholder='98XXXXXXXX'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    ...(isDarkMode && {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.divider, 0.3)
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    })
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? theme.palette.text.primary : undefined
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  },
                  '& .MuiFormHelperText-root': {
                    color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Organization Fields */}
        {sponsorerType === 'organization' && (
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: alpha(theme.palette.secondary?.main || theme.palette.primary.main, isDarkMode ? 0.2 : 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Business
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    color: theme.palette.secondary?.main || theme.palette.primary.main
                  }}
                />
              </Box>
              <Typography
                variant='subtitle1'
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                }}
              >
                Organization Details
              </Typography>
            </Stack>

            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Organization Name *'
                  name='orgName'
                  value={formData.orgName}
                  onChange={handleChange}
                  error={!!errors.orgName}
                  helperText={errors.orgName}
                  placeholder='Enter organization name'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      ...(isDarkMode && {
                        '& fieldset': {
                          borderColor: alpha(theme.palette.divider, 0.3)
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.5)
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      })
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Website *'
                  name='website'
                  value={formData.website}
                  onChange={handleChange}
                  error={!!errors.website}
                  helperText={errors.website}
                  placeholder='https://example.com'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      ...(isDarkMode && {
                        '& fieldset': {
                          borderColor: alpha(theme.palette.divider, 0.3)
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.5)
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      })
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={!!errors.orgType}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      ...(isDarkMode && {
                        '& fieldset': {
                          borderColor: alpha(theme.palette.divider, 0.3)
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.5)
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main
                        }
                      })
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }
                  }}
                >
                  <InputLabel>Organization Type *</InputLabel>
                  <Select name='orgType' value={formData.orgType} onChange={handleChange} label='Organization Type *'>
                    <MenuItem value='corporate'>Corporate</MenuItem>
                    <MenuItem value='ngo'>NGO</MenuItem>
                    <MenuItem value='educational'>Educational Institution</MenuItem>
                    <MenuItem value='government'>Government</MenuItem>
                    <MenuItem value='other'>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Sponsorship Details Section */}
        <Box>
          <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EmojiEvents sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.warning.main }} />
            </Box>
            <Typography
              variant='subtitle1'
              fontWeight={700}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
              }}
            >
              Sponsorship Details
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {/* Cash Reward Fields */}
            {rewardType === REWARD_TYPES.CASH && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Sponsorship Amount (INR) *'
                  name='sponsorshipAmount'
                  type='number'
                  value={formData.sponsorshipAmount}
                  onChange={handleChange}
                  error={!!errors.sponsorshipAmount}
                  helperText={errors.sponsorshipAmount || `You can sponsor up to ${reward.currency} ${requiredAmount}`}
                  inputProps={{ min: 1, max: requiredAmount }}
                  placeholder={`Enter amount (max: ${requiredAmount})`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                      fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' },
                      fontWeight: 600,
                      ...(isDarkMode && {
                        '& fieldset': {
                          borderColor: alpha(theme.palette.divider, 0.3)
                        },
                        '&:hover fieldset': {
                          borderColor: alpha(theme.palette.success.main, 0.5),
                          borderWidth: 2
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.success.main,
                          boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.15)}`
                        }
                      }),
                      ...(!isDarkMode && {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                            borderWidth: 2
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.success.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.15)}`
                          }
                        }
                      })
                    },
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : undefined
                    },
                    '& .MuiInputLabel-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    },
                    '& .MuiFormHelperText-root': {
                      color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Grid>
            )}

            {/* Physical Gift Fields */}
            {rewardType === REWARD_TYPES.PHYSICAL_GIFT && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Item Description *'
                    name='nonCashItem'
                    value={formData.nonCashItem}
                    onChange={handleChange}
                    error={!!errors.nonCashItem}
                    helperText={errors.nonCashItem}
                    placeholder='E.g., Laptop, Tablet, Books'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        ...(isDarkMode && {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.3)
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.warning.main, 0.5),
                            borderWidth: 2
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.warning.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.warning.main, 0.15)}`
                          }
                        }),
                        ...(!isDarkMode && {
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.warning.main,
                              borderWidth: 2
                            }
                          },
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.warning.main,
                              boxShadow: `0 0 0 3px ${alpha(theme.palette.warning.main, 0.15)}`
                            }
                          }
                        })
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? theme.palette.text.primary : undefined
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiFormHelperText-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Quantity *'
                    name='numberOfNonCashItems'
                    type='number'
                    value={formData.numberOfNonCashItems}
                    onChange={handleChange}
                    error={!!errors.numberOfNonCashItems}
                    helperText={errors.numberOfNonCashItems || `Maximum: ${requiredAmount} items`}
                    inputProps={{ min: 1, max: requiredAmount }}
                    placeholder='Number of items'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        ...(isDarkMode && {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.3)
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        })
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? theme.palette.text.primary : undefined
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiFormHelperText-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Value per Item (INR) *'
                    name='rewardValuePerItem'
                    type='number'
                    value={formData.rewardValuePerItem}
                    onChange={handleChange}
                    error={!!errors.rewardValuePerItem}
                    helperText={errors.rewardValuePerItem}
                    inputProps={{ min: 1 }}
                    placeholder='Value in INR'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        ...(isDarkMode && {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.3)
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        })
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? theme.palette.text.primary : undefined
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      },
                      '& .MuiFormHelperText-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Reward Description (Optional)'
                    name='rewardDescription'
                    value={formData.rewardDescription}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder='Additional details about the reward'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : 'white',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        ...(isDarkMode && {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.divider, 0.3)
                          },
                          '&:hover fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main
                          }
                        })
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? theme.palette.text.primary : undefined
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          pt: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.grey[50], 0.8),
          borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
          gap: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column-reverse', sm: 'row' }
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant='outlined'
          fullWidth={isMobile}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.1, sm: 1.25 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            ...(isDarkMode && {
              borderColor: alpha(theme.palette.divider, 0.3),
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
                backgroundColor: alpha(theme.palette.primary.main, 0.08)
              }
            }),
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDarkMode
                ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                : '0 2px 8px rgba(0,0,0,0.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading}
          component='label'
          fullWidth={isMobile}
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            px: { xs: 2, sm: 4 },
            py: { xs: 1.1, sm: 1.25 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDarkMode
                ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
            },
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : rewardType === REWARD_TYPES.CASH ? (
            'Proceed to Payment'
          ) : (
            'Submit Sponsorship'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameSponsorDialog
