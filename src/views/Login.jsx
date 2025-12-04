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
  Paper,
  useTheme,
  alpha,
  useMediaQuery,
  Stack
} from '@mui/material'
import { TaskAltOutlined, WarningAmberOutlined, Info, ArrowBack, VisibilityOff, Visibility, WarningAmberOutlined as WarningAmberOutlinedIcon, TaskAltOutlined as TaskAltOutlinedIcon,   } from '@mui/icons-material'

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
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
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
  const [testingOtp, setTestingOtp] = useState(null) // State to store testing OTP
  const [isAccountsListExpanded, setIsAccountsListExpanded] = useState(true) // State to control accounts list visibility

  const handleCancelOtp = () => {
    setOtpSent(false)
    setOtpValue('')
    setSuccessMsg('')
    setErrorMsg('')
    setTestingOtp(null)
    setIsAccountsListExpanded(true)
  }

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
          setTestingOtp(result?.result?.testingOtp) // Store testing OTP from result
          console.log('OTP sent to: ', mobileValue)
          console.log('Testing OTP: ', result?.result?.testingOtp)
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
    setIsAccountsListExpanded(true)
    setLoading(initialLoadingState)
  }, [loginMethod])

  const watchedEmail = watch('email')
  const watchedMobile = watch('mobile')

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' }
      }}
    >
      {/* Illustration side - hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          p: { xs: 3, md: 6 },
          overflow: 'hidden',
          bgcolor: isDarkMode
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`
        }}
      >
        <Box sx={{ p: { xs: 3, md: 6 } }}>
          <Box
            component='img'
            src={characterIllustration}
            alt='character-illustration'
            sx={{
              maxHeight: { xs: 300, md: 500 },
              width: 'auto',
              borderRadius: { xs: 2, md: 3 }
            }}
          />
        </Box>
      </Box>

      {/* Form side */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: { xs: '100%', md: 480 },
          p: { xs: 3, sm: 4, md: 6 },
          bgcolor: 'background.paper',
          overflow: 'auto'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              pt: { xs: 4, sm: 6, md: 10 }
            }}
          >
            <Link href='/'>
              <Logo
                className='text-primary'
                height={isMobile ? 70 : isTablet ? 85 : 98}
                width={isMobile ? 68 : isTablet ? 82 : 95}
              />
            </Link>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 600,
                letterSpacing: 0.15,
                mt: { xs: 2, sm: 3 },
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                px: { xs: 2, sm: 0 },
                color: 'text.primary'
              }}
            >
              {gamePin
                ? `Login to ${themeConfig.templateName} to join the game!`
                : `Welcome to ${themeConfig.templateName}!`}
            </Typography>
          </Box>

          {!showCode && !otpSent && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  mt: { xs: 2, sm: 3 },
                  mb: { xs: 3, sm: 4 }
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    mb: 2,
                    color: 'text.secondary'
                  }}
                >
                  Explore Indian Knowledge Systems
                </Typography>
                <form action={onSocialLogin}>
                  <Button
                    color='secondary'
                    sx={{
                      alignSelf: 'center',
                      color: 'primary.main',
                      '& .MuiButton-startIcon': { marginInlineEnd: 3 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      boxShadow: isDarkMode
                        ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                        : `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        boxShadow: isDarkMode
                          ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                          : `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }}
                    startIcon={<img src='/images/logos/google.png' alt='Google' width={isMobile ? 18 : 22} />}
                    type='submit'
                    value='google'
                    name='action'
                  >
                    Sign in with Google
                  </Button>
                </form>
              </Box>
              <Divider
                sx={{
                  width: '100%',
                  mb: { xs: 3, sm: 4 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.secondary',
                  '&::before, &::after': {
                    borderColor: isDarkMode
                      ? alpha(theme.palette.divider, 0.12)
                      : alpha(theme.palette.divider, 0.2)
                  }
                }}
              >
                or
              </Divider>
            </>
          )}

          {/* Login Method Selection */}
          {!otpSent && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 4 },
                width: '100%',
                mb: { xs: 3, sm: 4 }
              }}
            >
              <FormLabel
                component='legend'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: { xs: 1, sm: 0 },
                  color: 'text.primary'
                }}
              >
                Login Using
              </FormLabel>
              <RadioGroup
                row
                value={loginMethod}
                onChange={handleLoginMethodChange}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 0.5, sm: 1 }
                }}
              >
                <FormControlLabel
                  value='email'
                  control={<Radio />}
                  label='Email'
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiRadio-root': {
                      color: isDarkMode ? theme.palette.grey[400] : theme.palette.grey[600]
                    },
                    '& .MuiRadio-root.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
                <FormControlLabel
                  value='mobile'
                  control={<Radio />}
                  label='Mobile (India Only)'
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiRadio-root': {
                      color: isDarkMode ? theme.palette.grey[400] : theme.palette.grey[600]
                    },
                    '& .MuiRadio-root.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
              </RadioGroup>
            </Box>
          )}

          {!showCode ? (
            <Box
              component='form'
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, sm: 3 },
                width: '100%'
              }}
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
                  {!otpSent ? (
                    <Controller
                      name='mobile'
                      control={control}
                      rules={{
                        required: true,
                        validate: {
                          validFirstDigit: v => /^[6-9]/.test(v) || 'Mobile number must start with 6, 7, 8, or 9',
                          validLength: v => v.length === 10 || 'Mobile number must be 10 digits'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          autoFocus
                          label='Mobile Number'
                          type='tel'
                          inputProps={{
                            maxLength: 10, // Limits input to 10 characters
                            pattern: '[6-9][0-9]{10}', // HTML5 pattern for exactly 10 digits
                            inputMode: 'numeric' // Shows numeric keyboard on mobile devices
                          }}
                          onKeyDown={e => {
                            // Prevent non-digit characters
                            if (/\D/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete') {
                              e.preventDefault()
                            }
                            // For first digit, only allow 6,7,8,9
                            if (field.value.length === 0 && !['6', '7', '8', '9'].includes(e.key)) {
                              e.preventDefault()
                            }
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              e.stopPropagation()
                              findAccountsWithMobile(field.value)
                            }
                          }}
                          onChange={e => {
                            // Only allow numeric input
                            const value = e.target.value.replace(/\D/g, '')
                            // If first digit is invalid, don't update the field
                            if (value.length > 0 && !['6', '7', '8', '9'].includes(value[0])) {
                              return
                            }
                            field.onChange(value)
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
                                  disabled={
                                    !field.value ||
                                    field.value.length !== 10 ||
                                    !['6', '7', '8', '9'].includes(field.value[0]) ||
                                    loading.findAccounts
                                  }
                                  color='primary'
                                  component='label'
                                  variant='contained'
                                  size='small'
                                  style={{ color: 'white' }}
                                >
                                  {loading.findAccounts ? 'Finding...' : 'Find Account'}
                                </Button>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  ) : (
                    /* Clean OTP State - Show selected account and phone as text */
                    <Box sx={{ width: '100%', mb: { xs: 3, sm: 4 } }}>
                      <Paper
                        elevation={0}
                        sx={{
                          bgcolor: isDarkMode
                            ? alpha(theme.palette.background.paper, 0.8)
                            : alpha(theme.palette.grey[50], 0.8),
                          border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.grey[200], 0.8)}`,
                          borderRadius: { xs: 1.5, sm: 2 },
                          p: { xs: 2, sm: 3 }
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 2, sm: 0 }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                            <Avatar
                              sx={{
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 },
                                bgcolor: theme.palette.primary.main,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              }}
                            >
                              {selectedAccountWithMobile?.firstname?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                  color: 'text.primary',
                                  mb: 0.5
                                }}
                              >
                                {selectedAccountWithMobile?.firstname} {selectedAccountWithMobile?.lastname}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  display: 'block',
                                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                  color: 'text.secondary',
                                  mb: 0.25
                                }}
                              >
                                {selectedAccountWithMobile?.email}
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  display: 'block',
                                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                  color: 'text.secondary'
                                }}
                              >
                                +91 {mobileValue}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            variant='outlined'
                            size={isMobile ? 'small' : 'medium'}
                            onClick={handleCancelOtp}
                            startIcon={<i className='ri-arrow-left-line'></i>}
                            sx={{
                              borderColor: isDarkMode
                                ? alpha(theme.palette.primary.main, 0.5)
                                : theme.palette.primary.main,
                              color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                bgcolor: isDarkMode
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            Back
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {!otpSent && accountsWithMobile.length > 0 && (
                    <>
                      {isAccountsListExpanded && (
                        <Typography
                          color='primary'
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            mb: { xs: 1.5, sm: 2 }
                          }}
                        >
                          Please select one of the email address account associated with this phone number.
                        </Typography>
                      )}

                      {isAccountsListExpanded ? (
                        <Box
                          sx={{
                            overflowY: 'auto',
                            p: { xs: 0.5, sm: 1 },
                            bgcolor: isDarkMode
                              ? alpha(theme.palette.background.paper, 0.5)
                              : alpha(theme.palette.common.black, 0.025),
                            borderRadius: { xs: 1, sm: 1.5 },
                            maxHeight: { xs: 180, sm: 192 },
                            border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.divider, 0.08)}`
                          }}
                        >
                          {accountsWithMobile.map(account => (
                            <Paper
                              key={account?.email}
                              elevation={0}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: { xs: 1.5, sm: 2 },
                                mb: { xs: 0.5, sm: 1 },
                                border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.divider, 0.08)}`,
                                borderRadius: { xs: 1, sm: 1.5 },
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                bgcolor:
                                  selectedAccountWithMobile === account
                                    ? isDarkMode
                                      ? alpha(theme.palette.primary.main, 0.2)
                                      : alpha(theme.palette.primary.main, 0.12)
                                    : 'transparent',
                                boxShadow:
                                  selectedAccountWithMobile === account
                                    ? isDarkMode
                                      ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                      : `0 2px 6px ${alpha(theme.palette.primary.main, 0.15)}`
                                    : 'none',
                                '&:hover': {
                                  bgcolor: isDarkMode
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(theme.palette.grey[200], 0.5)
                                },
                                '&:active': {
                                  transform: 'scale(0.98)'
                                }
                              }}
                              onClick={() => {
                                setSelectedAccountWithMobile(account)
                                setIsAccountsListExpanded(false)
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: { xs: 36, sm: 40 },
                                  height: { xs: 36, sm: 40 },
                                  bgcolor: theme.palette.primary.main,
                                  fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}
                              >
                                {account?.firstname?.charAt(0)}
                              </Avatar>
                              <Box sx={{ ml: { xs: 2, sm: 3 }, flex: 1 }}>
                                <Typography
                                  variant='caption'
                                  sx={{
                                    display: 'block',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                    color: 'primary.main',
                                    mb: 0.25
                                  }}
                                >
                                  {account?.email}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  sx={{
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    color: 'text.secondary'
                                  }}
                                >
                                  {account?.firstname} {account?.lastname}
                                </Typography>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: { xs: 1.5, sm: 2 },
                            border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.divider, 0.08)}`,
                            borderRadius: { xs: 1, sm: 1.5 },
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            bgcolor: isDarkMode
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.primary.light, 0.15),
                            '&:hover': {
                              bgcolor: isDarkMode
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.light, 0.25),
                              transform: 'translateY(-1px)',
                              boxShadow: isDarkMode
                                ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                                : `0 2px 6px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          }}
                          onClick={() => setIsAccountsListExpanded(true)}
                        >
                          <Avatar
                            sx={{
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              bgcolor: theme.palette.primary.main,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {selectedAccountWithMobile?.firstname?.charAt(0)}
                          </Avatar>
                          <Box sx={{ ml: { xs: 2, sm: 3 }, flex: 1 }}>
                            <Typography
                              variant='caption'
                              sx={{
                                display: 'block',
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                                color: 'primary.main',
                                mb: 0.25
                              }}
                            >
                              {selectedAccountWithMobile?.email}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                color: 'text.secondary'
                              }}
                            >
                              {selectedAccountWithMobile?.firstname} {selectedAccountWithMobile?.lastname}
                            </Typography>
                          </Box>
                          <Box sx={{ ml: { xs: 1, sm: 2 } }}>
                            <i
                              className='ri-arrow-down-s-line'
                              style={{
                                fontSize: isMobile ? '1.25rem' : '1.5rem',
                                color: theme.palette.text.secondary
                              }}
                            />
                          </Box>
                        </Paper>
                      )}
                    </>
                  )}

                  {!otpSent && loading.accountsFetched && accountsWithMobile.length === 0 && (
                    <Box
                      sx={{
                        p: { xs: 1, sm: 1.5 },
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.error.main, 0.1)
                          : alpha(theme.palette.common.black, 0.05),
                        borderRadius: { xs: 1, sm: 1.5 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          color: 'text.secondary'
                        }}
                      >
                        No account found.
                      </Typography>
                      <Typography
                        component={Link}
                        href={gamePin ? `/auth/register?gamePin=${gamePin}` : `/auth/register`}
                        sx={{
                          color: 'primary.main',
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          fontWeight: 500,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Register?
                      </Typography>
                    </Box>
                  )}

                  {!otpSent && selectedAccountWithMobile && !isAccountsListExpanded && (
                    <Button
                      disabled={loading.sendOtp}
                      color='primary'
                      variant='contained'
                      component='label'
                      fullWidth
                      onClick={() => sendPhoneOtpToAccount(selectedAccountWithMobile.phone)}
                      sx={{
                        color: 'white',
                        py: { xs: 1.25, sm: 1.5 },
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        fontWeight: 600,
                        boxShadow: isDarkMode
                          ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                          : `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          boxShadow: isDarkMode
                            ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                            : `0 6px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                        },
                        '&:disabled': {
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {loading.sendOtp ? 'Sending...' : `Send OTP`}
                    </Button>
                  )}

                  {otpSent && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                      }}
                    >
                      {loading.resendOtp ? (
                        <CircularProgress size={isMobile ? 24 : 32} />
                      ) : (
                        <OtpForm otpValue={otpValue} setOtpValue={setOtpValue} setIsDirty={() => {}} />
                      )}
                      <Button
                        color='primary'
                        disabled={loading.resendOtp}
                        variant='text'
                        component='label'
                        size={isMobile ? 'small' : 'medium'}
                        onClick={() => handleResendPhoneOtp(selectedAccountWithMobile.phone)}
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          minWidth: { xs: 'auto', sm: 100 },
                          color: 'white'
                        }}
                      >
                        Resend
                      </Button>
                    </Stack>
                  )}

                  {/* Testing OTP Display for Mobile Login */}
                  {otpSent && testingOtp && (
                    <Box
                      sx={{
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.info.main, 0.15)
                          : alpha(theme.palette.info.light, 0.2),
                        border: `1px solid ${isDarkMode ? alpha(theme.palette.info.main, 0.3) : alpha(theme.palette.info.main, 0.4)}`,
                        borderRadius: { xs: 1, sm: 1.5 },
                        p: { xs: 2, sm: 3 },
                        mt: { xs: 2, sm: 3 }
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            color: 'text.primary',
                            fontWeight: 500
                          }}
                        >
                          <strong>Testing OTP:</strong> {testingOtp}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {errorMsg && (
                <Alert
                  severity='error'
                  icon={<WarningAmberOutlinedIcon />}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.error.main, 0.15)
                      : alpha(theme.palette.error.light, 0.1),
                    border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.error.main, 0.2)}`,
                    borderRadius: { xs: 1, sm: 1.5 },
                  }}
                >
                  {errorMsg}
                </Alert>
              )}

              {successMsg && (
                <Alert
                  severity='success'
                  icon={<TaskAltOutlinedIcon />}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.success.main, 0.15)
                      : alpha(theme.palette.success.light, 0.1),
                    border: `1px solid ${isDarkMode ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: { xs: 1, sm: 1.5 },
                  }}
                >
                  {successMsg}
                </Alert>
              )}

              {((otpSent && loginMethod === 'mobile') || loginMethod === 'email') && (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%'
                    }}
                  >
                    <RecaptchaComponent
                      key={recaptchaKey}
                      recaptchaRef={recaptchaRef}
                      handleCaptchaChange={handleCaptchaChange}
                    />
                  </Box>

                  <Button
                    disabled={isSubmitting}
                    fullWidth
                    color='primary'
                    variant='contained'
                    type='submit'
                    // onClick={handleSubmit(onSubmitWithCode)}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      mt: { xs: 2, sm: 3 },
                      py: { xs: 1.25, sm: 1.5 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 600,
                      boxShadow: isDarkMode
                        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                        : `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: isDarkMode
                          ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                          : `0 6px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                      },
                      '&:disabled': {
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {loginMethod === 'mobile' ? 'Verify & Log In' : 'Log In'}
                  </Button>
                </>
              )}

              <Stack
                direction='row'
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 2 },
                  mt: { xs: 2, sm: 3 }
                }}
              >
                <Typography
                  component={Link}
                  href={
                    loginMethod === 'email' && watchedEmail
                      ? `/forgot-password?email=${watchedEmail}`
                      : loginMethod === 'mobile' && watchedMobile
                        ? `/forgot-password?mobile=${watchedMobile}`
                        : '/forgot-password'
                  }
                  sx={{
                    color: 'primary.main',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
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
                  sx={{
                    color: 'primary.main',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register?
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box
              component='form'
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(onSubmitWithCode)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 3, sm: 4 },
                width: '100%'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                {loading.resendCode ? (
                  <CircularProgress size={isMobile ? 24 : 32} />
                ) : (
                  <OtpForm otpValue={code} setOtpValue={setCode} setIsDirty={() => {}} />
                )}
                <Button
                  color='primary'
                  disabled={loading.resendCode}
                  variant='text'
                  type='button'
                  size={isMobile ? 'small' : 'medium'}
                  onClick={handleResendCode}
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    minWidth: { xs: 'auto', sm: 100 }
                  }}
                >
                  {loading.resendCode ? 'Sending...' : 'Resend'}
                </Button>
              </Stack>

              {errorMsg && (
                <Alert
                  severity='error'
                  icon={<WarningAmberOutlinedIcon />}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.error.main, 0.15)
                      : alpha(theme.palette.error.light, 0.1),
                    border: `1px solid ${isDarkMode ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.error.main, 0.2)}`,
                    borderRadius: { xs: 1, sm: 1.5 },
                  }}
                >
                  {errorMsg}
                </Alert>
              )}

              {successMsg && (
                <Alert
                  severity='success'
                  icon={<TaskAltOutlinedIcon />}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.success.main, 0.15)
                      : alpha(theme.palette.success.light, 0.1),
                    border: `1px solid ${isDarkMode ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: { xs: 1, sm: 1.5 },
                  }}
                >
                  {successMsg}
                </Alert>
              )}

              <Button
                disabled={!code || loading.confirmCode || loading.resendCode}
                fullWidth
                variant='contained'
                type='submit'
                // onClick={handleSubmit(onSubmitWithCode)}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontWeight: 600,
                  boxShadow: isDarkMode
                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                    : `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: isDarkMode
                      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                      : `0 6px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                  },
                  '&:disabled': {
                    boxShadow: 'none'
                  }
                }}
              >
                {loading.confirmCode ? (
                  <CircularProgress color='inherit' size={isMobile ? 20 : 24} />
                ) : (
                  'Confirm'
                )}
              </Button>
            </Box>
          )}

          <Stack
            direction='row'
            spacing={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: { xs: 2, sm: 4 },
              mt: { xs: 6, sm: 8 },
              width: '100%'
            }}
          >
            <MuiLink
              component={Link}
              href='/termsofservice'
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'underline',
                color: 'primary.main',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
            >
              <InfoIcon
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: 'primary.main'
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: 'primary.main'
                }}
              >
                Terms of Service
              </Typography>
            </MuiLink>
            <MuiLink
              component={Link}
              href='/privacypolicy'
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'underline',
                color: 'primary.main',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                '&:hover': {
                  color: 'primary.dark'
                }
              }}
            >
              <InfoIcon
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: 'primary.main'
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: 'primary.main'
                }}
              >
                Privacy Policy
              </Typography>
            </MuiLink>
          </Stack>
        </Box>
      </Box>
      {isSubmitting && <LoadingDialog open={isSubmitting} />}
    </Box>
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
