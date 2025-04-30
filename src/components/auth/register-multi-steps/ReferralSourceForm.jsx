import React, { useState } from 'react'
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const ReferralSourceForm = ({ email, onSuccess }) => {
  const [referralSource, setReferralSource] = useState('')
  const [referralSourceDetails, setReferralSourceDetails] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!referralSource) {
      newErrors.referralSource = 'Please select a referral source'
    }

    if (referralSource === 'Other' && !referralSourceDetails.trim()) {
      newErrors.referralSourceDetails = 'Please specify details for the "Other" referral source'
    }

    if (referralSource === 'Social Media' && !referralSourceDetails) {
      newErrors.referralSourceDetails = 'Please select a platform for Social Media'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    const formData = {
      referralSource,
      ...(referralSource === 'Other' && { referralSourceDetails }),
      ...(referralSource === 'Social Media' && { referralSourceDetails }),
    }

    console.log('Form Data:', formData)
    try {
      const result = await RestApi.put(API_URLS.v0.USER, {
        email,
        ...formData,
      })
      if (result?.status === 'success') {
        toast.success('Referral source details updated successfully')
        onSuccess?.()
      } else {
        console.error(result?.message)
        toast.error(result?.message || 'Failed to update referral source details')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to update referral source details. Please try again')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        How Did You Hear About Us?
      </Typography>

      {/* Referral Source Dropdown */}
      <TextField
        label="Select a referral source"
        select
        fullWidth
        value={referralSource}
        onChange={(e) => {
          setReferralSource(e.target.value)
          setReferralSourceDetails('') // Reset details when referral source changes
        }}
        error={Boolean(errors.referralSource)}
        helperText={errors.referralSource}
        sx={{ mb: 4 }}
      >
        <MenuItem value="">Select an option</MenuItem>
        <MenuItem value="Social Media">Social Media</MenuItem>
        <MenuItem value="Search Engine">Search Engine</MenuItem>
        <MenuItem value="Online Advertisement">Online Advertisement</MenuItem>
        <MenuItem value="Friend or Family">Friend or Family</MenuItem>
        <MenuItem value="Direct Visit">Direct Visit</MenuItem>
        <MenuItem value="Email Campaign">Email Campaign</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>

      {/* Referral Source Details */}
      {referralSource === 'Social Media' && (
        <TextField
          label="Select a platform"
          select
          fullWidth
          value={referralSourceDetails}
          onChange={(e) => setReferralSourceDetails(e.target.value)}
          error={Boolean(errors.referralSourceDetails)}
          helperText={errors.referralSourceDetails}
          required
          sx={{ mb: 4 }}
        >
          <MenuItem value="">Select an option</MenuItem>
          <MenuItem value="LinkedIn">LinkedIn</MenuItem>
          <MenuItem value="YouTube">YouTube</MenuItem>
          <MenuItem value="Instagram">Instagram</MenuItem>
          <MenuItem value="Facebook">Facebook</MenuItem>
          <MenuItem value="WhatsApp">WhatsApp</MenuItem>
        </TextField>
      )}

      {referralSource === 'Other' && (
        <Box>
          <TextField
            label="Please Specify"
            value={referralSourceDetails}
            onChange={(e) => setReferralSourceDetails(e.target.value)}
            fullWidth
            required
            multiline
            inputProps={{ maxLength: 500 }}
            rows={3}
            error={Boolean(errors.referralSourceDetails)}
            helperText={errors.referralSourceDetails || `${referralSourceDetails.length}/500`}
            sx={{ mb: 4 }}
          />
        </Box>
      )}

      {/* Submit Button */}
      <Box className="w-full text-center">
        <Button
          type="submit"
          variant="contained"
          style={{ color: 'white' }}
          disabled={!referralSource || (referralSource === 'Other' && !referralSourceDetails.trim()) || (referralSource === 'Social Media' && !referralSourceDetails)}
        >
          Go
        </Button>
      </Box>
    </Box>
  )
}

export default ReferralSourceForm
