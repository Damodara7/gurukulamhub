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

const Login = ({ mode, gamePin = null }) => {
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
    <div className='flex bs-full justify-center'>
      <div className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'>
        <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        
      </div>
      <div className='flex flex-col justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex justify-center  text-center w-full flex-col items-center gap-2'>
          <Link href='/'>
            <Logo className='text-primary' height={98} width={95} />
          </Link>
          <Typography variant='h4' textAlign='center' className='font-semibold tracking-[0.15px]'>
            {gamePin
              ? `Login to ${themeConfig.templateName} to join the game!`
              : `Welcome to ${themeConfig.templateName}!`}
          </Typography>
        </div>
        <div className='flex flex-col gap-2 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <>
            {!showCode && (
              <>
                <div className='flex flex-col justify-center items-center mt-2'>
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
                <div>
                  <Divider className='gap-3'>or</Divider>
                  {/* <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography> */}
                </div>
              </>
            )}

            {/* Login Method Selection */}
            <div className='flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4'>
              <FormLabel component='legend'>Login Using</FormLabel>
              <RadioGroup row value={loginMethod} onChange={handleLoginMethodChange}>
                <FormControlLabel value='email' control={<Radio />} label='Email' />
                <FormControlLabel value='mobile' control={<Radio />} label='Mobile (India Only)' />
              </RadioGroup>
            </div>

            {!showCode && (
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-3'>
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
                            field.onChange(e) // Ensure this is called
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
                          id='login-password'
                          type={isPasswordShown ? 'text' : 'password'}
                          onChange={e => {
                            setSuccessMsg('')
                            setErrorMsg('')
                            field.onChange(e) // Ensure this is called
                            errorState !== null && setErrorState(null)
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButtonTooltip title={isPasswordShown ? 'Hide' : 'Show'}
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
                          defaultValue='8247783396'
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
                            setAccountsWithMobile([]) // Clear the list when mobile number changes
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
                              <InputAdornment
                                position='end'
                                type='button'
                                component='button'
                                style={{ color: 'white' }}
                              >
                                <Button
                                  onClick={e => {
                                    e.stopPropagation()
                                    findAccountsWithMobile(field.value)
                                  }}
                                  disabled={!field.value || field.value.trim().length !== 10 || loading.findAccounts}
                                  edge='end'
                                  color='primary'
                                  type='button'
                                  component='label'
                                  style={{ color: 'white' }}
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

                    {/* List of accounts if any */}
                    {accountsWithMobile.length > 0 ? (
                      <>
                        <Typography color='primary'>
                          Please select one of the email address account associated with this phone number.
                        </Typography>
                        <div
                          style={{
                            // maxHeight: '60px',
                            overflowY: 'auto',
                            padding: '4px',
                            background: 'rgba(0,0,0,0.025)',
                            borderRadius: '4px'
                          }}
                        >
                          {accountsWithMobile.map(account => (
                            <div
                              key={account?.email}
                              className={`flex items-center px-3 py-1 border rounded-md transition duration-300 ease-in-out ${
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
                        <div
                          style={{
                            maxHeight: '80px',
                            overflowY: 'auto',
                            padding: '6px 4px',
                            background: 'rgba(0,0,0,0.05)',
                            borderRadius: '4px'
                          }}
                          className='flex items-center justify-center gap-1'
                        >
                          <Typography>No account found.</Typography>
                          <Typography
                            style={{ cursor: 'pointer' }}
                            component={Link}
                            href={gamePin ? `/auth/register?gamePin=${gamePin}` : `/auth/register`}
                            color='primary'
                          >
                            Register?
                          </Typography>
                        </div>
                      )
                    )}

                    {/* Send OTP button appears if account is selected */}
                    {!otpSent && selectedAccountWithMobile && (
                      <Button
                        disabled={loading.sendOtp}
                        color='primary'
                        variant='contained'
                        type='button'
                        fullWidth
                        style={{ color: 'white' }}
                        onClick={e => {
                          e.stopPropagation()
                          sendPhoneOtpToAccount(selectedAccountWithMobile.phone)
                        }}
                      >
                        {loading.sendOtp ? 'Sending...' : `Send OTP `}
                      </Button>
                    )}

                    {/* OTP form appears after OTP is sent */}
                    {otpSent && (
                      <div className='flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0'>
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
                          onClick={e => handleResendPhoneOtp(selectedAccountWithMobile.phone)}
                          className='sm:ml-2'
                        >
                          Resend
                        </Button>
                      </div>
                    )}
                  </>
                )}

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
                <>
                  {((otpSent && loginMethod === 'mobile') || loginMethod === 'email') && (
                    <>
                      <div className='flex justify-center'>
                        <RecaptchaComponent
                          key={recaptchaKey}
                          recaptchaRef={recaptchaRef}
                          handleCaptchaChange={handleCaptchaChange}
                        />
                      </div>

                      <Button
                        disabled={isSubmitting}
                        fullWidth
                        variant='contained'
                        style={{ color: 'white' }}
                        component='button'
                        type='submit'
                      >
                        {loginMethod === 'mobile' ? 'Verify & Log In' : 'Log In'}
                      </Button>
                    </>
                  )}
                  <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                    <Typography
                      className='text-end'
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
                    <div className='flex justify-center items-center flex-wrap gap-2'>
                      <Typography
                        style={{ cursor: 'pointer' }}
                        component={Link}
                        href={gamePin ? `/auth/register?gamePin=${gamePin}` : `/auth/register`}
                        color='primary'
                      >
                        Register?
                      </Typography>
                    </div>
                  </div>
                </>
              </form>
            )}
            {showCode && (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit(onSubmitWithCode)}
                className='flex flex-col gap-4'
              >
                <div className='flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0'>
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
                    onClick={e => handleResendCode()}
                    className='sm:ml-2'
                  >
                    {loading.resendCode ? 'Sending...' : 'Resend'}
                  </Button>
                </div>

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
                <Button
                  disabled={!code || loading.confirmCode || loading.resendCode}
                  fullWidth
                  variant='contained'
                  component='button'
                  style={{ color: 'white' }}
                  type='submit'
                >
                  {loading.confirmCode ? <CircularProgress color='inherit' size={24} /> : 'Confirm'}
                </Button>
              </form>
            )}
          </>

          <div className='flex justify-between items-center flex-wrap gap-x-8 gap-y-1 mt-10'>
            <Link className='flex items-center gap-1 underline underline-offset-4' href='/termsofservice'>
              {/* <i style={{ color: 'red' }} className='ri-file-warning-fill'></i> */}
              <InfoIcon color='primary' />
              <Typography>Terms of Service</Typography>
            </Link>
            <Link className='flex items-center gap-1 underline  underline-offset-4' href='/privacypolicy'>
              {/* <i style={{ color: 'red' }} className='ri-file-warning-fill'></i> */}
              <InfoIcon color='primary' />
              <Typography>Privacy Policy</Typography>
            </Link>
          </div>
        </div>
      </div>
      {isSubmitting && <LoadingDialog open={isSubmitting} />}
    </div>
  )
}

export default Login
