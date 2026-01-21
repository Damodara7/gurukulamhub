// MUI Imports
/********** Standard imports.*********************/
import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  TextField,
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Link,
  Box,
  Alert,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'
/********************************************/
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import OtpForm from './OTPForm'
import Form from '@components/Form'
import TestingOtp from '@/components/TestingOtp'

import { useRouter } from 'next/navigation'

const PhoneDetailsStep = ({
  handleNext,
  handlePrev,
  stepIndex,
  totalSteps,
  activeStep,
  currStatus,
  setCurrStatus,
  firstName,
  email,
  gamePin = null
}) => {
  const [loading, setLoading] = useState({ sendOtp: false, resendOtp: false, verifyOtp: false })
  const [otpValue, setOtpValue] = useState('') // State to store the OTP value
  const [isDirty, setIsDirty] = useState(false)
  const [phoneInput, setPhoneInput] = useState(false)
  const [phoneValid, setPhoneValid] = useState(false)
  const [countryDialCode, setCountryDialCode] = useState(false)
  const [timer, setTimer] = useState(60) // Timer set to 40 seconds
  const [resendEnabled, setResendEnabled] = useState(false) // State to manage resend button
  const [testingOtp, setTestingOtp] = useState(null) // State to store testing OTP

  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()

  const validatePhone = (value, countryDialCode) => {
    const indianRegex = new RegExp('^[6-9][0-9]{9}$')
    if (countryDialCode == 91) {
      let contactWithoutCountryCode = value.substring(2, value.length)
      var result = indianRegex.test(contactWithoutCountryCode)
      setPhoneValid(result)
    }
  }

  const handlePhoneInputChange = (value, country) => {
    // Update phone number
    setPhoneInput(value)
    // setCountryDialCode(country.dialCode)
    validatePhone(value, country.dialCode)
    setIsDirty(true)

    // Check if the dial code or country code has changed
    console.log(country.dialCode, countryDialCode)
    if (country.dialCode !== countryDialCode) {
      // Update country dial code
      setCountryDialCode(country.dialCode)
    }
  }

  function getPhoneWithoutCountryDialCode(phoneInput, countryDialCode) {
    return phoneInput.startsWith(countryDialCode) ? phoneInput.slice(countryDialCode.length) : phoneInput
  }

  const goToLogin = async () => {
    // Redirect to login page
    try {
      // await signOut();
      router.push(gamePin ? `/auth/login?gamePin=${gamePin}` : '/auth/login')
    } catch (error) {
      console.log('Error while Navigate to home', error)
    }
  }

  const resendOtp = async () => {
    console.log('resendOtp called.')
    setOtpValue('')
    setResendEnabled(false)
    await updatePhoneDetails({ resend: true })
    setTimer(60)
  }

  const updatePhoneDetails = async ({ resend = false }) => {
    console.log('sending update request....', email)
    setCurrStatus('PENDING_VERIFY_PHONE')
    setLoading(prev => ({ ...prev, [resend ? 'resendOtp' : 'sendOtp']: true }))

    setOtpValue('')
    console.log('sending update request....', email)

    try {
      const result = await RestApi.post(ApiUrls.v0.USERS_SEND_PHONE_OTP, {
        email,
        name: firstName ? firstName : 'GurukuHub User',
        countryDialCode: countryDialCode,
        phone: phoneInput
      })
      if (result) {
        // toast.success('Updated Phone Details & OTP Sent Successfully.')
        // Only show testing OTP if TEST_MODE is enabled
        if (process.env.NEXT_PUBLIC_TEST_MODE === 'true' && result?.result?.testingOtp) {
          setTestingOtp(result.result.testingOtp)
          console.log('Testing OTP received (TEST_MODE enabled):', result.result.testingOtp)
        } else {
          setTestingOtp(null)
        }
      }
    } catch (error) {
      console.error(error)
      // toast.error('Error occurred while updating phone details, Please retry', error)
      setCurrStatus('PENDING_VERIFY_PHONE')
    } finally {
      setLoading(prev => ({ ...prev, [resend ? 'resendOtp' : 'sendOtp']: false }))
    }
  }

  async function handleVerifyPhone() {
    var statusOutcome = 'PENDING_VERIFY_PHONE'
    setLoading(prev => ({ ...prev, verifyOtp: true }))

    try {
      const result = await RestApi.post(ApiUrls.v0.USERS_VERIFY_PHONE_OTP, {
        email,
        phone: phoneInput,
        otp: otpValue,
        action: 'verifyPhoneOtp'
      })
      console.log('Verification result', result)
      if (result.status == 'success') {
        statusOutcome = 'VERIFIED_PHONE'
        const phone = getPhoneWithoutCountryDialCode(phoneInput, countryDialCode)
        const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, {
          email,
          phone: phone,
          countryDialCode: countryDialCode
        })
        setIsDirty(false)
        // toast.success('Verified Phone Successfully.')
        // goToLogin()
        handleNext()
      } else {
        // toast.error('Verification failed: ' + result.message)
      }
      //handleNext();
    } catch (error) {
      console.log('error confirming sign up', error.message)
      //CodeMismatchException
      // toast.success('Phone verification failed.')
      setCurrStatus('PHONE_CODE_MISMATCH')
      return
    } finally {
      console.log('Inside finally....', statusOutcome)
      setCurrStatus(statusOutcome)
      setIsDirty(false)
      setLoading(prev => ({ ...prev, verifyOtp: false }))
    }
  }

  //
  // useEffect(()=>{

  // },[])

  // Function to handle countdown for timer
  useEffect(() => {
    let intervalId

    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1)
      }, 1000)
    }

    return () => clearInterval(intervalId)
  }, [timer, currStatus])

  // Function to handle resend button enable/disable
  useEffect(() => {
    if (timer === 0) {
      setResendEnabled(true)
    }
  }, [timer])

  return (
    <>
      {/* <div className='mbe-5'>
        <Typography variant='h5'>Step {stepIndex} of ({totalSteps}): Personal Information</Typography>
        <Typography>Enter Your Personal Information</Typography>
      </div> */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 5 }}>
        <Grid item xs={12}>
          <Box sx={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                fontStyle: 'italic',
                color: 'primary.main'
              }}
            >
              @Phone
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 2, sm: 2.5 },
              px: { xs: 2, sm: 0 }
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'primary.main'
              }}
            >
              {`"To receive updates on live games, quizzes, events, and more in the Gurukulhub app."`}
            </Typography>
          </Box>
        </Grid>
        <Grid
          sx={{
            margin: 'auto',
            width: '100%',
            maxWidth: { xs: '100%', sm: 400, md: 500 }
          }}
          item
          xs={12}
          sm={6}
          md={6}
        >
          <Box
            sx={{
              '& .react-tel-input': {
                '& .flag-dropdown': {
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.9)
                    : theme.palette.background.paper,
                  borderColor: isDarkMode
                    ? alpha(theme.palette.divider, 0.3)
                    : alpha(theme.palette.divider, 0.5),
                  '&:hover': {
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 1)
                      : theme.palette.background.paper
                  },
                  '&.open': {
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.95)
                      : theme.palette.background.paper
                  }
                },
                '& .selected-flag': {
                  bgcolor: 'transparent',
                  '&:hover': {
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.action.hover, 0.1)
                      : alpha(theme.palette.action.hover, 0.05)
                  },
                  '&:focus': {
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.action.hover, 0.1)
                      : alpha(theme.palette.action.hover, 0.05)
                  }
                },
                '& .country-list': {
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                  border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                  boxShadow: isDarkMode
                    ? `0 4px 20px ${alpha(theme.palette.common.black, 0.5)}`
                    : `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                  '& .country': {
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.action.hover, 0.1)
                        : alpha(theme.palette.action.hover, 0.05)
                    },
                    '&.highlight': {
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1)
                    }
                  },
                  '& .search-box': {
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.8)
                      : theme.palette.background.paper,
                    borderColor: isDarkMode
                      ? alpha(theme.palette.divider, 0.3)
                      : alpha(theme.palette.divider, 0.5),
                    color: 'text.primary'
                  }
                },
                '& .form-control': {
                  width: '100%',
                  height: isMobile ? '2.5rem' : '3rem',
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.background.paper, 0.8)
                    : theme.palette.background.paper,
                  borderColor: isDarkMode
                    ? alpha(theme.palette.divider, 0.3)
                    : alpha(theme.palette.divider, 0.5),
                  color: 'text.primary',
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  '&:focus': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.9)
                      : theme.palette.background.paper
                  },
                  '&:hover': {
                    borderColor: isDarkMode
                      ? alpha(theme.palette.primary.main, 0.5)
                      : theme.palette.primary.main
                  }
                }
              }
            }}
          >
            <PhoneInput
              countryCodeEditable={false}
              inputStyle={{
                width: '100%',
                height: isMobile ? '2.5rem' : '3rem',
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
                borderColor: isDarkMode
                  ? alpha(theme.palette.divider, 0.3)
                  : alpha(theme.palette.divider, 0.5),
                color: theme.palette.text.primary,
                fontSize: isMobile ? '0.9375rem' : '1rem'
              }}
              buttonStyle={{
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.9)
                  : theme.palette.background.paper,
                borderColor: isDarkMode
                  ? alpha(theme.palette.divider, 0.3)
                  : alpha(theme.palette.divider, 0.5),
                borderRight: 'none'
              }}
              dropdownStyle={{
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.background.paper, 0.95)
                  : theme.palette.background.paper,
                border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.3) : alpha(theme.palette.divider, 0.5)}`
              }}
              enableSearch={true}
              country='in'
              value={phoneInput}
              onChange={handlePhoneInputChange}
            />
          </Box>
        </Grid>
        {/* <Grid item xs={12} >
          <div style={{ display: "flex", gap: "4px", margin: "auto", justifyContent: "center" }}>
            <Button variant="contained" component="button" >
              Send OTP
            </Button>
            <Button variant="contained" component="button" >
              Verify OTP
            </Button>
          </div>
        </Grid> */}

        <Grid item xs={12}>
          {loading.sendOtp ? (
            <CenterBox>
              <CircularProgress />{' '}
            </CenterBox>
          ) : (
            <CenterBox>
              <Button
                variant='contained'
                color={'primary'}
                component='button'
                onClick={updatePhoneDetails}
                disabled={!phoneValid || !isDirty}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  fontStyle: 'italic',
                  letterSpacing: '1px',
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
                GO!
              </Button>
            </CenterBox>
          )}
        </Grid>
        {(currStatus === 'PENDING_VERIFY_PHONE' || currStatus == 'PHONE_CODE_MISMATCH') && (
          <Grid item xs={12}>
            <Box
              sx={{
                width: currStatus === 'PENDING_VERIFY_PHONE' || currStatus == 'PHONE_CODE_MISMATCH' ? '100%' : 0,
                height: '100%',
                overflow: 'hidden',
                _backgroundColor: 'lightblue',
                transition: 'width 0.5s ease',
                display: currStatus === 'PENDING_VERIFY_PHONE' || currStatus == 'PHONE_CODE_MISMATCH' ? 'block' : 'none'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 2 },
                  margin: 'auto',
                  justifyContent: 'center',
                  px: { xs: 1, sm: 0 }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, sm: 3 },
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 400 }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 0.5, sm: 1 }
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        color: 'text.primary',
                        textAlign: 'center'
                      }}
                    >
                      We have sent a verification code to your phone.
                    </Typography>
                  </Box>
                  <Form
                    noValidate
                    autoComplete='off'
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <CenterBox>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          mb: { xs: 2, sm: 3 },
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        Type in your 6 digit security code
                      </Typography>
                    </CenterBox>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3
                    }}>
                        <OtpForm
                          setOtpValue={setOtpValue}
                          otpValue={otpValue}
                          currStatus={currStatus}
                          setIsDirty={setIsDirty}
                        />
                    </Box>
                    {/* Testing OTP Display for Phone Verification */}
                    <TestingOtp 
                      testingOtp={testingOtp} 
                      setOtpValue={setOtpValue}
                      setIsDirty={setIsDirty}
                      isDarkMode={isDarkMode}
                      theme={theme}
                    />
                    {loading.verifyOtp ? (
                      <CenterBox>
                        <CircularProgress size={isMobile ? 24 : 32} />
                      </CenterBox>
                    ) : (
                      <Button
                        disabled={otpValue.length < 6}
                        fullWidth
                        variant='contained'
                        type='button'
                        component='label'
                        onClick={handleVerifyPhone}
                        sx={{
                          py: { xs: 1.25, sm: 1.5 },
                          mt: { xs: 2, sm: 3 },
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
                        Verify My Phone
                      </Button>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: { xs: 1, sm: 2 }
                      }}
                    >
                      {currStatus === 'PHONE_CODE_MISMATCH' && !isDirty && (
                        <Typography
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            color: 'error.main'
                          }}
                        >
                          Invalid Code Entered.
                        </Typography>
                      )}

                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          color: 'text.secondary',
                          textAlign: 'center'
                        }}
                      >
                        Didn&#39;t get the code?{' '}
                        <Button
                          disabled={!resendEnabled || loading.resendOtp}
                          onClick={resendOtp}
                          size={isMobile ? 'small' : 'medium'}
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                            minWidth: 'auto',
                            textTransform: 'none'
                          }}
                        >
                          {!loading.resendOtp ? `Resend OTP ${timer > 1 ? `(${timer}s)` : ''}` : 'Sending...'}
                        </Button>
                      </Typography>
                    </Box>
                  </Form>
                </Box>
              </Box>
            </Box>
          </Grid>
        )}
        <Grid item xs={12} className='flex justify-end'>
          {/* <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button> */}
          {/* <Button
            variant='contained'
            onClick={() => {
              handleNext()
            }}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Skip &
            <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
              <b>&nbsp;GO!</b>
            </span>
          </Button> */}
        </Grid>
      </Grid>
    </>
  )
}

export default PhoneDetailsStep
