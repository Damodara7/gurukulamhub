import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  DialogContentText,
  MenuItem,
  useTheme,
  Box
} from '@mui/material'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const EditEventUserDialog = ({ open, setOpen, userData, refreshUsers }) => {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobileNumber: '',
    fatherOrHusbandName: '',
    designation: '',
    village: '',
    taluka: '',
    district: ''
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (open && userData) {
      setFormData({
        name: userData.name || '',
        age: userData.age || '',
        gender: userData.gender || '',
        mobileNumber: userData.mobileNumber || '',
        fatherOrHusbandName: userData.fatherOrHusbandName || '',
        designation: userData.designation || '',
        village: userData.village || '',
        taluka: userData.taluka || '',
        district: userData.district || ''
      })
    }
  }, [open, userData])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
    setFormError('')
  }

  const validateField = (field, value) => {
    const newErrors = { ...errors }
    switch (field) {
      case 'name':
      case 'fatherOrHusbandName':
      case 'village':
      case 'taluka':
      case 'district':
        newErrors[field] = !value.trim()
        break
      case 'mobileNumber':
        newErrors.mobileNumber = !/^\d{10}$/.test(value)
        break
      default:
        break
    }
    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = true
    if (!formData.fatherOrHusbandName) newErrors.fatherOrHusbandName = true
    if (!formData.age || formData.age < 6 || formData.age > 120) newErrors.age = true
    if (!formData.gender) newErrors.gender = true
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = true
    if (!formData.designation) newErrors.designation = true
    if (!formData.village) newErrors.village = true
    if (!formData.taluka) newErrors.taluka = true
    if (!formData.district) newErrors.district = true

    setErrors(newErrors)
    setFormError(Object.keys(newErrors).length > 0 ? 'Please fill all the required fields' : '')
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const result = await RestApi.put(`${API_URLS.v0.EVENT_USER}`, {
        ...formData,
        _id: userData._id
      })

      if (result?.status === 'success') {
        console.log('User updated successfully:', result)
        await refreshUsers() // Call parent to refresh user list
        handleCloseDialog()
      } else {
        console.error('Error updating user:', result)
        toast.error('Error updating user!')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function handleCloseDialog() {
    setOpen(false)
    setErrors({})
    setFormError('')
  }

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={handleCloseDialog}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit User
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Grid container spacing={4}>
            {[
              'name',
              'age',
              'gender',
              'mobileNumber',
              'fatherOrHusbandName',
              'designation',
              'village',
              'taluka',
              'district'
            ].map((field, index) => (
              <Grid item xs={field === 'age' || field === 'gender' ? 6 : 12} key={index}>
                <TextField
                  fullWidth
                  required
                  label={
                    field === 'fatherOrHusbandName'
                      ? 'Father/Husband Name'
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  name={field}
                  variant='outlined'
                  value={formData[field]}
                  onChange={handleChange}
                  error={!!errors[field]}
                  type={field === 'age' ? 'number' : 'text'}
                  select={field === 'gender'}
                  sx={{ '& .MuiOutlinedInput-root.Mui-error': { borderColor: theme.palette.error.main } }}
                >
                  {field === 'gender' &&
                    ['Male', 'Female', 'Other'].map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions className='gap-2 flex-col'>
        <Box>
          {formError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </Box>
        <Box className='gap-2 flex justify-center'>
          <Button
            variant='contained'
            color='primary'
            component='label'
            style={{ color: 'white' }}
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleCloseDialog}>
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default EditEventUserDialog
