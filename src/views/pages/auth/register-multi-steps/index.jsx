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
import NameInfoStep from './03NameInfoStep'
import AccountInfoStep from './AccountInfoStep'
import AccountTypeStep from './00AccountTypeStep'
import ReferralDetails from './04ReferralDetails'
import StepCountryZipInfo from './05CountryZipStep'
import AddressInfoStep from './06AddressInfoStep'
import PhoneDetailsStep from './02PhoneDetailsStep'
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

const RegisterMultiSteps = ({ gamePin = null, referralToken = null }) => {
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
  const [dataFromAccountTypeStep, setDataFromAccountType] = useState(null)
  const [dataFromEmailStep, setDataFromEmail] = useState(null)

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

  async function onSubmitAccountTypeStep(data) {
    setDataFromAccountType(data)
    handleNext()
  }
  async function onSubmitEmailStep(data) {
    setDataFromEmail(data)
    handleNext()
  }

  // Vars
  const steps = [
    { component: AccountTypeStep, name: 'AccountTypeStep' },
    { component: EmailStep, name: 'EmailStep' },
    { component: PhoneDetailsStep, name: 'PhoneDetailsStep' },
    // { component: AccountInfoStep, name: 'AccountInfoStep' },
    { component: NameInfoStep, name: 'NameInfoStep' },
    ...(referralToken ? [] : [{ component: ReferralDetails, name: 'ReferralDetails' }]),
    { component: StepCountryZipInfo, name: 'StepCountryZipInfo' },
    { component: AddressInfoStep, name: 'AddressInfoStep' }
  ]

  const getStepContent = (
    step,
    totalSteps,
    handleNext,
    handlePrev,
    email,
    setEmail,
    currStatus,
    setCurrStatus,
    setActiveStep,
    onSubmitAccountTypeStep,
    dataFromAccountTypeStep,
    onSubmitEmailStep,
    dataFromEmailStep
    // firstName,
    // setFirstName
  ) => {
    const stepDetails = steps[step]
    if (!stepDetails) return null

    const StepComponent = stepDetails.component
    return (
      <StepComponent
        activeStep={step}
        stepIndex={step + 1}
        totalSteps={totalSteps}
        handleNext={handleNext}
        handlePrev={handlePrev}
        email={email}
        setEmail={setEmail}
        currStatus={currStatus}
        setCurrStatus={setCurrStatus}
        setActiveStep={setActiveStep}
        // firstName={firstName}
        // setFirstName={setFirstName}
        gamePin={gamePin}
        onSubmitAccountTypeStep={onSubmitAccountTypeStep}
        dataFromAccountTypeStep={dataFromAccountTypeStep}
        onSubmitEmailStep={onSubmitEmailStep}
        dataFromEmailStep={dataFromEmailStep}
      />
    )
  }

  return (
    <div className='flex bs-full justify-between items-center'>
      {/* <ToastContainer> </ToastContainer> */}
      <div
        className={classnames('flex bs-full items-center justify-center is-[594px] max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <img
          src='/images/illustrations/characters/manWithHourGlass.png'
          alt='multi-steps-character'
          className={classnames('mis-[72px] bs-auto max-bs-[500px] max-is-full', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </div>
      <div className='flex justify-center items-center  bs-full is-full bg-backgroundPaper'>
        <div
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
          style={{ marginBottom: '10px', marginRight: '0px' }}
        >
          <div className='flex justify-center items-center gap-3 mbe-6'>
            <Logo className='text-primary ' height={28} width={35} />
            <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
              {themeConfig.templateName}
            </Typography>
          </div>
        </div>
        <StepperWrapper className='p-5 sm:p-8  is-[700px] mt-6'>
          <div style={{ minHeight: '60px' }}></div>
          {currStatus ? (
            getStepContent(
              activeStep,
              steps.length,
              handleNext,
              handlePrev,
              email,
              setEmail,
              currStatus,
              setCurrStatus,
              setActiveStep,
              onSubmitAccountTypeStep,
              dataFromAccountTypeStep,
              onSubmitEmailStep,
              dataFromEmailStep
            )
          ) : (
            <></>
          )}
        </StepperWrapper>
      </div>
    </div>
  )
}

export default RegisterMultiSteps

// function onFailure(err) {
//   if (err.code == 'UserNotConfirmedException') {
//     // Not confirmed
//     console.log('UserNotConfirmed......')
//   } else if (err.code == 'PasswordResetRequiredException') {
//     // Reset Password Required
//   } else if (err.code == 'NotAuthorizedException') {
//     // Not Authorised (Incorrect Password)
//   } else if (err.code == 'ResourceNotFoundException') {
//     // User Not found
//   } else {
//     // Unknown
//     console.log('unkonow exception.........', err.code)
//   }
// }

// async function handleSignUp({ email, password }) {
//   var username = email

//   var userStatus = 'UNKNOWN'
//   try {
//     var result = await adminGetUser({ userPoolId, username, region })
//     console.log('REsult ', result)
//     userStatus = result.UserStatus
//   } catch (error) {
//     console.log('errro', error)
//   }

//   if (userStatus === 'UNCONFIRMED') {
//     setCurrStatus('CONFIRM_SIGN_UP')
//     // alert("Confirm sign up status....");
//     return true
//   } else if (userStatus === 'CONFIRMED') {
//     setCurrStatus('CONFIRMED')
//     // handleNext();
//     setCurrStatus('USER_ALREADY_EXISTS')

//     return true
//     //alert("User Already registered please signIn");
//   }

//   try {
//     const { isSignUpComplete, userId, nextStep } = await signUp({
//       username,
//       password,
//       options: {
//         userAttributes: {
//           email: username
//         },
//         // optional
//         autoSignIn: false, // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
//         authFlowType: 'USER_SRP_AUTH'
//       }
//     })

//     console.log(userId, ' NEXT:', nextStep, ' COMPLETE?', isSignUpComplete)
//     if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
//       setCurrStatus('CONFIRM_SIGN_UP')
//       return true
//     }
//   } catch (error) {
//     // onFailure(error);

//     if (error.message === 'User already exists') {
//       console.log(`User with username ${username} already exists`)
//       // toast.error('User already exists')
//       setCurrStatus('USER_ALREADY_EXISTS')
//       return false
//     } else {
//       console.error('Error:', error)
//       return false
//       //throw error;
//     }
//   }
// }

// const getStepContent = (step, totalSteps, handleNext, handlePrev, email, setEmail, currStatus, setCurrStatus) => {
//   switch (step) {
//     case 0:
//       return (
//         <EmailStep
//           activeStep={step}
//           stepIndex={step + 1}
//           setEmail={setEmail}
//           email={email}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           signUp={handleSignUp}
//           currStatus={currStatus}
//           setCurrStatus={setCurrStatus}
//           gamePin={gamePin}
//         />
//       )
//     case 1:
//       return (
//         <AccountInfoStep
//           activeStep={step}
//           setActiveStep={setActiveStep}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           email={email}
//           currStatus={currStatus}
//           setCurrStatus={setCurrStatus}
//         />
//       )
//     case 2:
//       return (
//         <NameInfoStep
//           activeStep={step}
//           setActiveStep={setActiveStep}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           firstName={firstName}
//           setFirstName={setFirstName}
//           email={email}
//         />
//       )
//     case 3:
//       return (
//         <ReferralDetails
//           activeStep={step}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           email={email}
//           setActiveStep={setActiveStep}
//         />
//       )
//     case 4:
//       return (
//         <StepCountryZipInfo
//           activeStep={step}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           email={email}
//           setActiveStep={setActiveStep}
//         />
//       )
//     case 5:
//       return (
//         <AddressInfoStep
//           activeStep={step}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           currStatus={currStatus}
//           setCurrStatus={setCurrStatus}
//           email={email}
//           setActiveStep={setActiveStep}
//         />
//       )
//     case 6:
//       return (
//         <PhoneDetailsStep
//           activeStep={step}
//           stepIndex={step + 1}
//           totalSteps={totalSteps}
//           handleNext={handleNext}
//           handlePrev={handlePrev}
//           currStatus={currStatus}
//           setCurrStatus={setCurrStatus}
//           firstName={firstName}
//           email={email}
//           setActiveStep={setActiveStep}
//           gamePin={gamePin}
//         />
//       )

//     default:
//       return null
//   }
// }

// async function handleSignInUser({ username, password }) {
//   try {
//     const { isSignedIn, nextStep } = await signIn({ username, password })
//   } catch (error) {
//     console.log('error signing in', error)
//   }
// }

// async function handleResendSignUpCode(username) {
//   try {
//     await resendSignUpCode(username)
//   } catch (error) {
//     console.log('error resending registration code', error)
//   }
// }
