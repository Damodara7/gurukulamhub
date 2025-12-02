import React, { useState, useEffect } from 'react'
import { Button, Dialog, DialogContent, DialogTitle, Typography, Grid, Box, Alert, useTheme, alpha, useMediaQuery, CircularProgress } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import OtpForm from '@/views/pages/auth/register-multi-steps/OTPForm'
import { toast } from 'react-toastify'

const PhoneVerification = ({ phoneValid, phoneInput, country, onChange, setIsPhoneVerified, dbPhone }) => {
  const { data: session } = useSession()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [openModal, setOpenModal] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [timer, setTimer] = useState(60)
  const [resendEnabled, setResendEnabled] = useState(false)

  const [sendOtpStatus, setSendOtpStatus] = useState('idle') // idle | loading | success | verified | error
  const [verifyOtpStatus, setVerifyOtpStatus] = useState('idle') // idle | loading | success | error
  const [resendOtpStatus, setResendOtpStatus] = useState('idle') // idle | loading | success | error

  const [errorMessage, setErrorMessage] = useState('')

  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => {
    setOpenModal(false)
    setOtpValue('')
    setTimer(60)
    setResendEnabled(false)
    setSendOtpStatus('idle')
    setResendOtpStatus('idle')
    setErrorMessage('')
  }

  const resendOtp = async () => {
    try {
      setTimer(60)
      setResendEnabled(false)
      setResendOtpStatus('loading')
      setErrorMessage('')
      setOtpValue('')
      await RestApi.post(API_URLS.v0.USERS_SEND_PHONE_OTP, {
        email: session?.user?.email,
        name: session?.user?.name || 'GurukulamHub User',
        countryDialCode: country,
        phone: phoneInput
      })
      setResendOtpStatus('success')
    } catch (error) {
      console.error('Error resending OTP:', error)
      setResendOtpStatus('error')
      setErrorMessage('Failed to resend OTP. Please try again.')
    }
  }

  useEffect(() => {
    setSendOtpStatus('idle')
    setVerifyOtpStatus('idle')
  }, [phoneInput])

  useEffect(() => {
    console.log({ phoneValid, phoneInput, dbPhone })
    if (phoneValid && phoneInput === dbPhone) {
      setVerifyOtpStatus('success')
    }
  }, [phoneValid, phoneInput, dbPhone])

  useEffect(() => {
    if (verifyOtpStatus === 'success') {
      setIsPhoneVerified(true)
    } else {
      setIsPhoneVerified(false)
    }
  }, [verifyOtpStatus])

  useEffect(() => {
    setErrorMessage('')
  }, [otpValue])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000)
    } else {
      setResendEnabled(true)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSendPhoneOtp = async () => {
    try {
      setSendOtpStatus('loading')
      setErrorMessage('')
      await RestApi.post(API_URLS.v0.USERS_SEND_PHONE_OTP, {
        email: session?.user?.email,
        name: session?.user?.name || ' User',
        countryDialCode: country,
        phone: phoneInput
      })
      setSendOtpStatus('success')
      handleOpenModal()
    } catch (error) {
      console.error('Error sending OTP:', error)
      setSendOtpStatus('error')
      setErrorMessage('Failed to send OTP. Please check your phone number and try again.')
    }
  }

  const handleVerifyPhoneOtp = async () => {
    try {
      setVerifyOtpStatus('loading')
      setErrorMessage('')
      const result = await RestApi.post(API_URLS.v0.USERS_VERIFY_PHONE_OTP, {
        email: session?.user?.email,
        phone: phoneInput,
        otp: otpValue,
        action: 'verifyPhoneOtp'
      })
      if (result.status === 'success') {
        setVerifyOtpStatus('success')
        // console.log('OTP verified successfully')
        toast.success('Phone number is verified.')
        handleCloseModal()
      } else {
        setSendOtpStatus('idle')
        setVerifyOtpStatus('idle')
        throw new Error('Invalid otp!')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setVerifyOtpStatus('error')
      setErrorMessage('Invalid OTP. Please try again.')
    }
  }

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems='center' justifyContent='center'>
      <Grid item xs={12} sm={9}>
        <Box
          sx={{
            '& .react-tel-input': {
              '& .flag-dropdown': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.6)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
                borderRadius: '4px 0 0 4px',
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.grey[50], 0.8)
                }
              },
              '& .selected-flag': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.6)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.grey[50], 0.8)
                },
                '& .arrow': {
                  borderTopColor: isDarkMode ? theme.palette.common.white : theme.palette.text.primary
                }
              },
              '& .form-control': {
                width: '100%',
                height: { xs: '2.75rem', sm: '3rem' },
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.4)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
                color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                },
                '&::placeholder': {
                  color: isDarkMode ? alpha(theme.palette.common.white, 0.5) : theme.palette.text.secondary
                }
              },
              '& .country-list': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.95)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
                boxShadow: isDarkMode
                  ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
                  : '0 4px 20px rgba(0,0,0,0.1)',
                '& .country': {
                  color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.08)
                  },
                  '&.highlight': {
                    backgroundColor: isDarkMode
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.15)
                  }
                },
                '& .search-box': {
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.6)
                    : 'white',
                  border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
                  color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary
                }
              }
            }
          }}
        >
          <PhoneInput
            countryCodeEditable={false}
            inputStyle={{
              width: '100%',
              height: isMobile ? '2.75rem' : '3rem',
              backgroundColor: isDarkMode
                ? alpha(theme.palette.background.paper, 0.4)
                : 'white',
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
              color: isDarkMode ? theme.palette.common.white : theme.palette.text.primary,
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
            enableSearch={true}
            country={country}
            value={phoneInput}
            onChange={onChange}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Button
          variant='contained'
          component={'label'}
          fullWidth={isMobile}
          onClick={handleSendPhoneOtp}
          disabled={!phoneValid || sendOtpStatus === 'loading' || verifyOtpStatus === 'success'}
          color={
            verifyOtpStatus === 'success'
              ? 'success'
              : sendOtpStatus === 'loading'
                ? 'warning'
                : sendOtpStatus === 'success'
                  ? 'info'
                  : 'primary'
          }
          sx={{
            color: 'white',
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 },
            boxShadow: isDarkMode && verifyOtpStatus !== 'success'
              ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              : undefined,
            '&:hover': {
              boxShadow: isDarkMode && verifyOtpStatus !== 'success'
                ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                : undefined
            },
            '&:disabled': {
              opacity: 0.6
            }
          }}
        >
          {sendOtpStatus === 'loading' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} sx={{ color: 'white' }} />
              Sending...
            </Box>
          ) : verifyOtpStatus === 'success' ? (
            'Verified!'
          ) : sendOtpStatus === 'success' ? (
            'Sent'
          ) : (
            'Verify'
          )}
        </Button>
      </Grid>

      {/* Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.95) : 'white',
            borderRadius: { xs: 2, sm: 3 },
            width: { xs: '90%', sm: '100%' }
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            color: isDarkMode ? theme.palette.common.white : 'text.primary',
            fontWeight: 700,
            pb: { xs: 1.5, sm: 2 }
          }}
        >
          Verify Your Phone
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pb: { xs: 2.5, sm: 3 } }}>
          <Typography
            sx={{
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              color: 'text.secondary',
              mb: { xs: 2, sm: 2.5 },
              lineHeight: 1.6
            }}
          >
            We have sent an OTP to your phone number. Enter the OTP below to verify.
          </Typography>
          <Box
            mt={{ xs: 2, sm: 2.5 }}
            mb={{ xs: 2, sm: 2.5 }}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <OtpForm otpValue={otpValue} setOtpValue={setOtpValue} setIsDirty={() => {}} />
          </Box>
          {errorMessage && (
            <Box mb={2}>
              <Alert
                icon={false}
                severity='error'
                sx={{
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' },
                  ...(isDarkMode && {
                    bgcolor: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.light,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                  })
                }}
              >
                {errorMessage}
              </Alert>
            </Box>
          )}
          <Grid
            container
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent='space-between'
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              mt: { xs: 2, sm: 2.5 }
            }}
          >
            <Grid item xs={12} sm={6}>
              <Button
                component='label'
                fullWidth
                variant='contained'
                disabled={otpValue.length !== 6 || verifyOtpStatus === 'loading'}
                onClick={handleVerifyPhoneOtp}
                color={
                  verifyOtpStatus === 'loading' ? 'warning' : verifyOtpStatus === 'success' ? 'success' : 'primary'
                }
                sx={{
                  color: 'white',
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  boxShadow: isDarkMode && verifyOtpStatus !== 'loading'
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                    : undefined,
                  '&:hover': {
                    boxShadow: isDarkMode && verifyOtpStatus !== 'loading'
                      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                      : undefined
                  },
                  '&:disabled': {
                    opacity: 0.6
                  }
                }}
              >
                {verifyOtpStatus === 'loading' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                    Verifying...
                  </Box>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                size='small'
                variant='outlined'
                disabled={!resendEnabled || resendOtpStatus === 'loading'}
                onClick={resendOtp}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 1.5, sm: 2 },
                  whiteSpace: 'nowrap',
                  ...(isDarkMode && {
                    borderColor: alpha(theme.palette.divider, 0.3),
                    color: theme.palette.common.white,
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    },
                    '&:disabled': {
                      borderColor: alpha(theme.palette.divider, 0.15),
                      color: alpha(theme.palette.common.white, 0.4)
                    }
                  })
                }}
              >
                {resendOtpStatus === 'loading' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <CircularProgress size={14} />
                    Resending...
                  </Box>
                ) : (
                  <>Resend OTP {timer > 0 && `(${timer}s)`}</>
                )}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

export default PhoneVerification
