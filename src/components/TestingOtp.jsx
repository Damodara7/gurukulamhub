import React from 'react'
import { Box, Typography, IconButton, Tooltip, useTheme, alpha } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { toast } from 'react-toastify'

/**
 * Reusable Testing OTP Component
 * Displays the testing OTP with a copy icon that copies to clipboard and fills the OTP form
 * 
 * @param {string} testingOtp - The testing OTP value to display
 * @param {function} setOtpValue - Function to set the OTP value in the form (optional)
 * @param {function} setIsDirty - Function to mark the form as dirty (optional)
 * @param {boolean} isDarkMode - Whether dark mode is enabled (optional, will use theme if not provided)
 * @param {object} theme - MUI theme object (optional, will use useTheme hook if not provided)
 */
const TestingOtp = ({ 
  testingOtp, 
  setOtpValue, 
  setIsDirty,
  isDarkMode,
  theme: themeProp
}) => {
  // Use theme hook if theme prop is not provided
  const themeHook = useTheme()
  const theme = themeProp || themeHook
  const isDark = isDarkMode !== undefined ? isDarkMode : theme.palette.mode === 'dark'

  const handleCopy = async () => {
    if (!testingOtp) return

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(testingOtp)
      toast.success('OTP copied to clipboard!')

      // Fill the OTP form if setOtpValue is provided
      if (setOtpValue) {
        setOtpValue(testingOtp)
        // Mark form as dirty if setIsDirty is provided
        if (setIsDirty) {
          setIsDirty(true)
        }
      }
    } catch (err) {
      console.error('Failed to copy OTP:', err)
      toast.error('Failed to copy OTP')
    }
  }

  // Don't render if testingOtp is not provided or TEST_MODE is not enabled
  if (!testingOtp || process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    return null
  }

  return (
    <Box
      sx={{
        bgcolor: isDark
          ? alpha(theme.palette.info.main, 0.15)
          : alpha(theme.palette.info.light, 0.2),
        border: `1px solid ${isDark ? alpha(theme.palette.info.main, 0.3) : alpha(theme.palette.info.main, 0.4)}`,
        borderRadius: { xs: 1, sm: 1.5 },
        p: 1,
        my: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography
          variant='body2'
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          <strong>Testing OTP:</strong> {testingOtp}
        </Typography>
        <Tooltip title='Copy OTP'>
          <IconButton
            size='small'
            onClick={handleCopy}
            sx={{
              color: 'text.primary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ContentCopyIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default TestingOtp

