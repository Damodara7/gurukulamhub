'use client'

/********** Standard imports.*********************/
import React, { useState, useRef, useTransition, useEffect } from 'react'
import { TextField, Button, FormControl, RadioGroup, Radio, FormControlLabel, FormLabel, Avatar } from '@mui/material'
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
import LoginForm from './LoginForm'
import QuickRegistrationForm from './QuickRegistrationForm'

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

const AuthForm = ({ mode, gamePin }) => {
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  // States
  const [authMode, setAuthMode] = useState('login')

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
  }

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const quizTime = '/images/illustrations/auth/quiz-time.jpg'

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      mobile: '8247783396'
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(mode, quizTime, quizTime, quizTime, quizTime)

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
      <div className=' bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='self-start'>
          <IconButtonTooltip title='Back' href='/' aria-label='back'>
            <ArrowBackIcon />
          </IconButtonTooltip>
        </div>

        <div className='flex flex-col justify-center items-center'>
          <div className='flex justify-center  text-center w-full flex-col items-center gap-2'>
            <Link href='/'>
              <Logo className='text-primary' height={98} width={95} />
            </Link>
            <Typography variant='h4' textAlign='center' className='font-semibold tracking-[0.15px]'>
              {`Welcome to ${themeConfig.templateName}!`}
            </Typography>
          </div>
          <div
            className='flex flex-col gap-2 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'
            style={{ width: '100%' }}
          >
            {authMode === 'login' ? (
              <LoginForm toggleAuthMode={toggleAuthMode} customRedirectUrl={`/game/join?gamePin=${gamePin}`} />
            ) : (
              <QuickRegistrationForm toggleAuthMode={toggleAuthMode} />
            )}
          </div>
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
    </div>
  )
}

export default AuthForm
