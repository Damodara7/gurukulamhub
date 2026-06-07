'use client'

import { TextField, MenuItem, InputAdornment, useTheme } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { WEIGHTAGE_OPTIONS } from '@/utils/quizPointsUtil'

const QuestionWeightageField = ({
  value,
  onChange,
  disabled = false,
  error = false,
  label = 'Weightage (1-10)',
  helperText = 'Sum of this value across all questions = quiz points',
  fullWidth = true
}) => {
  const theme = useTheme()

  return (
    <TextField
      disabled={disabled}
      label={label}
      select
      fullWidth={fullWidth}
      value={value ?? 1}
      onChange={e => onChange(Number(e.target.value || 1))}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <StarIcon sx={{ fontSize: 20, color: 'warning.main' }} />
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: theme.palette.background.paper,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.warning.main
          }
        }
      }}
    >
      {WEIGHTAGE_OPTIONS.map(option => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default QuestionWeightageField
