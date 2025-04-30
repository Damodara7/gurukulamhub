// MUI Imports
/********** Standard imports.*********************/
import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, FormControl, RadioGroup, Radio, FormControlLabel, Link, Box } from '@mui/material'
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
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <div style={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Typography fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
              @Phone
            </Typography>
          </div>
        </Grid>

        <Grid item xs={12}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Typography fontSize={16} color={'blueviolet'}>
              {`“To receive updates on live games, quizzes, events, and more in the Gurukulhub app.”`}
            </Typography>
          </div>
        </Grid>
        <Grid style={{ margin: 'auto' }} item xs={12} sm={6} md={6}>
          <PhoneInput
            countryCodeEditable={false}
            inputStyle={{ width: '100%', height: '3rem' }}
            enableSearch={true}
            country='in'
            value={phoneInput}
            onChange={handlePhoneInputChange}
          />
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
                //disabled={errors.firstName || errors.lastName || lastName.length < 1 || firstName.length < 1}
              >
                <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
                  <b>GO!</b>
                </span>
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
              <div style={{ display: 'flex', gap: '4px', margin: 'auto', justifyContent: 'center' }}>
                <div className='flex flex-col gap-3'>
                  <div className='flex flex-col gap-1'>
                    {/* <Typography variant='h4'>Two Step Verification 💬</Typography> */}
                    <Typography>We have sent a verification code to your phone.</Typography>
                  </div>
                  <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
                    <CenterBox>
                      <Typography>Type in your 6 digit security code </Typography>
                    </CenterBox>
                    <CenterBox>
                      <OtpForm
                        setOtpValue={setOtpValue}
                        otpValue={otpValue}
                        currStatus={currStatus}
                        setIsDirty={setIsDirty}
                      />
                    </CenterBox>
                    {loading.verifyOtp ? (
                      <CenterBox>
                        <CircularProgress />{' '}
                      </CenterBox>
                    ) : (
                      <Button
                        disabled={otpValue.length < 6}
                        fullWidth
                        variant='contained'
                        type='button'
                        component='label'
                        style={{ color: 'white' }}
                        onClick={handleVerifyPhone}
                      >
                        Verify My Phone
                      </Button>
                    )}
                    <div className='flex justify-center flex-col items-center flex-wrap gap-2'>
                      <Typography hidden={currStatus != 'PHONE_CODE_MISMATCH' || isDirty} color={'red'}>
                        {' '}
                        Invalid Code Entered.
                      </Typography>

                      <Typography>
                        Didn&#39;t get the code?{' '}
                        <Button disabled={!resendEnabled} onClick={resendOtp}>
                          {!loading.resendOtp ? `Resend OTP ${timer > 1 ? `(${timer}s)`: ''}` : 'Sending...'}
                        </Button>{' '}
                      </Typography>
                    </div>
                  </Form>
                </div>
              </div>
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
