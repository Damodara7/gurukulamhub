import React, { useState } from 'react'
import { TextField, InputAdornment, IconButton, Grid } from '@mui/material'
import PasswordValidation from '@/views/pages/auth/register-multi-steps/PasswordValidation'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const ConfirmPassword = ({
  passwordLabel = 'Password',
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isPasswordValid,
  setIsPasswordValid,
  confirmPasswordLabel = 'Confirm Password'
}) => {
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  const handleConfirmPasswordChange = e => {
    setConfirmPassword(e.target.value)
  }

  return (
    <>
      {/* Password Validation */}
      <Grid item xs={12} sm={6}>
        <PasswordValidation
          password={password}
          setPassword={setPassword}
          isPasswordValid={isPasswordValid}
          setIsPasswordValid={setIsPasswordValid}
          canView={false}
          name={passwordLabel}
        />
      </Grid>

      {/* Confirm Password */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label={confirmPasswordLabel}
          name={confirmPasswordLabel}
          required
          value={confirmPassword}
          color={
            isPasswordValid && confirmPassword.trim() && password.trim() !== confirmPassword.trim()
              ? 'error'
              : isPasswordValid && confirmPassword.trim() && password.trim() === confirmPassword.trim()
                ? 'success'
                : ''
          }
          FormHelperTextProps={{ sx: { color: 'success.main' } }}
          onChange={handleConfirmPasswordChange}
          disabled={!isPasswordValid}
          type={isConfirmPasswordShown ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButtonTooltip title={isConfirmPasswordShown ? 'Hide' : 'Show'}
                  edge='end'
                  onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                  onMouseDown={e => e.preventDefault()}
                >
                  <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </IconButtonTooltip>
              </InputAdornment>
            )
          }}
          error={isPasswordValid && confirmPassword.trim() && password.trim() !== confirmPassword.trim()}
          helperText={
            isPasswordValid && confirmPassword.trim() && password.trim() !== confirmPassword.trim()
              ? 'Passwords do not match!'
              : isPasswordValid && confirmPassword.trim() && password.trim() === confirmPassword.trim()
                ? 'Passwords match!'
                : ''
          }
        />
      </Grid>
    </>
  )
}

export default ConfirmPassword
