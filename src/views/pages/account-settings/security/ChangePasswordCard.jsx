'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme, alpha, useMediaQuery } from '@mui/material'
import PasswordValidation from '../../auth/register-multi-steps/PasswordValidation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import SetPasswordCard from './SetPasswordCard'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Fetch profile data
// async function fetchDoesProfileHasPassword(email) {
//   const result = await RestApi.get(`${ApiUrls.v0.USER}/${email}/does-password-exist`)
//   return result
// }

// Update profile password
async function updatePassword(email, currentPassword, newPassword) {
  const result = await RestApi.put(`${ApiUrls.v0.USER}/${email}/change-password`, {
    newPassword: newPassword,
    currentPassword
  })
  return result
}

const ChangePasswordCard = ({ onChangePassword, email }) => {
  const { status, data: session } = useSession()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  // const [hasPassword, setHasPassword] = useState(doesPasswordExist)
  // const [refetchProfile, setRefetchProfile] = useState(false)

  // useEffect(() => {
  //   async function fetchFunction() {
  //     const doesPasswordExist = await fetchDoesProfileHasPassword(session.user.email)
  //     console.log('Does profile has password: ', doesPasswordExist)
  //     if (doesPasswordExist) {
  //       setHasPassword(true)
  //     } else {
  //       setHasPassword(false)
  //     }
  //   }
  //   if (status === 'authenticated' && session?.user?.email) {
  //     fetchFunction()
  //   }
  // }, [status, session, refetchProfile])

  function handleReset() {
    setCurrentPassword('')
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

    // if (hasPassword) {
    // Update password if current password is available
    const updateResponse = await updatePassword(email, currentPassword, newPassword)
    if (updateResponse?.status === 'success') {
      toast.success(updateResponse?.message || 'Password updated successfully')
      onChangePassword()
      handleReset()
    } else {
      toast.error(updateResponse?.message || 'Failed to update password')
    }
    // }
  }

  // if (!hasPassword) {
  //   return <SetPasswordCard email={session?.user?.email} setRefetchProfile={setRefetchProfile} />
  // }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label='Current Password'
            name='Current Password'
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            type={'password'}
            InputProps={
              {
                // endAdornment: (
                //   <InputAdornment position='end'>
                //     <IconButtonTooltip title=''
                //       edge='end'
                //       onClick={handleClickShowCurrentPassword}
                //       onMouseDown={e => e.preventDefault()}
                //     >
                //       <i className={isCurrentPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                //     </IconButtonTooltip>
                //   </InputAdornment>
                // )
              }
            }
          />
        </Grid>
      </Grid>
      <Grid container className='mbs-0' spacing={5}>
        <Grid item xs={12} sm={6}>
          <PasswordValidation
            password={newPassword}
            setPassword={setNewPassword}
            isPasswordValid={isPasswordValid}
            setIsPasswordValid={setIsPasswordValid}
            canView={false}
            name={'New Password'}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
        {/* <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6' color='text.secondary'>
                Password Requirements:
              </Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  Minimum 8 characters long - the more, the better
                </div>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  At least one lowercase & one uppercase character
                </div>
                <div className='flex items-center gap-2.5 text-textSecondary'>
                  <i className='ri-checkbox-blank-circle-fill text-[8px]' />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid> */}
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2 }
          }}
        >
          <Button
            disabled={
              !currentPassword.trim() ||
              !isPasswordValid ||
              !confirmPassword.trim() ||
              newPassword.trim() !== confirmPassword.trim()
            }
            variant='contained'
            onClick={handleSubmit}
            type='submit'
            fullWidth={isMobile}
            sx={{
              color: 'white',
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderRadius: { xs: 1.5, sm: 2 },
              boxShadow: isDarkMode ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : undefined,
              '&:hover': {
                boxShadow: isDarkMode ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}` : undefined
              }
            }}
            component='label'
          >
            Save Changes
          </Button>
          <Button
            onClick={handleReset}
            variant='outlined'
            type='reset'
            color='secondary'
            fullWidth={isMobile}
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderRadius: { xs: 1.5, sm: 2 },
              ...(isDarkMode && {
                borderColor: alpha(theme.palette.divider, 0.3),
                '&:hover': {
                  borderColor: alpha(theme.palette.secondary.main, 0.5),
                  backgroundColor: alpha(theme.palette.secondary.main, 0.08)
                }
              })
            }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default ChangePasswordCard
