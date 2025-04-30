import * as React from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

function CircularProgressWithLabel(props) {
  let progressColor = 'error'
  if (props.value === 100) {
    progressColor = 'success'
  } else if (props.value >= 50 && props.value < 75) {
    progressColor = 'warning'
  } else if (props.value >= 75) {
    progressColor = 'info'
  }
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        thickness={props.thickness}
        variant='determinate'
        {...props}
        size={props.size}
        color={progressColor}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant='caption' fontSize={props.fontSize} component='div' color={props.textcolor}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired
}

export default function CircularProgressWithValueLabel(props) {
  return <CircularProgressWithLabel {...props} />
}
