import React, { useState, useEffect } from 'react'
import { Button, Dialog, DialogContent, DialogTitle, Typography, Grid, Box, Alert } from '@mui/material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import OtpForm from '@/views/pages/auth/register-multi-steps/OTPForm'
import { toast } from 'react-toastify'

const PhoneVerification = ({ phoneValid, phoneInput, country, onChange, setIsPhoneVerified, dbPhone }) => {
  const { data: session } = useSession()
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
    <Grid container spacing={2} alignItems='center' justifyContent='center'>
      <Grid item xs={12} sm={9}>
        <PhoneInput
          countryCodeEditable={false}
          inputStyle={{ width: '100%', height: '3rem' }}
          enableSearch={true}
          country={country}
          value={phoneInput}
          onChange={onChange}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <Button
          variant='contained'
          component={'label'}
          size='small'
          style={{ color: 'white' }}
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
        >
          {verifyOtpStatus === 'success'
            ? 'Verified!'
            : sendOtpStatus === 'loading'
              ? 'Sending...'
              : sendOtpStatus === 'success'
                ? 'Sent'
                : 'Verify'}
        </Button>
      </Grid>

      {/* Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth='xs'>
        <DialogTitle>Verify Your Phone</DialogTitle>
        <DialogContent>
          <Typography>We have sent an OTP to your phone number. Enter the OTP below to verify.</Typography>
          <Box mt={2} mb={2} className='flex justify-center'>
            <OtpForm otpValue={otpValue} setOtpValue={setOtpValue} setIsDirty={() => {}} />
          </Box>
          {errorMessage && (
            <Grid item xs={12} mb={2}>
              <Alert icon={false} severity='error'>
                {errorMessage}
              </Alert>
            </Grid>
          )}
          <Grid container justifyContent='space-between'>
            <Button
              component='label'
              style={{ color: 'white' }}
              size='small'
              variant='contained'
              disabled={otpValue.length !== 6 || verifyOtpStatus === 'loading'}
              onClick={handleVerifyPhoneOtp}
              color={verifyOtpStatus === 'loading' ? 'warning' : verifyOtpStatus === 'success' ? 'success' : 'primary'}
            >
              {verifyOtpStatus === 'loading' ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button
              size='small'
              variant='outlined'
              disabled={!resendEnabled || resendOtpStatus === 'loading'}
              onClick={resendOtp}
            >
              Resend OTP {timer > 0 && `(${timer}s)`}
            </Button>
          </Grid>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

export default PhoneVerification
