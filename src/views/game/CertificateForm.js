import React, { useState } from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  FormGroup,
  FormLabel,
  FormControl,
  FormHelperText,
  Grid
} from '@mui/material'

const CertificateForm = ({ readonly = false }) => {
  // State to manage form inputs and visibility
  const [showMeritFields, setShowMeritFields] = useState(false)
  const [formValues, setFormValues] = useState({
    minQuestions: '',
    minScoreParticipant: '',
    minScorePass: '',
    minScoreMerit: '',
    showScore: false,
    showRank: false
  })

  // Handle form change
  const handleInputChange = event => {
    const { name, value, type, checked } = event.target
    setFormValues(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <Box sx={{ padding: 3, marginTop: 1 }}>
      <FormControl component='fieldset' fullWidth>
        <FormGroup>
          {/* Checkbox for Merit Certificate Issue */}
          <FormControlLabel
            control={
              <Checkbox
                disabled={readonly}
                checked={showMeritFields}
                onChange={() => setShowMeritFields(!showMeritFields)}
              />
            }
            label='Issue Merit Certificate '
          />
        </FormGroup>

        {/* Conditional fields when Merit Certificate is selected */}
        {showMeritFields && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                {/* Participant Certificate Conditions */}
                <FormLabel component='legend' sx={{ mt: 2 }}>
                  Participant Certificate Conditions
                </FormLabel>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name='minQuestions'
                  label='Minimum Questions to Attempt'
                  variant='outlined'
                  fullWidth
                  value={formValues.minQuestions}
                  onChange={handleInputChange}
                  InputProps={{readOnly: readonly}}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name='minScoreParticipant'
                  label='Minimum Score for Participant Certificate'
                  variant='outlined'
                  fullWidth
                  value={formValues.minScoreParticipant}
                  onChange={handleInputChange}
                  InputProps={{readOnly: readonly}}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} md={12} sx={{ marginBottom: 5 }}>
              {/* Pass Certificate Conditions */}
              <FormLabel component='legend' sx={{ mt: 3 }}>
                Pass Certificate Conditions
              </FormLabel>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name='minScorePass'
                  label='Minimum Score for Pass Certificate'
                  variant='outlined'
                  fullWidth
                  value={formValues.minScorePass}
                  onChange={handleInputChange}
                  InputProps={{readOnly: readonly}}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              {/* Merit Certificate Conditions */}
              <FormLabel component='legend' sx={{ mt: 3 }}>
                Merit Certificate Conditions
              </FormLabel>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name='minScoreMerit'
                  label='Minimum Score for Merit Certificate'
                  variant='outlined'
                  fullWidth
                  value={formValues.minScoreMerit}
                  onChange={handleInputChange}
                  InputProps={{readOnly: readonly}}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {/* Checkbox to Show Rank */}
                <FormControlLabel
                  control={<Checkbox disabled={readonly} checked={formValues.showRank} onChange={handleInputChange} name='showRank' />}
                  label='Show Rank '
                />
                {/* Checkbox to Show Score */}
                <FormControlLabel
                  control={<Checkbox disabled={readonly} checked={formValues.showScore} onChange={handleInputChange} name='showScore' />}
                  label='Show Score'
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* Helper text when Merit Certificate is not selected */}
        {!showMeritFields && !readonly && (
          <FormHelperText>Select Merit Certificate Issue to display additional conditions.</FormHelperText>
        )}
      </FormControl>
    </Box>
  )
}
export default CertificateForm
