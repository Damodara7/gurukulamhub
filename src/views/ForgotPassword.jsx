'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@views/pages/account-settings/account/CircularProgressWithValueLabel'
import { DoneAll as DoneAllIcon, WarningAmberOutlined as WarningAmberOutlinedIcon } from '@mui/icons-material'

// Component Imports
import Logo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useEffect, useState } from 'react'
import { Alert, Avatar, FormControlLabel, InputAdornment, Radio, RadioGroup } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { useSearchParams } from 'next/navigation'
import { getAccountsWithMobile, sendPhoneOtp } from '@/actions/mobile'
import OtpForm from '@/views/pages/auth/register-multi-steps/OTPForm'
import { API_URLS } from '@/configs/apiConfig'

const initialLoadingState = {
  findAccounts: false,
  accountsFetched: false,
  sendOtp: false,
  resendOtp: false,
  verifyMobileOtp: false,
  sendResetLink: false
}

const ForgotPasswordV2 = ({ mode }) => {
  const searchParams = useSearchParams()
  const [loginMethod, setLoginMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [mobileValue, setMobileValue] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [otpValue, setOtpValue] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [accountsWithMobile, setAccountsWithMobile] = useState([])
  const [selectedAccountWithMobile, setSelectedAccountWithMobile] = useState(null)
  const [loading, setLoading] = useState(initialLoadingState)
  const [resetPasswordLink, setResetPasswordLink] = useState(null)

  const emailSearchParam = searchParams.get('email')
  const mobileSearchParam = searchParams.get('mobile')
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  useEffect(() => {
    if (emailSearchParam) {
      setEmail(emailSearchParam)
      setLoginMethod('email')
    }
  }, [emailSearchParam])

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setErrorMessage('Please enter a valid email.')
    } else {
      setErrorMessage(null)
    }
  }, [email])

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function handleEmailChange(e) {
    setEmail(e.target.value)
  }

  async function handleVerifyMobileOtp() {
    setLoading(prev => ({ ...prev, verifyMobileOtp: true }))
    try {
      const result = await RestApi.post(API_URLS.v0.USERS_VERIFY_PHONE_OTP, {
        email: selectedAccountWithMobile.email,
        phone: mobileValue,
        otp: otpValue,
        action: 'verifyPhoneOtp'
      })
      if (result.status === 'success') {
        setSuccessMessage('OTP verification successful.')
        return { status: 'success' } // The return doesn't skip the finally block
      } else {
        setOtpValue('')
        setErrorMessage(result.message || 'OTP verification failed.')
        return { status: 'error' } // The return doesn't skip the finally block
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setOtpValue('')
      setErrorMessage('Failed to verify OTP. Please try again.')
      return { status: 'error' } // The return doesn't skip the finally block
    } finally {
      setLoading(prev => ({ ...prev, verifyMobileOtp: false })) // This always executes
    }
  }

  async function handleSendResetLink() {
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(prev => ({ ...prev, sendResetLink: true }))

    try {
      if (loginMethod === 'email') {
        if (!email) {
          setErrorMessage('Please enter your email.')
          return
        }
        const result = await RestApi.post(`/api/forgot-password`, { email: email })
        if (result.status === 'success') {
          setSuccessMessage('Reset link has been sent to your email.')
          // toast.success(result.message || 'Reset link has been sent to your email.')
        } else {
          // toast.error(result.message || 'Failed to send reset link. Please try again.')
          setErrorMessage(result.message || 'Failed to send reset link. Please try again')
        }
      } else {
        const response = await handleVerifyMobileOtp()
        if (response.status === 'success') {
          const result = await RestApi.post(`/api/forgot-password`, {
            email: selectedAccountWithMobile.email,
            mobile: mobileValue
          })
          console.log({ result })
          if (result.status === 'success') {
            setResetPasswordLink(result?.result?.resetPasswordLink)
            setSuccessMessage('Your reset password link is ready.')
            setEmail('')
            // toast.success(result.message || 'Reset link has been sent to your email.')
          } else {
            // toast.error(result.message || 'Failed to send reset link. Please try again.')
            setErrorMessage(result.message || 'Failed to send reset link. Please try again')
            setEmail('')
          }
        } else {
          setOtpValue('')
        }
      }
    } catch (error) {
      console.error('Error sending reset link:', error)
      setErrorMessage('Failed to send reset link. Please try again.')
      setEmail('')
    } finally {
      setLoading(prev => ({ ...prev, sendResetLink: false }))
    }
  }

  const handleLoginMethodChange = event => {
    setLoginMethod(event.target.value)
  }

  async function findAccountsWithMobile(mobileValue) {
    try {
      setLoading(prev => ({ ...prev, findAccounts: true }))
      setLoading(prev => ({ ...prev, accountsFetched: false }))
      if (mobileValue && /^\d{10}$/.test(mobileValue)) {
        setMobileValue(mobileValue)
        setOtpSent(false)
        setSuccessMessage('')
        setAccountsWithMobile([])
        setOtpValue('')
        const result = await getAccountsWithMobile(mobileValue)
        if (result?.status === 'success') {
          setAccountsWithMobile(result?.result)
          setErrorMessage('')
        } else {
          setErrorMessage('No account found with this mobile number.')
          setAccountsWithMobile([])
        }
      } else {
        setErrorMessage('Please enter a valid mobile number.')
        setAccountsWithMobile([])
      }
    } catch (error) {
      console.error(error)
      setErrorMessage(error?.message || 'Failed to fetch accounts. Please try again.')
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
          setSuccessMessage('OTP sent successfully.')
          console.log('OTP sent to: ', mobileValue)
          setErrorMessage('')
        } else {
          setErrorMessage('Failed to send OTP. Please try again.')
        }
      } else {
        setErrorMessage('Please enter a valid mobile number.')
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to send OTP. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, sendOtp: false }))
    }
  }

  async function handleResendPhoneOtp(mobileValue) {
    setOtpSent(false)
    setOtpValue('')
    setSuccessMessage('')
    setErrorMessage('')
    setLoading(prev => ({ ...prev, resendOtp: true }))
    await sendPhoneOtpToAccount(mobileValue)
    setLoading(prev => ({ ...prev, resendOtp: false }))
  }

  function handleMobileChange(e) {
    // Only allow numeric input
    const value = e.target.value.replace(/\D/g, '')

    // If first digit is invalid, don't update the field
    if (value.length > 0 && !['6', '7', '8', '9'].includes(value[0])) {
      return
    }

    setMobileValue(value)
    setOtpSent(false)
    setOtpValue('')
    setErrorMessage('')
    setLoading(prev => ({ ...prev, accountsFetched: false }))
    setAccountsWithMobile([]) // Clear the list when mobile number changes
    setSelectedAccountWithMobile(null)
    setResetPasswordLink(null)
  }

  useEffect(() => {
    if (mobileSearchParam) {
      setMobileValue(mobileSearchParam)
      setLoginMethod('mobile')
    }
  }, [mobileSearchParam])

  useEffect(() => {
    setSuccessMessage('')
    setErrorMessage('')
    setOtpSent(false)
    setOtpValue('')
    setAccountsWithMobile([])
    setSelectedAccountWithMobile(null)
    setLoading(initialLoadingState)
    setResetPasswordLink(null)
  }, [loginMethod])

  console.log({ loading })

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
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <div className='flex justify-center items-center gap-3 mbe-6'>
            <Logo className='text-primary' height={28} width={35} />
            <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
              {themeConfig.templateName}
            </Typography>
          </div>
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography className='mbs-1'>
              {loginMethod === 'email'
                ? `Enter your email we'll send you email to reset your password`
                : 'Enter your mobile, find accounts, select one account, get an OTP, and receive a reset link after verification.'}
            </Typography>
          </div>
          {/* Login Method Selection */}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4'>
            <RadioGroup row value={loginMethod} onChange={handleLoginMethodChange}>
              <FormControlLabel value='email' control={<Radio />} label='Email' />
              <FormControlLabel value='mobile' control={<Radio />} label='Mobile (India Only)' />
            </RadioGroup>
          </div>
          {loginMethod === 'email' && (
            <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
              <TextField value={email} name='email' onChange={handleEmailChange} autoFocus fullWidth label='Email' />
              <Button
                onClick={handleSendResetLink}
                // disabled={err && (!email || !email.includes('@'))}
                fullWidth
                sx={{ color: 'white' }}
                variant='contained'
                // style={{color: 'white'}}
                type='submit'
              >
                Send reset link
              </Button>
              {errorMessage && (
                <Alert
                  sx={{ padding: '0.5rem' }}
                  severity=''
                  icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
                  color='error'
                >
                  {errorMessage}
                </Alert>
              )}
              {successMessage && (
                <Alert sx={{ padding: '0.5rem' }} severity='' icon={<DoneAllIcon fontSize='inherit' />} color='success'>
                  {successMessage}
                </Alert>
              )}
            </form>
          )}
          {loginMethod === 'mobile' && (
            <>
              <TextField
                fullWidth
                // defaultValue=''
                autoFocus
                value={mobileValue}
                label='Mobile Number'
                type='tel'
                inputProps={{
                  maxLength: 10,
                  pattern: '[6-9][0-9]{10}',
                  inputMode: 'numeric'
                }}
                onKeyDown={e => {
                  // Prevent non-digit characters
                  if (/\D/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete') {
                    e.preventDefault()
                  }
                  // For first digit, only allow 6,7,8,9
                  if (mobileValue.length === 0 && !['6', '7', '8', '9'].includes(e.key)) {
                    e.preventDefault()
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    findAccountsWithMobile(mobileValue)
                  }
                }}
                onChange={handleMobileChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography variant='body1' color='textSecondary'>
                        +91
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end' type='button' component='button' style={{ color: 'white' }}>
                      <Button
                        onClick={e => {
                          e.stopPropagation()
                          findAccountsWithMobile(mobileValue)
                        }}
                        disabled={
                          !mobileValue ||
                          mobileValue.length !== 10 ||
                          !['6', '7', '8', '9'].includes(mobileValue[0]) ||
                          loading.findAccounts
                        }
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

              {!resetPasswordLink && (
                <>
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
                            key={account.email}
                            className={`flex items-center px-3 py-1 border rounded-md transition duration-300 ease-in-out ${
                              selectedAccountWithMobile === account
                                ? 'bg-blue-200 shadow-md'
                                : !otpSent && 'hover:bg-gray-200'
                            }`}
                            style={{ cursor: !otpSent ? 'pointer' : 'not-allowed' }}
                            onClick={!otpSent ? () => setSelectedAccountWithMobile(account) : () => {}}
                          >
                            <Avatar>{account.firstname.charAt(0)}</Avatar>
                            <div className='ml-3'>
                              <Typography variant='caption' className='text-blue-800 font-medium'>
                                {account.email}
                              </Typography>
                              <Typography variant='body2' className='text-gray-700'>
                                {account.firstname} {account.lastname}
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
                          href={`/auth/register`}
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
                    <>
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
                      <Button
                        onClick={handleSendResetLink}
                        disabled={otpValue?.length !== 6 || loading.sendResetLink || loading.verifyMobileOtp}
                        fullWidth
                        sx={{ color: 'white' }}
                        variant='contained'
                        type='submit'
                      >
                        {loading.verifyMobileOtp
                          ? 'Verifying...'
                          : loading.sendResetLink
                            ? 'Sending reset link...'
                            : 'Verify & Send Reset Link'}
                      </Button>
                    </>
                  )}

                  {errorMessage && (
                    <Alert
                      sx={{ padding: '0.5rem' }}
                      severity=''
                      icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
                      color='error'
                    >
                      {errorMessage}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert
                      sx={{ padding: '0.5rem' }}
                      severity=''
                      icon={<DoneAllIcon fontSize='inherit' />}
                      color='success'
                    >
                      {successMessage}
                    </Alert>
                  )}
                </>
              )}

              {resetPasswordLink && (
                <div
                  style={{
                    // marginTop: '24px',
                    textAlign: 'center',
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Typography
                    variant='h6'
                    color='textSuccess'
                    style={{
                      marginBottom: '12px',
                      fontWeight: '600',
                      fontSize: '18px',
                      color: 'green'
                    }}
                  >
                    Password Reset Link Ready
                  </Typography>
                  <Typography
                    variant='body2'
                    style={{
                      marginBottom: '16px',
                      color: '#6b6b6b',
                      lineHeight: '1.5'
                    }}
                  >
                    Your reset link is ready. Click the button below to securely reset your password.
                  </Typography>
                  <Button
                    href={resetPasswordLink}
                    rel='noopener noreferrer'
                    variant='contained'
                    color='primary'
                    style={{
                      // backgroundColor: '#1976d2',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: '500',
                      textTransform: 'none'
                    }}
                  >
                    Reset Your Password
                  </Button>
                </div>
              )}
            </>
          )}
          <Typography className='flex justify-center items-center' color='primary'>
            <Link href='/auth/login' className='flex items-center'>
              <i className='ri-arrow-left-s-line' />
              <span>Back to Login</span>
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordV2
