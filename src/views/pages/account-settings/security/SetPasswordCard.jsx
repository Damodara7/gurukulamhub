'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import PasswordValidation from '../../auth/register-multi-steps/PasswordValidation'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Update profile password
async function setPassword(email, password) {
  const result = await RestApi.put(`${ApiUrls.v0.USER}/${email}/set-password`, { password })
  return result
}

const SetPasswordCard = ({ email, onSetPassword }) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  function handleReset() {
    setNewPassword('')
    setConfirmPassword('')
    setIsPasswordValid(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      // toast.error('Passwords do not match!')
      return
    }

    const response = await setPassword(email, newPassword)
    if (response.status === 'success') {
      toast.success(response.message || 'Password set successfully')
      onSetPassword()
      handleReset()
    } else {
      toast.error(response.message ||'Failed to set password')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={6}>
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
        <Grid item xs={12} className='flex gap-4'>
          <Button
            disabled={!isPasswordValid || !confirmPassword.trim() || newPassword.trim() !== confirmPassword.trim()}
            variant='contained'
            type='submit'
            onClick={handleSubmit}
            style={{color: 'white'}}
            component='label'
          >
            Save Changes
          </Button>
          <Button onClick={handleReset} variant='outlined' type='reset' color='secondary'>
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default SetPasswordCard
