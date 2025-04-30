import React, { useState } from 'react'
import { Grid, Typography, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import ReferralSourceForm from '@/components/auth/register-multi-steps/ReferralSourceForm'
import ReferrerDetailsForm from '@/components/auth/register-multi-steps/ReferrerDetailsForm'

const ReferralDetailsStep = ({ handlePrev, handleNext, totalSteps, activeStep, stepIndex, email }) => {
  const [referred, setReferred] = useState('yes')

  const handleReferredChange = event => {
    setReferred(event.target.value)
  }

  function onSuccess() {
    handleNext()
  }

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <div style={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
          <Typography fontSize={30} fontStyle='italic' color='#6066d0'>
            @Referral
          </Typography>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Typography>Have you been referred by anyone?</Typography>
        <FormControl component='fieldset'>
          <RadioGroup name='referred' value={referred} onChange={handleReferredChange}>
            <FormControlLabel value='yes' control={<Radio />} label='Yes' />
            <FormControlLabel value='no' control={<Radio />} label='No' />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        {referred === 'yes' ? (
          <ReferrerDetailsForm email={email} onSuccess={onSuccess} />
        ) : (
          <ReferralSourceForm email={email} onSuccess={onSuccess} />
        )}
      </Grid>
    </Grid>
  )
}

export default ReferralDetailsStep
