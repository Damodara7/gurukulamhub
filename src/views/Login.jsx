'use client'

/********** Standard imports.*********************/
import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Link as MuiLink,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material'
import { TaskAltOutlined, WarningAmberOutlined, Info, ArrowBack, VisibilityOff, Visibility } from '@mui/icons-material'

import { toast } from 'react-toastify'
/********************************************/

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, regex } from 'valibot'

// Component Imports
import OtpForm from '@/views/pages/auth/register-multi-steps/OTPForm'
import Logo from '@core/svg/Logo'
import Illustrations from '@components/Illustrations'
import { handleCredentialsLogin, handleSocialLogin, handleMobileLogin } from '@/actions'
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
import { get } from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// MUI Icons
import InfoIcon from '@mui/icons-material/Info'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const schema = object({
  email: string([minLength(1, 'This field is required'), email('Email is invalid')]),
  password: string([
    minLength(1, 'This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  ]),
  mobile: string([
    minLength(1, 'Mobile number is required'),
    regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
  ])
})

const initialLoadingState = {
  login: false,
  findAccounts: false,
  accountsFetched: false,
  sendOtp: false,
  resendOtp: false,
  verifyOtp: false,
  confirmCode: false,
  resendCode: false
}

const Login = ({ mode, gamePin = null, initialSearchParams = {} }) => {
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  // States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [captchaValue, setCaptchaValue] = useState(null)
  const recaptchaRef = useRef(null)
  const [recaptchaKey, setRecaptchaKey] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginMethod, setLoginMethod] = useState('email')
  const [otpValue, setOtpValue] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [accountsWithMobile, setAccountsWithMobile] = useState([])
  const [selectedAccountWithMobile, setSelectedAccountWithMobile] = useState(null)
  const [mobileValue, setMobileValue] = useState('')
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [loading, setLoading] = useState(initialLoadingState)

  const handleLoginMethodChange = event => {
    setLoginMethod(event.target.value)
  }

  async function handleCaptchaChange(value) {
    setCaptchaValue(value)
  }

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const quizTime = '/images/illustrations/auth/quiz-time.jpg'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  const allSearchParams = {
    ...Object.fromEntries(searchParams.entries()),
    ...initialSearchParams
  }

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      mobile: ''
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // const characterIllustration = useImageVariant(
  //   mode,
  //   lightIllustration,
  //   darkIllustration,
  //   borderedLightIllustration,
  //   borderedDarkIllustration
  // )

  const characterIllustration = useImageVariant(mode, quizTime, quizTime, quizTime, quizTime)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const redirectURL = searchParams.get('redirectTo') ?? `/home`
  console.log('RedirectURL: ', redirectURL)
  console.log('locale: ', locale)
  const localizedRedirectUrl = getLocalizedUrl(redirectURL, locale)
  console.log('localizedRedirectUrl: ', localizedRedirectUrl)

  const onSubmit = async data => {
    console.log(data)
    setIsSubmitting(true)
    setLoading(prev => ({ ...prev, login: true }))
    try {
      if (!captchaValue) {
        throw new Error('CAPTCHA verification is required.')
      }
      console.log('Captcha: ', captchaValue)
      if (loginMethod === 'email') {
        if (!data.email) {
          throw new Error('Email is required!')
        }
        if (!data.email.includes('@')) {
          throw new Error('Invalid email!')
        }
        if (!data.password) {
          throw new Error('Password is required!')
        }

        const result = await handleCredentialsLogin({
          email: data.email,
          password: data.password,
          code,
          captcha: captchaValue,
          redirectUrl: localizedRedirectUrl
        })
        console.log(':LoginForm -> result:', result)
        if (result?.error) {
          console.log('Credentials signin error : ', result?.error)
          setCaptchaValue(null)
          setRecaptchaKey(Date.now())
          throw new Error(result.error)
        } else if (result?.success) {
          setSuccessMsg(result.success)
          setErrorMsg('')
          if (result?.code) {
            setShowCode(true)
            setEmail(data.email)
            setPassword(data.password)
            return
          }
          setCaptchaValue(null)
          setRecaptchaKey(Date.now())
        } else {
          console.log('Logged in with credentials successfully!')
          // const redirectURL = searchParams.get('redirectTo') ?? `${process.env.AUTH_URL}/`
          // console.log('RedirectURL: ', redirectURL)
          // console.log('locale: ', locale)
          // router.push(getLocalizedUrl(redirectURL, locale))
          router.push(gamePin ? `/game/join?gamePin=${gamePin}` : localizedRedirectUrl)
        }
      } else if (loginMethod === 'mobile') {
        console.log('otp: ', otpValue)
        console.log('Mobile: ', data.mobile)
        if (!data.mobile) {
          throw new Error('Mobile number is required!')
        }
        if (!/^\d{10}$/.test(data.mobile)) {
          throw new Error('Invalid mobile number!')
        }
        if (!otpValue) {
          throw new Error('Otp is required!')
        }
        if (!/^\d{6}$/.test(otpValue)) {
          throw new Error('Invalid OTP! OTP should be 6 digits.')
        }
        console.log('Otp value: ' + otpValue)
        console.log('mobile value: ' + data.mobile)
        const result = await handleMobileLogin({
          email: selectedAccountWithMobile.email,
          mobile: data.mobile,
          otp: otpValue,
          captcha: captchaValue,
          redirectUrl: localizedRedirectUrl
        })
        console.log(':LoginForm -> result:', result)
        if (result?.error) {
          console.log('Social signin error : ', result?.error)
          setCaptchaValue(null)
          setRecaptchaKey(Date.now())
          throw new Error(result.error)
        } else if (result?.success) {
          setSuccessMsg(result.success)
          setOtpVerified(true)
          setErrorMsg('')
        } else {
          console.log('Logged in with mobile successfully!')
          router.push(gamePin ? `/game/join?gamePin=${gamePin}` : localizedRedirectUrl)
        }
      }
    } catch (error) {
      console.log('Credentials signin error (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setIsSubmitting(false)
      setLoading(prev => ({ ...prev, login: false }))
    }
  }

  const onSubmitWithCode = async () => {
    setLoading(prev => ({ ...prev, confirmCode: true }))
    try {
      if (!code) {
        throw new Error('Code is required.')
      }

      if (code.length !== 6) {
        throw new Error('Invalid code! It should be exactly 6 digits.')
      }

      // Check if all characters in the code are digits
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Invalid code! All characters must be digits.')
      }

      console.log('Captcha: ', captchaValue)
      const result = await handleCredentialsLogin({
        email,
        password,
        code,
        captcha: captchaValue,
        redirectUrl: localizedRedirectUrl
      })
      console.log(':LoginForm -> result:', result)
      if (result?.error) {
        console.log('Credentials signin error : ', result?.error)
        throw new Error(result.error)
      } else if (result?.success) {
        if (result?.code) {
          setShowCode(true)
        }
        setSuccessMsg(result.success)
        setErrorMsg('')
      } else {
        console.log('Logged in with credentials successfully!')
        router.push(gamePin ? `/game/join?gamePin=${gamePin}` : localizedRedirectUrl)
      }
    } catch (error) {
      console.log('Credentials signin error (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setLoading(prev => ({ ...prev, confirmCode: false }))
    }
  }

  const handleResendCode = async () => {
    setLoading(prev => ({ ...prev, resendCode: true }))
    setCode('')
    try {
      console.log('Captcha: ', captchaValue)
      const result = await handleCredentialsLogin({
        email,
        password,
        code: null,
        captcha: captchaValue,
        redirectUrl: localizedRedirectUrl
      })
      console.log(':handleResendCode -> result:', result)
      if (result?.error) {
        console.log('handleResendCode error : ', result?.error)
        throw new Error(result.error)
      } else if (result?.success) {
        setSuccessMsg(result.success)
        setErrorMsg('')
        if (result?.code) {
          setShowCode(true)
          return
        }
      }
    } catch (error) {
      console.log('handleResendCode error (Catch block)(Something went wrong): ', error)
      setErrorMsg(error.message)
      setSuccessMsg('')
    } finally {
      setLoading(prev => ({ ...prev, resendCode: false }))
    }
  }

  async function onSocialLogin(formData) {
    const action = formData.get('action')
    console.log(action)
    try {
      await handleSocialLogin(formData)
      // router.push(gamePin ? `/game/join?gamePin=${gamePin}` : localizedRedirectUrl)
      // if (result?.error) {
      //   console.log('Social signin error : ', result?.error)
      //   throw new Error(result.error)
      // } else {
      //   console.log('Logged in with social successfully!')
      // }
    } catch (error) {
      console.log('error on social login (Catch block): ', error)
      // toast.error(error.message)
    }
  }

  async function findAccountsWithMobile(mobileValue) {
    try {
      setLoading(prev => ({ ...prev, findAccounts: true }))
      setLoading(prev => ({ ...prev, accountsFetched: false }))
      if (mobileValue && /^\d{10}$/.test(mobileValue)) {
        setMobileValue(mobileValue)
        setOtpSent(false)
        setSuccessMsg('')
        setAccountsWithMobile([])
        setOtpValue('')
        const result = await getAccountsWithMobile(mobileValue)
        if (result?.status === 'success') {
          setAccountsWithMobile(result?.result)
          setErrorMsg('')
        } else {
          setErrorMsg('No account found with this mobile number.')
          setAccountsWithMobile([])
        }
      } else {
        setErrorMsg('Please enter a valid mobile number.')
        setAccountsWithMobile([])
      }
    } catch (error) {
      console.error(error)
      setErrorMsg(error?.message || 'Failed to fetch accounts. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, findAccounts: false }))
      setLoading(prev => ({ ...prev, accountsFetched: true }))
    }
  }

  async function sendPhoneOtpToAccount(mobileValue) {
    try {
      if (mobileValue) {
        setLoading(prev => ({ ...prev, sendOtp: true }))
        const result = await sendPhoneOtp(
          selectedAccountWithMobile.email,
          mobileValue,
          selectedAccountWithMobile.firstname + ' ' + selectedAccountWithMobile.lastname
        ) // Send OTP to mobile
        if (result?.success) {
          setOtpSent(true)
          setSuccessMsg('OTP sent successfully.')
          console.log('OTP sent to: ', mobileValue)
          setErrorMsg('')
        } else {
          setErrorMsg('Failed to send OTP. Please try again.')
        }
      } else {
        setErrorMsg('Please enter a valid mobile number.')
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('Failed to send OTP. Please try again.')
    } finally {
      setIsSendingOtp(false)
      setLoading(prev => ({ ...prev, sendOtp: false }))
    }
  }

  async function handleResendPhoneOtp(mobileValue) {
    setOtpSent(false)
    setOtpValue('')
    setSuccessMsg('')
    setErrorMsg('')
    setLoading(prev => ({ ...prev, resendOtp: true }))
    await sendPhoneOtpToAccount(mobileValue)
    setLoading(prev => ({ ...prev, resendOtp: false }))
  }

  useEffect(() => {
    setSuccessMsg('')
    setErrorMsg('')
    setOtpSent(false)
    setOtpValue('')
    setAccountsWithMobile([])
    setSelectedAccountWithMobile(null)
    setLoading(initialLoadingState)
  }, [loginMethod])

  const watchedEmail = watch('email')
  const watchedMobile = watch('mobile')

  return (
    <div className='flex h-screen'>
      {/* Illustration side - hidden on mobile */}
      <div className='hidden md:flex items-center justify-center flex-1 p-6 overflow-hidden'>
        <div className='p-6'>
          <img src={characterIllustration} alt='character-illustration' className='max-h-[500px] w-auto' />
        </div>
      </div>

      {/* Form side */}
      <div className='flex flex-col justify-center items-center w-full md:w-[480px]  p-6 bg-backgroundPaper overflow-auto'>
        <div className='flex flex-col justify-center items-center w-full max-w-[400px]'>
          <div className='flex justify-center text-center w-full flex-col items-center pt-20'>
            <Link href='/'>
              <Logo className='text-primary' height={98} width={95} />
            </Link>
            <Typography variant='h4' className='font-semibold tracking-[0.15px] mt-0'>
              {gamePin
                ? `Login to ${themeConfig.templateName} to join the game!`
                : `Welcome to ${themeConfig.templateName}!`}
            </Typography>
          </div>

          {!showCode && (
            <>
              <div className='flex flex-col justify-center items-center w-full  mt-2 mb-4'>
                <Typography>Explore Indian Knowledge Systems</Typography>
                <form action={onSocialLogin}>
                  <Button
                    color='secondary'
                    className='self-center text-primary'
                    startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
                    sx={{ '& .MuiButton-startIcon': { marginInlineEnd: 3 } }}
                    type='submit'
                    value='google'
                    name='action'
                  >
                    Sign in with Google
                  </Button>
                </form>
              </div>
              <Divider className='gap-3 w-full mb-4'>or</Divider>
            </>
          )}

          {/* Login Method Selection */}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 w-full mb-4'>
            <FormLabel component='legend'>Login Using</FormLabel>
            <RadioGroup row value={loginMethod} onChange={handleLoginMethodChange}>
              <FormControlLabel value='email' control={<Radio />} label='Email' />
              <FormControlLabel value='mobile' control={<Radio />} label='Mobile (India Only)' />
            </RadioGroup>
          </div>

          {!showCode ? (
            <form
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-3 w-full'
            >
              {loginMethod === 'email' && (
                <>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        autoFocus
                        type='email'
                        label='Email'
                        onChange={e => {
                          setSuccessMsg('')
                          setErrorMsg('')
                          field.onChange(e)
                          errorState !== null && setErrorState(null)
                        }}
                        {...((errors.email || errorState !== null) && {
                          error: true,
                          helperText: errors?.email?.message || errorState?.message[0]
                        })}
                      />
                    )}
                  />
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Password'
                        type={isPasswordShown ? 'text' : 'password'}
                        onChange={e => {
                          setSuccessMsg('')
                          setErrorMsg('')
                          field.onChange(e)
                          errorState !== null && setErrorState(null)
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButtonTooltip
                                title={isPasswordShown ? 'Hide' : 'Show'}
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                              >
                                <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButtonTooltip>
                            </InputAdornment>
                          )
                        }}
                        {...(errors.password && { error: true, helperText: errors.password.message })}
                      />
                    )}
                  />
                </>
              )}

              {loginMethod === 'mobile' && (
                <>
                  <Controller
                    name='mobile'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        autoFocus
                        label='Mobile Number'
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            e.stopPropagation()
                            findAccountsWithMobile(field.value)
                          }
                        }}
                        onChange={e => {
                          field.onChange(e.target.value)
                          setOtpSent(false)
                          setOtpValue('')
                          setErrorMsg('')
                          setLoading(prev => ({ ...prev, accountsFetched: false }))
                          setAccountsWithMobile([])
                          setSelectedAccountWithMobile(null)
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Typography variant='body1' color='textSecondary'>
                                +91
                              </Typography>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <Button
                                onClick={e => {
                                  e.stopPropagation()
                                  findAccountsWithMobile(field.value)
                                }}
                                disabled={!field.value || field.value.trim().length !== 10 || loading.findAccounts}
                                color='primary'
                                type='button'
                                variant='contained'
                                size='small'
                              >
                                {loading.findAccounts ? 'Finding...' : 'Find Account'}
                              </Button>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />

                  {accountsWithMobile.length > 0 ? (
                    <>
                      <Typography color='primary'>
                        Please select one of the email address account associated with this phone number.
                      </Typography>
                      <div className='overflow-y-auto p-1 bg-[rgba(0,0,0,0.025)] rounded'>
                        {accountsWithMobile.map(account => (
                          <div
                            key={account?.email}
                            className={`flex items-center p-2 border rounded transition ${
                              selectedAccountWithMobile === account
                                ? 'bg-blue-200 shadow-md'
                                : !otpSent && 'hover:bg-gray-200'
                            }`}
                            style={{ cursor: !otpSent ? 'pointer' : 'not-allowed' }}
                            onClick={!otpSent ? () => setSelectedAccountWithMobile(account) : () => {}}
                          >
                            <Avatar>{account?.firstname?.charAt(0)}</Avatar>
                            <div className='ml-3'>
                              <Typography variant='caption' className='text-blue-800 font-medium'>
                                {account?.email}
                              </Typography>
                              <Typography variant='body2' className='text-gray-700'>
                                {account?.firstname} {account?.lastname}
                              </Typography>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    loading.accountsFetched && (
                      <div className='p-1 bg-[rgba(0,0,0,0.05)] rounded flex items-center justify-center gap-1'>
                        <Typography>No account found.</Typography>
                        <Typography
                          component={Link}
                          href={gamePin ? `/auth/register?gamePin=${gamePin}` : `/auth/register`}
                          color='primary'
                        >
                          Register?
                        </Typography>
                      </div>
                    )
                  )}

                  {!otpSent && selectedAccountWithMobile && (
                    <Button
                      disabled={loading.sendOtp}
                      color='primary'
                      variant='contained'
                      type='button'
                      fullWidth
                      onClick={() => sendPhoneOtpToAccount(selectedAccountWithMobile.phone)}
                    >
                      {loading.sendOtp ? 'Sending...' : `Send OTP`}
                    </Button>
                  )}

                  {otpSent && (
                    <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
                      {loading.resendOtp ? (
                        <CircularProgress />
                      ) : (
                        <OtpForm otpValue={otpValue} setOtpValue={setOtpValue} setIsDirty={() => {}} />
                      )}
                      <Button
                        color='primary'
                        disabled={loading.resendOtp}
                        variant='text'
                        type='button'
                        size='small'
                        onClick={() => handleResendPhoneOtp(selectedAccountWithMobile.phone)}
                      >
                        Resend
                      </Button>
                    </div>
                  )}
                </>
              )}

              {errorMsg && (
                <Alert severity='error' icon={<WarningAmberOutlinedIcon />} className='p-2'>
                  {errorMsg}
                </Alert>
              )}

              {successMsg && (
                <Alert severity='success' icon={<TaskAltOutlinedIcon />} className='p-2'>
                  {successMsg}
                </Alert>
              )}

              {((otpSent && loginMethod === 'mobile') || loginMethod === 'email') && (
                <>
                  <div className='flex justify-center'>
                    <RecaptchaComponent
                      key={recaptchaKey}
                      recaptchaRef={recaptchaRef}
                      handleCaptchaChange={handleCaptchaChange}
                    />
                  </div>

                  <Button disabled={isSubmitting} fullWidth variant='contained' type='submit' className='mt-2'>
                    {loginMethod === 'mobile' ? 'Verify & Log In' : 'Log In'}
                  </Button>
                </>
              )}

              <div className='flex justify-between items-center flex-wrap gap-2 mt-2'>
                <Typography
                  color='primary'
                  component={Link}
                  href={
                    loginMethod === 'email' && watchedEmail
                      ? `/forgot-password?email=${watchedEmail}`
                      : loginMethod === 'mobile' && watchedMobile
                        ? `/forgot-password?mobile=${watchedMobile}`
                        : '/forgot-password'
                  }
                >
                  Forgot password?
                </Typography>
                <Typography
                  component={Link}
                  href={
                    Object.keys(allSearchParams).length > 0
                      ? `/auth/register?${new URLSearchParams(allSearchParams).toString()}`
                      : '/auth/register'
                  }
                  color='primary'
                >
                  Register?
                </Typography>
              </div>
            </form>
          ) : (
            <form
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmitWithCode)}
              className='flex flex-col gap-4 w-full'
            >
              <div className='flex flex-col sm:flex-row justify-center items-center gap-2'>
                {loading.resendCode ? (
                  <CircularProgress />
                ) : (
                  <OtpForm otpValue={code} setOtpValue={setCode} setIsDirty={() => {}} />
                )}
                <Button
                  color='primary'
                  disabled={loading.resendCode}
                  variant='text'
                  type='button'
                  size='small'
                  onClick={handleResendCode}
                >
                  {loading.resendCode ? 'Sending...' : 'Resend'}
                </Button>
              </div>

              {errorMsg && (
                <Alert severity='error' icon={<WarningAmberOutlinedIcon />} className='p-2'>
                  {errorMsg}
                </Alert>
              )}

              {successMsg && (
                <Alert severity='success' icon={<TaskAltOutlinedIcon />} className='p-2'>
                  {successMsg}
                </Alert>
              )}

              <Button
                disabled={!code || loading.confirmCode || loading.resendCode}
                fullWidth
                variant='contained'
                type='submit'
              >
                {loading.confirmCode ? <CircularProgress color='inherit' size={24} /> : 'Confirm'}
              </Button>
            </form>
          )}

          <div className='flex justify-between items-center flex-wrap gap-4 mt-8 w-full'>
            <Link className='flex items-center gap-1 underline' href='/termsofservice'>
              <InfoIcon color='primary' />
              <Typography>Terms of Service</Typography>
            </Link>
            <Link className='flex items-center gap-1 underline' href='/privacypolicy'>
              <InfoIcon color='primary' />
              <Typography>Privacy Policy</Typography>
            </Link>
          </div>
        </div>
      </div>
      {isSubmitting && <LoadingDialog open={isSubmitting} />}
    </div>
    // this is the code by using the mui 
    // <Box sx={{ display: 'flex', height: '100vh' }}>
    //   {/* Illustration side - hidden on mobile */}
    //   <Box
    //     sx={{
    //       display: { xs: 'none', md: 'flex' },
    //       alignItems: 'center',
    //       justifyContent: 'center',
    //       flex: 1,
    //       p: 6,
    //       overflow: 'hidden'
    //     }}
    //   >
    //     <Box
    //       component='img'
    //       src={characterIllustration}
    //       alt='character-illustration'
    //       sx={{ maxHeight: 500, width: 'auto' }}
    //     />
    //   </Box>

    //   {/* Form side */}
    //   <Container
    //     maxWidth='sm'
    //     sx={{
    //       display: 'flex',
    //       flexDirection: 'column',
    //       justifyContent: 'center',
    //       p: 6,
    //       bgcolor: 'background.paper',
    //       overflow: 'auto'
    //     }}
    //   >
    //     <Box
    //       sx={{
    //         display: 'flex',
    //         flexDirection: 'column',
    //         alignItems: 'center',
    //         width: '100%',
    //         maxWidth: 400,
    //         mx: 'auto'
    //       }}
    //     >
    //       {/* Logo and Title */}
    //       <Box
    //         sx={{
    //           display: 'flex',
    //           flexDirection: 'column',
    //           alignItems: 'center',
    //           textAlign: 'center',
    //           width: '100%',
    //           pt: 10,
    //           pb: 4
    //         }}
    //       >
    //         <Link href='/' passHref>
    //           <MuiLink>
    //             <Logo className='text-primary' height={98} width={95} />
    //           </MuiLink>
    //         </Link>
    //         <Typography variant='h4' sx={{ fontWeight: 600, letterSpacing: 0.15, mt: 1 }}>
    //           {gamePin
    //             ? `Login to ${themeConfig.templateName} to join the game!`
    //             : `Welcome to ${themeConfig.templateName}!`}
    //         </Typography>
    //       </Box>

    //       {!showCode && (
    //         <>
    //           <Box
    //             sx={{
    //               display: 'flex',
    //               flexDirection: 'column',
    //               alignItems: 'center',
    //               width: '100%',
    //               my: 2
    //             }}
    //           >
    //             <Typography>Explore Indian Knowledge Systems</Typography>
    //             <form action={onSocialLogin}>
    //               <Button
    //                 color='secondary'
    //                 sx={{
    //                   alignSelf: 'center',
    //                   color: 'primary.main',
    //                   '& .MuiButton-startIcon': { mr: 3 }
    //                 }}
    //                 startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
    //                 type='submit'
    //                 value='google'
    //                 name='action'
    //               >
    //                 Sign in with Google
    //               </Button>
    //             </form>
    //           </Box>
    //           <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
    //         </>
    //       )}

    //       {/* Login Method Selection */}
    //       <FormControl component='fieldset' sx={{ width: '100%', mb: 3 }}>
    //         <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
    //           <FormLabel component='legend'>Login Using</FormLabel>
    //           <RadioGroup row value={loginMethod} onChange={handleLoginMethodChange}>
    //             <FormControlLabel value='email' control={<Radio />} label='Email' />
    //             <FormControlLabel value='mobile' control={<Radio />} label='Mobile (India Only)' />
    //           </RadioGroup>
    //         </Box>
    //       </FormControl>

    //       {!showCode ? (
    //         <Box
    //           component='form'
    //           noValidate
    //           autoComplete='off'
    //           onSubmit={handleSubmit(onSubmit)}
    //           sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    //         >
    //           {loginMethod === 'email' && (
    //             <>
    //               <Controller
    //                 name='email'
    //                 control={control}
    //                 render={({ field }) => (
    //                   <TextField
    //                     {...field}
    //                     fullWidth
    //                     autoFocus
    //                     type='email'
    //                     label='Email'
    //                     error={!!errors.email || !!errorState}
    //                     helperText={errors?.email?.message || errorState?.message[0]}
    //                     onChange={e => {
    //                       setSuccessMsg('')
    //                       setErrorMsg('')
    //                       field.onChange(e)
    //                       errorState !== null && setErrorState(null)
    //                     }}
    //                   />
    //                 )}
    //               />
    //               <Controller
    //                 name='password'
    //                 control={control}
    //                 render={({ field }) => (
    //                   <TextField
    //                     {...field}
    //                     fullWidth
    //                     label='Password'
    //                     type={isPasswordShown ? 'text' : 'password'}
    //                     error={!!errors.password}
    //                     helperText={errors?.password?.message}
    //                     onChange={e => {
    //                       setSuccessMsg('')
    //                       setErrorMsg('')
    //                       field.onChange(e)
    //                       errorState !== null && setErrorState(null)
    //                     }}
    //                     InputProps={{
    //                       endAdornment: (
    //                         <InputAdornment position='end'>
    //                           <IconButton
    //                             onClick={handleClickShowPassword}
    //                             onMouseDown={e => e.preventDefault()}
    //                             edge='end'
    //                           >
    //                             {isPasswordShown ? <VisibilityOff /> : <Visibility />}
    //                           </IconButton>
    //                         </InputAdornment>
    //                       )
    //                     }}
    //                   />
    //                 )}
    //               />
    //             </>
    //           )}

    //           {loginMethod === 'mobile' && (
    //             <>
    //               <Controller
    //                 name='mobile'
    //                 control={control}
    //                 render={({ field }) => (
    //                   <TextField
    //                     {...field}
    //                     fullWidth
    //                     autoFocus
    //                     label='Mobile Number'
    //                     error={!!errors.mobile}
    //                     helperText={errors?.mobile?.message}
    //                     onKeyDown={e => {
    //                       if (e.key === 'Enter') {
    //                         e.preventDefault()
    //                         e.stopPropagation()
    //                         findAccountsWithMobile(field.value)
    //                       }
    //                     }}
    //                     onChange={e => {
    //                       field.onChange(e.target.value)
    //                       setOtpSent(false)
    //                       setOtpValue('')
    //                       setErrorMsg('')
    //                       setLoading(prev => ({ ...prev, accountsFetched: false }))
    //                       setAccountsWithMobile([])
    //                       setSelectedAccountWithMobile(null)
    //                     }}
    //                     InputProps={{
    //                       startAdornment: (
    //                         <InputAdornment position='start'>
    //                           <Typography variant='body1' color='text.secondary'>
    //                             +91
    //                           </Typography>
    //                         </InputAdornment>
    //                       ),
    //                       endAdornment: (
    //                         <InputAdornment position='end'>
    //                           <Button
    //                             onClick={e => {
    //                               e.stopPropagation()
    //                               findAccountsWithMobile(field.value)
    //                             }}
    //                             disabled={!field.value || field.value.trim().length !== 10 || loading.findAccounts}
    //                             color='primary'
    //                             variant='contained'
    //                             size='small'
    //                           >
    //                             {loading.findAccounts ? 'Finding...' : 'Find Account'}
    //                           </Button>
    //                         </InputAdornment>
    //                       )
    //                     }}
    //                   />
    //                 )}
    //               />

    //               {accountsWithMobile.length > 0 ? (
    //                 <>
    //                   <Typography color='primary'>
    //                     Please select one of the email address account associated with this phone number.
    //                   </Typography>
    //                   <Box sx={{ overflowY: 'auto', p: 0.5, bgcolor: 'rgba(0,0,0,0.025)', borderRadius: 1 }}>
    //                     {accountsWithMobile.map(account => (
    //                       <Paper
    //                         key={account?.email}
    //                         elevation={0}
    //                         sx={{
    //                           display: 'flex',
    //                           alignItems: 'center',
    //                           p: 2,
    //                           mb: 1,
    //                           border: 1,
    //                           borderColor: 'divider',
    //                           borderRadius: 1,
    //                           transition: 'all 0.3s ease',
    //                           bgcolor: selectedAccountWithMobile === account ? 'primary.light' : 'background.paper',
    //                           '&:hover': !otpSent ? { bgcolor: 'action.hover' } : {},
    //                           cursor: !otpSent ? 'pointer' : 'default'
    //                         }}
    //                         onClick={!otpSent ? () => setSelectedAccountWithMobile(account) : undefined}
    //                       >
    //                         <Avatar>{account?.firstname?.charAt(0)}</Avatar>
    //                         <Box sx={{ ml: 2 }}>
    //                           <Typography variant='caption' sx={{ color: 'primary.main', fontWeight: 500 }}>
    //                             {account?.email}
    //                           </Typography>
    //                           <Typography variant='body2' color='text.secondary'>
    //                             {account?.firstname} {account?.lastname}
    //                           </Typography>
    //                         </Box>
    //                       </Paper>
    //                     ))}
    //                   </Box>
    //                 </>
    //               ) : (
    //                 loading.accountsFetched && (
    //                   <Box
    //                     sx={{
    //                       p: 0.5,
    //                       bgcolor: 'rgba(0,0,0,0.05)',
    //                       borderRadius: 1,
    //                       display: 'flex',
    //                       alignItems: 'center',
    //                       justifyContent: 'center',
    //                       gap: 1
    //                     }}
    //                   >
    //                     <Typography>No account found.</Typography>
    //                     <Link href={gamePin ? `/auth/register?gamePin=${gamePin}` : `/auth/register`} passHref>
    //                       <MuiLink color='primary'>Register?</MuiLink>
    //                     </Link>
    //                   </Box>
    //                 )
    //               )}

    //               {!otpSent && selectedAccountWithMobile && (
    //                 <Button
    //                   disabled={loading.sendOtp}
    //                   color='primary'
    //                   variant='contained'
    //                   fullWidth
    //                   onClick={() => sendPhoneOtpToAccount(selectedAccountWithMobile.phone)}
    //                 >
    //                   {loading.sendOtp ? 'Sending...' : `Send OTP`}
    //                 </Button>
    //               )}

    //               {otpSent && (
    //                 <Box
    //                   sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}
    //                 >
    //                   {loading.resendOtp ? (
    //                     <CircularProgress />
    //                   ) : (
    //                     <OtpForm otpValue={otpValue} setOtpValue={setOtpValue} setIsDirty={() => {}} />
    //                   )}
    //                   <Button
    //                     color='primary'
    //                     disabled={loading.resendOtp}
    //                     variant='text'
    //                     size='small'
    //                     onClick={() => handleResendPhoneOtp(selectedAccountWithMobile.phone)}
    //                   >
    //                     Resend
    //                   </Button>
    //                 </Box>
    //               )}
    //             </>
    //           )}

    //           {errorMsg && (
    //             <Alert severity='error' icon={<WarningAmberOutlined />} sx={{ p: 1 }}>
    //               {errorMsg}
    //             </Alert>
    //           )}

    //           {successMsg && (
    //             <Alert severity='success' icon={<TaskAltOutlined />} sx={{ p: 1 }}>
    //               {successMsg}
    //             </Alert>
    //           )}

    //           {((otpSent && loginMethod === 'mobile') || loginMethod === 'email') && (
    //             <>
    //               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    //                 <RecaptchaComponent
    //                   key={recaptchaKey}
    //                   recaptchaRef={recaptchaRef}
    //                   handleCaptchaChange={handleCaptchaChange}
    //                 />
    //               </Box>

    //               <Button disabled={isSubmitting} fullWidth variant='contained' type='submit' sx={{ mt: 2 }}>
    //                 {loginMethod === 'mobile' ? 'Verify & Log In' : 'Log In'}
    //               </Button>
    //             </>
    //           )}

    //           <Box
    //             sx={{
    //               display: 'flex',
    //               justifyContent: 'space-between',
    //               alignItems: 'center',
    //               flexWrap: 'wrap',
    //               gap: 2,
    //               mt: 2
    //             }}
    //           >
    //             <Link
    //               href={
    //                 loginMethod === 'email' && watchedEmail
    //                   ? `/forgot-password?email=${watchedEmail}`
    //                   : loginMethod === 'mobile' && watchedMobile
    //                     ? `/forgot-password?mobile=${watchedMobile}`
    //                     : '/forgot-password'
    //               }
    //               passHref
    //             >
    //               <MuiLink color='primary'>Forgot password?</MuiLink>
    //             </Link>
    //             <Link
    //               href={
    //                 Object.keys(allSearchParams).length > 0
    //                   ? `/auth/register?${new URLSearchParams(allSearchParams).toString()}`
    //                   : '/auth/register'
    //               }
    //               passHref
    //             >
    //               <MuiLink color='primary'>Register?</MuiLink>
    //             </Link>
    //           </Box>
    //         </Box>
    //       ) : (
    //         <Box
    //           component='form'
    //           noValidate
    //           autoComplete='off'
    //           onSubmit={handleSubmit(onSubmitWithCode)}
    //           sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}
    //         >
    //           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
    //             {loading.resendCode ? (
    //               <CircularProgress />
    //             ) : (
    //               <OtpForm otpValue={code} setOtpValue={setCode} setIsDirty={() => {}} />
    //             )}
    //             <Button
    //               color='primary'
    //               disabled={loading.resendCode}
    //               variant='text'
    //               size='small'
    //               onClick={handleResendCode}
    //             >
    //               {loading.resendCode ? 'Sending...' : 'Resend'}
    //             </Button>
    //           </Box>

    //           {errorMsg && (
    //             <Alert severity='error' icon={<WarningAmberOutlined />} sx={{ p: 1 }}>
    //               {errorMsg}
    //             </Alert>
    //           )}

    //           {successMsg && (
    //             <Alert severity='success' icon={<TaskAltOutlined />} sx={{ p: 1 }}>
    //               {successMsg}
    //             </Alert>
    //           )}

    //           <Button
    //             disabled={!code || loading.confirmCode || loading.resendCode}
    //             fullWidth
    //             variant='contained'
    //             type='submit'
    //           >
    //             {loading.confirmCode ? <CircularProgress color='inherit' size={24} /> : 'Confirm'}
    //           </Button>
    //         </Box>
    //       )}

    //       <Box
    //         sx={{
    //           display: 'flex',
    //           justifyContent: 'space-between',
    //           alignItems: 'center',
    //           flexWrap: 'wrap',
    //           gap: 3,
    //           mt: 4,
    //           width: '100%'
    //         }}
    //       >
    //         <Link href='/termsofservice' passHref>
    //           <MuiLink sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'underline' }}>
    //             <Info color='primary' />
    //             <Typography>Terms of Service</Typography>
    //           </MuiLink>
    //         </Link>
    //         <Link href='/privacypolicy' passHref>
    //           <MuiLink sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'underline' }}>
    //             <Info color='primary' />
    //             <Typography>Privacy Policy</Typography>
    //           </MuiLink>
    //         </Link>
    //       </Box>
    //     </Box>
    //   </Container>
    //   {isSubmitting && <LoadingDialog open={isSubmitting} />}
    // </Box>
  )
}

export default Login
