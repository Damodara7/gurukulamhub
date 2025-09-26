'use client'

/********** Standard imports.*********************/
import React, { useState, useRef, useTransition, useEffect } from 'react'
import {
  TextField,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Avatar,
  CircularProgress
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'
/********************************************/

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
// import { object, minLength, string, email, regex } from 'valibot'

// Component Imports
import OtpForm from '@/views/pages/auth/register-multi-steps/OTPForm'
import Logo from '@core/svg/Logo'
import Illustrations from '@components/Illustrations'
import { handleCredentialsLogin, handleSocialLogin, handleMobileLogin, signInWithMobile } from '@/actions'
import { getAccountsWithMobile, sendPhoneOtp } from '@/actions/mobile'
import LoadingDialog from '@/components/LoadingDialog'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import RecaptchaComponent from './RecaptchaComponent'
import CenterBox from '@/components/CenterBox'
import * as RestApi from '@/utils/restApiUtil'
import * as clientApi from '@/app/api/client/client.api'
import { API_URLS } from '@/configs/apiConfig'
import PasswordValidation from './pages/auth/register-multi-steps/PasswordValidation'
import * as AppCodes from '@/configs/appErrorCodes'

// const schema = object({
//   email: string([minLength(1, 'This field is required'), email('Email is invalid')]),
//   password: string([
//     minLength(1, 'This field is required'),
//     minLength(5, 'Password must be at least 5 characters long')
//   ]),
//   mobile: string([
//     minLength(1, 'Mobile number is required'),
//     regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
//   ])
// })

const initialLoadingState = {
  register: false,
  verifyEmail: false,
  resendEmailOtp: false,
  verifyPhone: false,
  resendPhoneOtp: false
}

const QuickRegistrationForm = ({ mode, toggleAuthMode }) => {
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()

  const [email, setEmail] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [emailOtpValue, setEmailOtpValue] = useState('')
  const [phoneOtpValue, setPhoneOtpValue] = useState('')
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false)
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [loading, setLoading] = useState(initialLoadingState)
  const [testingOtp, setTestingOtp] = useState(null) // State to store testing OTP

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const quizTime = '/images/illustrations/auth/quiz-time.jpg'

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(mode, quizTime, quizTime, quizTime, quizTime)

  const handleRegister = async e => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, register: true }))
    try {
      if (!email) {
        throw new Error('Email is required.')
      }
      if (!password) {
        throw new Error('Password is required.')
      }
      if (!isPasswordValid) {
        throw new Error('Password is not valid.')
      }
      if (!phone) {
        throw new Error('Mobile number is required.')
      }

      const result = await RestApi.post(API_URLS.v0.USERS_SIGNUP, {
        email,
        password,
        firstname,
        lastname,
        phone
      })
      // const result = await clientApi.addUser({
      //   email,
      //   password,
      //   firstname,
      //   lastname,
      //   phone
      // })
      // ApiResponses.handleServerResponse(result.status, result, router);
      console.log('Signup result', result)
      if (result?.status === 'error') {
        console.log('Error singup..', result.statusCode)
        if (result.statusCode === AppCodes.ERROR_USER_ALREADY_EXISTS_UNVERIFIED) {
          await resendEmailOtp()
        } else {
          setErrorMsg(AppCodes.translateError(result.message, locale))
          setSuccessMsg('')
        }
      } else if (result?.status === 'success') {
        setSuccessMsg('Confirmation email sent.')
        setErrorMsg('')
        setIsEmailOtpSent(true)
        setFormSubmitted(true)
      }
    } catch (error) {
      console.log('Credentials signin error (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setLoading(prev => ({ ...prev, register: false }))
    }
  }

  async function sendPhoneOtpToAccount() {
    try {
      const result = await sendPhoneOtp(email, phone, firstname + ' ' + lastname) // Send OTP to mobile
      if (result?.success) {
        setIsPhoneOtpSent(true)
        setSuccessMsg('OTP sent successfully.')
        setTestingOtp(result?.result?.testingOtp) // Store testing OTP from result
        console.log('OTP sent to: ', phone)
        console.log('Testing OTP: ', result?.result?.testingOtp)
        setErrorMsg('')
      } else {
        setErrorMsg('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('Failed to send OTP. Please try again.')
    }
  }

  async function resendPhoneOtp() {
    setLoading(prev => ({ ...prev, resendPhoneOtp: true }))
    await sendPhoneOtpToAccount(phone)
    setLoading(prev => ({ ...prev, resendPhoneOtp: false }))
  }

  const resendEmailOtp = async () => {
    setLoading(prev => ({ ...prev, resendEmailOtp: true }))
    const result = await RestApi.post(API_URLS.v0.USERS_SEND_EMAIL_OTP, { email, action: 'verifyEmail' })
    if (result) {
      console.log('resendOtp called. recieved result', result)
      // Check if there's a testing OTP in the response
      if (result?.result?.testingOtp) {
        setTestingOtp(result.result.testingOtp)
        console.log('Testing OTP received on resend:', result.result.testingOtp)
      }
    }
    setLoading(prev => ({ ...prev, resendEmailOtp: false }))
  }

  async function handleVerifyEmailOtp() {
    setLoading(prev => ({ ...prev, verifyEmail: true }))
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_VERIFY_EMAIL_OTP, {
        email,
        otp: emailOtpValue,
        action: 'verifyEmailOtp'
      })
      if (result?.status === 'error') {
        setErrorMsg(result.message)
        setSuccessMsg('')
      } else {
        console.log('Email verified.')
        setSuccessMsg('Email verified.')
        setIsEmailOtpSent(false)

        //Send otp to account to verify phone number
        sendPhoneOtpToAccount()
      }
    } catch (error) {
      console.error('Verification failed (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setLoading(prev => ({ ...prev, verifyEmail: false }))
    }
  }

  async function handleVerifyPhoneOtp() {
    setLoading(prev => ({ ...prev, verifyPhone: true }))
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_VERIFY_PHONE_OTP, {
        email,
        phone: phone,
        otp: phoneOtpValue,
        action: 'verifyPhoneOtp'
      })
      if (result?.status === 'error') {
        setErrorMsg(result.message)
        setSuccessMsg('')
      } else {
        console.log('Email verified.')
        setSuccessMsg('Mobile number verified. Logging in...')
        setIsPhoneOtpSent(false)

        // Login with mobile number
        signInWithMobile({ email, mobile: phone, password })
      }
    } catch (error) {
      console.error('Verification failed (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setLoading(prev => ({ ...prev, verifyPhone: false }))
    }
  }

  return (
    <>
      <form noValidate autoComplete='off' className='flex flex-col gap-3 mt-3 w-full'>
        {/* Registration Form */}
        {!formSubmitted && (
          <>
            <TextField
              name='firstname'
              value={firstname}
              disabled={loading.register}
              onChange={e => setFirstname(e.target.value)}
              fullWidth
              autoFocus
              label='First Name'
              placeholder='Enter first name'
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name='lastname'
              value={lastname}
              disabled={loading.register}
              onChange={e => setLastname(e.target.value)}
              fullWidth
              label='Last Name'
              InputLabelProps={{ shrink: true }}
              placeholder='Enter last name'
            />
            <TextField
              name='phone'
              value={phone}
              disabled={loading.register}
              onChange={e => setPhone(e.target.value)}
              fullWidth
              label='Mobile Number'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Typography variant='body1' color='textSecondary'>
                      +91
                    </Typography>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              name='email'
              fullWidth
              disabled={loading.register}
              value={email}
              onChange={e => setEmail(e.target.value)}
              label='Email'
              type='email'
              InputLabelProps={{ shrink: true }}
              placeholder='Enter email'
            />
            <PasswordValidation
              setIsPasswordValid={setIsPasswordValid}
              isPasswordValid={isPasswordValid}
              password={password}
              setPassword={setPassword}
              name={'Password'}
              size='small'
              shrink={true}
              disabled={loading.register}
            />
            <Button
              type='submit'
              component='label'
              style={{ color: 'white' }}
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleRegister}
              disabled={loading.register}
            >
              {loading.register ? <CircularProgress size={24} color='inherit' /> : 'Register'}
            </Button>
            <Typography className='text-end' color='primary' onClick={toggleAuthMode} style={{ cursor: 'pointer' }}>
              Log In?
            </Typography>
          </>
        )}

        {/* OTP Form */}
        {isEmailOtpSent && (
          <>
            <div className='flex justify-center items-center'>
              {!loading.resendEmailOtp && (
                <OtpForm otpValue={emailOtpValue} setOtpValue={setEmailOtpValue} setIsDirty={() => {}} />
              )}
              <Button color='primary' variant='text' type='button' size='small' onClick={e => resendEmailOtp()}>
                {loading.resendEmailOtp ? 'Sending...' : 'Resend'}
              </Button>
            </div>

            <Button
              type='button'
              component='label'
              disabled={loading.verifyEmail}
              style={{ color: 'white' }}
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleVerifyEmailOtp}
            >
              {loading.verifyEmail ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Testing OTP Display for Email Verification */}
            {testingOtp && (
              <div className='bg-blue-50 border border-blue-200 rounded p-3 mt-2'>
                <div className='text-center'>
                  <Typography variant='body2'>
                    <strong>Testing OTP:</strong> {testingOtp}
                  </Typography>
                </div>
              </div>
            )}
          </>
        )}
        {isPhoneOtpSent && (
          <>
            <div className='flex justify-center items-center'>
              {!loading.resendPhoneOtp && (
                <OtpForm otpValue={phoneOtpValue} setOtpValue={setPhoneOtpValue} setIsDirty={() => {}} />
              )}
              <Button color='primary' variant='text' type='button' size='small' onClick={e => resendPhoneOtp()}>
                {loading.resendPhoneOtp ? 'Sending...' : 'Resend'}
              </Button>
            </div>

            <Button
              type='button'
              component='label'
              style={{ color: 'white' }}
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleVerifyPhoneOtp}
              disabled={loading.verifyPhone}
            >
              {loading.verifyPhone ? 'Verifying...' : 'Verify Mobile & Login'}
            </Button>

            {/* Testing OTP Display for Phone Verification */}
            {testingOtp && (
              <div className='bg-blue-50 border border-blue-200 rounded p-3 mt-2'>
                <div className='text-center'>
                  <Typography variant='body2'>
                    <strong>Testing OTP:</strong> {testingOtp}
                  </Typography>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Messages */}
        {errorMsg && (
          <Alert
            sx={{ padding: '0.5rem' }}
            severity=''
            icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
            color='error'
          >
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert
            sx={{ padding: '0.5rem' }}
            severity=''
            variant='standard'
            icon={<TaskAltOutlinedIcon fontSize='inherit' />}
            color='success'
          >
            {successMsg}
          </Alert>
        )}
      </form>
    </>
  )
}

export default QuickRegistrationForm
