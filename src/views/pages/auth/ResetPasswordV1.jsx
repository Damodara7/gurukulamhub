'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@core/svg/Logo'
import Illustrations from '@components/Illustrations'
import PasswordValidation from '@/views/pages/auth/register-multi-steps/PasswordValidation'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useTheme } from '@mui/material'
import IconButtonTooltip from '@/components/IconButtonTooltip'

async function resetPassword(email, token, password) {
  const result = await RestApi.put(`${API_URLS.v0.USER}/reset-password?email=${email}&token=${token}`, { password })
  return result
}
async function isValidResetPasswordLink(email, token) {
  const result = await RestApi.get(`${API_URLS.v0.USER}/reset-password?email=${email}&token=${token}`)
  return result
}

const ResetPasswordV1 = ({ mode }) => {
  const theme = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  // States
  const [isLoading, setIsLoading] = useState(true)
  const [isValidLink, setIsValidLink] = useState(null)
  const [error, setError] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'

  useEffect(() => {
    async function fetchIsValidLink() {
      setIsLoading(true)
      try {
        const isValidLinkResult = await isValidResetPasswordLink(email, token)
        if (isValidLinkResult.status === 'success') {
          {
            setIsValidLink(true)
          }
        }
        if (isValidLinkResult.status === 'error') {
          setIsValidLink(false)
          setError(isValidLinkResult.message)
        }
      } catch (error) {
        setIsValidLink(false)
        setError(error.message)
      }
      setIsLoading(false)
    }
    fetchIsValidLink()
  }, [email, token])

  function handleReset() {
    setNewPassword('')
    setConfirmPassword('')
    setIsPasswordValid(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    const response = await resetPassword(email, token, newPassword)
    if (response.status === 'success') {
      toast.success('Password reset successfully.')
      handleReset()
      router.push('/auth/login')
    } else {
      toast.error('Failed to reset password.')
    }
  }
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  if (!email || !token) {
    return (
      <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
        <Alert
          severity=''
          icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
          color='error'
          className='!p-4 max-w-[450px] '
        >
          <Typography variant='h6'>Invalid Link</Typography>
          <Typography variant='subtitle2'>
            The reset password link is invalid. Please request a{' '}
            <Link
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: theme.palette.primary.dark
              }}
              href={`/forgot-password?email=${email}&token=${token}`}
            >
              new link to reset password.
            </Link>
          </Typography>
        </Alert>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      {isLoading ? (
        <CircularProgress />
      ) : isValidLink && !error ? (
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='!p-12'>
            <div className='flex justify-center items-center gap-3 mbe-6'>
              <Logo className='bs-8 text-primary' height={28} width={35} />
              <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
                {themeConfig.templateName}
              </Typography>
            </div>
            <Typography variant='h6' className='text-center' color='primary'>{email}</Typography>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'>
                Your new password must be different from previously used passwords
              </Typography>
              <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <PasswordValidation
                      password={newPassword}
                      setPassword={setNewPassword}
                      isPasswordValid={isPasswordValid}
                      setIsPasswordValid={setIsPasswordValid}
                      canView={false}
                      name={'New Password'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Confirm New Password'
                      name='Confirm New Password'
                      required
                      value={confirmPassword}
                      color={
                        isPasswordValid && confirmPassword.trim() && newPassword.trim() !== confirmPassword.trim()
                          ? 'error'
                          : isPasswordValid && confirmPassword.trim() && newPassword.trim() === confirmPassword.trim()
                            ? 'success'
                            : ''
                      }
                      FormHelperTextProps={{ sx: { color: 'success.main' } }}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={!isPasswordValid}
                      type={isConfirmPasswordShown ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButtonTooltip title={isConfirmPasswordShown ? 'Hide':'Show'}
                              edge='end'
                              onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButtonTooltip>
                          </InputAdornment>
                        )
                      }}
                      error={isPasswordValid && confirmPassword.trim() && newPassword.trim() !== confirmPassword.trim()}
                      helperText={
                        isPasswordValid && confirmPassword.trim() && newPassword.trim() !== confirmPassword.trim()
                          ? 'Passwords not matched!'
                          : isPasswordValid && confirmPassword.trim() && newPassword.trim() === confirmPassword.trim()
                            ? 'Passwords matched!'
                            : ''
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      disabled={
                        !isPasswordValid || !confirmPassword.trim() || newPassword.trim() !== confirmPassword.trim()
                      }
                      fullWidth
                      sx={{color: 'white'}}
                      variant='contained'
                      type='submit'
                    >
                      Reset Password
                    </Button>
                  </Grid>
                </Grid>
                <Typography className='flex justify-center items-center' color='primary'>
                  <Link href={'/login'} className='flex items-center gap-1.5'>
                    <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                    <span>Back to Login</span>
                  </Link>
                </Typography>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert
          severity=''
          icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
          color='error'
          className='!p-4 max-w-[450px] '
        >
          <Typography variant='h6'>Invalid or Expired Link</Typography>
          <Typography variant='subtitle2'>
            The reset password link is either invalid or has expired. Please request a{' '}
            <Link
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: theme.palette.primary.dark
              }}
              href={`/forgot-password?email=${email}&token=${token}`}
            >
              new link to reset password.
            </Link>
          </Typography>
        </Alert>
      )}
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default ResetPasswordV1
