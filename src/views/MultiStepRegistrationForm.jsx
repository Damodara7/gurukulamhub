'use client'

// React Imports
// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
// Component Imports
import StepperWrapper from '@core/styles/stepper'
//import StepperCustomDot from '@views/forms/form-wizard/StepperCustomDot'
import Logo from '@core/svg/Logo'
import { useTheme } from '@mui/material/styles'
// Third-party Imports
import classnames from 'classnames'
import { useState } from 'react'
import EmailStep from './01EmailStep'
import NameInfoStep from './02NameInfoStep'
import AccountInfoStep from './AccountInfoStep'
import ReferralDetails from './03ReferralDetails'
import StepCountryZipInfo from './04CountryZipStep'
import AddressInfoStep from './05AddressInfoStep'
import PhoneDetailsStep from './06PhoneDetailsStep'
import { toast, ToastContainer } from 'react-toastify'
import themeConfig from '@/configs/themeConfig'
import { Typography } from '@mui/material'

const adminGetUser = ({ userPoolId, username, region }) => {
  const client = new CognitoIdentityProviderClient(config)

  const command = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: username,
    Region: region
  })

  return client.send(command)
}

const MultiStepRegistrationForm = ({ gamePin = null }) => {
  var signupStates = [
    '01_SIGNUP_EMAIL_ENTERING',
    'CONFIRM_SIGN_UP',
    '01_ERROR_SENDING_OTP',
    '01_ERROR_USER_EXISTS',
    '01_SIGNUP_SENT_OTP_PASS',
    '01_SIGNUP_RESEND_OTP',
    '02_VERIFICATION_PENDING',
    '02_VERIFICATION_RESENT_CODE',
    '02_VERIFICATION_FAIL',
    '02_VERIFICATION_PASS',
    'SIGNUP_COMPLETE',
    'SIGNED_IN_PASS',
    'SIGNED_IN_FAIL'
  ]
  // States
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  // Current State of Signup.
  const [currStatus, setCurrStatus] = useState(signupStates[0])

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()

  // Handle Stepper
  const handleNext = () => {
    console.log('going to next step...', activeStep)
    setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    if (activeStep !== 0) {
      setActiveStep(activeStep - 1)
    }
  }

  // Vars
  const steps = [
    {
      title: 'Account',
      subtitle: 'Account Details'
    },
    {
      title: 'Personal',
      subtitle: 'Enter Information'
    },
    {
      title: 'Billing',
      subtitle: 'Payment Details'
    },
    {
      title: 'Country Zip',
      subtitle: 'Country ZipCode Details'
    }
  ]

  function onFailure(err) {
    if (err.code == 'UserNotConfirmedException') {
      // Not confirmed
      console.log('UserNotConfirmed......')
    } else if (err.code == 'PasswordResetRequiredException') {
      // Reset Password Required
    } else if (err.code == 'NotAuthorizedException') {
      // Not Authorised (Incorrect Password)
    } else if (err.code == 'ResourceNotFoundException') {
      // User Not found
    } else {
      // Unknown
      console.log('unkonow exception.........', err.code)
    }
  }

  async function handleSignUp({ email, password }) {
    var username = email

    var userStatus = 'UNKNOWN'
    try {
      var result = await adminGetUser({ userPoolId, username, region })
      console.log('REsult ', result)
      userStatus = result.UserStatus
    } catch (error) {
      console.log('errro', error)
    }

    if (userStatus === 'UNCONFIRMED') {
      setCurrStatus('CONFIRM_SIGN_UP')
      // alert("Confirm sign up status....");
      return true
    } else if (userStatus === 'CONFIRMED') {
      setCurrStatus('CONFIRMED')
      // handleNext();
      setCurrStatus('USER_ALREADY_EXISTS')

      return true
      //alert("User Already registered please signIn");
    }

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username
          },
          // optional
          autoSignIn: false, // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
          authFlowType: 'USER_SRP_AUTH'
        }
      })

      console.log(userId, ' NEXT:', nextStep, ' COMPLETE?', isSignUpComplete)
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setCurrStatus('CONFIRM_SIGN_UP')
        return true
      }
    } catch (error) {
      // onFailure(error);

      if (error.message === 'User already exists') {
        console.log(`User with username ${username} already exists`)
        // toast.error('User already exists')
        setCurrStatus('USER_ALREADY_EXISTS')
        return false
      } else {
        console.error('Error:', error)
        return false
        //throw error;
      }
    }
  }

  const getStepContent = (step, totalSteps, handleNext, handlePrev, email, setEmail, currStatus, setCurrStatus) => {
    switch (step) {
      case 0:
        return (
          <EmailStep
            activeStep={step}
            stepIndex={step + 1}
            setEmail={setEmail}
            email={email}
            totalSteps={totalSteps}
            handleNext={handleNext}
            signUp={handleSignUp}
            currStatus={currStatus}
            setCurrStatus={setCurrStatus}
          />
        )
      case 1:
        return (
          <AccountInfoStep
            activeStep={step}
            setActiveStep={setActiveStep}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            email={email}
            currStatus={currStatus}
            setCurrStatus={setCurrStatus}
          />
        )
      case 2:
        return (
          <NameInfoStep
            activeStep={step}
            setActiveStep={setActiveStep}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            firstName={firstName}
            setFirstName={setFirstName}
            email={email}
          />
        )
      case 3:
        return (
          <ReferralDetails
            activeStep={step}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            email={email}
            setActiveStep={setActiveStep}
          />
        )
      case 4:
        return (
          <StepCountryZipInfo
            activeStep={step}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            email={email}
            setActiveStep={setActiveStep}
          />
        )
      case 5:
        return (
          <AddressInfoStep
            activeStep={step}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            currStatus={currStatus}
            setCurrStatus={setCurrStatus}
            email={email}
            setActiveStep={setActiveStep}
          />
        )
      case 6:
        return (
          <PhoneDetailsStep
            activeStep={step}
            stepIndex={step + 1}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrev={handlePrev}
            currStatus={currStatus}
            setCurrStatus={setCurrStatus}
            firstName={firstName}
            email={email}
            setActiveStep={setActiveStep}
          />
        )

      default:
        return null
    }
  }

  async function handleSignInUser({ username, password }) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password })
    } catch (error) {
      console.log('error signing in', error)
    }
  }

  async function handleResendSignUpCode(username) {
    try {
      await resendSignUpCode(username)
    } catch (error) {
      console.log('error resending registration code', error)
    }
  }

  return (
    <StepperWrapper className='p-5 sm:p-8  is-[700px] mt-6'>
      <div style={{ minHeight: '60px' }}></div>
      {currStatus ? (
        getStepContent(activeStep, steps.length, handleNext, handlePrev, email, setEmail, currStatus, setCurrStatus)
      ) : (
        <></>
      )}
    </StepperWrapper>
  )
}

export default MultiStepRegistrationForm
