import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, Typography, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import CenterBox from '@components/CenterBox'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import DirectionalIcon from '@components/DirectionalIcon'

const NameInfoStep = ({ handleNext, dataFromEmailStep, email }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickName, setNickName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [errors, setErrors] = useState({})
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  // Better name validation: allows letters, spaces, hyphens, apostrophes, and accented characters
  // Must start with a letter, have at least 2 characters, max 50 characters
  // Allows names like: Mary-Jane, O'Brien, José, Van Der Berg, etc.
  const validateName = name => {
    if (!name || name.trim().length === 0) return false
    
    const trimmedName = name.trim()
    
    // Length validation: 2-50 characters
    if (trimmedName.length < 2 || trimmedName.length > 50) return false
    
    // Must start with a letter (including accented characters)
    if (!/^[A-Za-zÀ-ÿ]/.test(trimmedName)) return false
    
    // Allow letters, spaces, hyphens, apostrophes, and accented characters
    // Must contain at least one letter
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/
    if (!nameRegex.test(trimmedName)) return false
    
    // Must not be only spaces, hyphens, or apostrophes
    if (!/[A-Za-zÀ-ÿ]/.test(trimmedName)) return false
    
    // Must not have consecutive spaces, hyphens, or apostrophes
    if (/[\s'-]{2,}/.test(trimmedName)) return false
    
    // Must not end with space, hyphen, or apostrophe
    if (/[\s'-]$/.test(trimmedName)) return false
    
    return true
  }
  
  const validateAge = ageValue => {
    if (!ageValue) return true // Age is optional
    const ageNum = parseInt(ageValue, 10)
    return !isNaN(ageNum) && ageNum >= 6 && ageNum <= 120
  }

  const handleInputChange = (setter, field) => e => {
    const value = e.target.value
    setter(value)
    if (field === 'firstName' || field === 'lastName') {
      if (!value || value.trim().length === 0) {
        setErrors(prev => ({ ...prev, [field]: `${field === 'firstName' ? 'First' : 'Last'} name is required` }))
      } else if (!validateName(value)) {
        const trimmed = value.trim()
        if (trimmed.length < 2) {
          setErrors(prev => ({ ...prev, [field]: 'Name must be at least 2 characters long' }))
        } else if (trimmed.length > 50) {
          setErrors(prev => ({ ...prev, [field]: 'Name must be less than 50 characters' }))
        } else if (!/^[A-Za-zÀ-ÿ]/.test(trimmed)) {
          setErrors(prev => ({ ...prev, [field]: 'Name must start with a letter' }))
        } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(trimmed)) {
          setErrors(prev => ({ ...prev, [field]: 'Name can only contain letters, spaces, hyphens, and apostrophes' }))
        } else {
          setErrors(prev => ({ ...prev, [field]: 'Please enter a valid name' }))
        }
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    } else if (field === 'age') {
      if (value && !validateAge(value)) {
        setErrors(prev => ({ ...prev, [field]: 'Age must be between 6 and 120' }))
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    } else if (field === 'gender') {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    updateButtonState()
  }

  const updateButtonState = () => {
    const firstNameValid = firstName.trim().length > 0 && validateName(firstName)
    const lastNameValid = lastName.trim().length > 0 && validateName(lastName)
    const ageValid = !age || validateAge(age)
    setIsButtonEnabled(firstNameValid && lastNameValid && ageValid)
  }

  const updateNameDetails = async () => {
    setLoading(true)

    // Validation
    if (!firstName || !lastName) {
      setErrors(prev => ({ ...prev, firstName: 'First name is required', lastName: 'Last name is required' }))
      setLoading(false)
      return
    }

    if (age && !validateAge(age)) {
      setErrors(prev => ({ ...prev, age: 'Age must be between 6 and 120' }))
      setLoading(false)
      return
    }

    try {
      let payload = {
        email,
        firstname: firstName,
        lastname: lastName
      }
      
      if (dataFromEmailStep.accountType === 'INDIVIDUAL' && nickName) {
        payload = { ...payload, nickname: nickName }
      }
      
      // Add age if provided
      if (age) {
        payload.age = parseInt(age, 10)
      }
      
      // Add gender if provided
      if (gender) {
        payload.gender = gender
      }
      
      const result = await RestApi.put(ApiUrls.v0.USERS_PROFILE, payload)
      if (result?.status === 'success') {
        handleNext()
      } else {
        console.error('Failed to update name details')
      }
    } catch (error) {
      console.error('Error occurred while updating name details:', error)
    }
    setLoading(false)
  }

  const isIndividual = dataFromEmailStep.accountType === 'INDIVIDUAL'

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='h5' align='center' color='primary'>
          {isIndividual ? 'Name Info' : 'Authorized Person Name Info'}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label='First Name'
          fullWidth
          variant='outlined'
          value={firstName}
          required
          onChange={handleInputChange(setFirstName, 'firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label='Last Name'
          fullWidth
          required
          variant='outlined'
          value={lastName}
          onChange={handleInputChange(setLastName, 'lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Grid>
      {isIndividual && (
        <Grid item xs={12} sm={6}>
          <TextField
            label='Nickname'
            placeholder='Optional'
            fullWidth
            variant='outlined'
            value={nickName}
            onChange={handleInputChange(setNickName, 'nickName')}
            error={!!errors.nickName}
            helperText={errors.nickName}
          />
        </Grid>
      )}
      {/* {isIndividual && ( */}
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              label='Age'
              type='number'
              placeholder='Optional'
              fullWidth
              variant='outlined'
              value={age}
              onChange={handleInputChange(setAge, 'age')}
              error={!!errors.age}
              helperText={errors.age || 'Enter your age (6-120)'}
              inputProps={{ min: 6, max: 120 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                onChange={handleInputChange(setGender, 'gender')}
                label='Gender'
                error={!!errors.gender}
              >
                <MenuItem value=''>
                  <em>Optional</em>
                </MenuItem>
                <MenuItem value='male'>Male</MenuItem>
                <MenuItem value='female'>Female</MenuItem>
                <MenuItem value='transgender'>Transgender</MenuItem>
              </Select>
            </FormControl>
            {errors.gender && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                {errors.gender}
              </Typography>
            )}
          </Grid>
        </>
      {/* )} */}
      <Grid item xs={12}>
        {loading ? (
          <CenterBox>
            <CircularProgress />
          </CenterBox>
        ) : (
          <CenterBox>
            <Button component='label' style={{color: 'white'}} variant='contained' color='primary' onClick={updateNameDetails} disabled={!isButtonEnabled}>
              GO!
            </Button>
          </CenterBox>
        )}
      </Grid>
      {/* <Grid item xs={12} className="flex justify-end">
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={<DirectionalIcon ltrIconClass="ri-arrow-right-line" rtlIconClass="ri-arrow-left-line" />}
        >
          Skip
        </Button>
      </Grid> */}
    </Grid>
  )
}

export default NameInfoStep

// // MUI Imports
// // Component Imports
// /********** Standard imports.*********************/
// import React, { useEffect, useState, useRef } from 'react'
// import Grid from '@mui/material/Grid'
// import { TextField, Button, FormControl, RadioGroup, Radio, FormControlLabel, Link } from '@mui/material'
// import CenterBox from '@components/CenterBox'
// import Typography from '@mui/material/Typography'
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS as ApiUrls } from '@/configs/apiConfig'
// import * as clientApi from '@/app/api/client/client.api'
// import { Box } from '@mui/material'
// import { toast } from 'react-toastify'
// import CircularProgress from '@mui/material/CircularProgress'
// /********************************************/
// import DirectionalIcon from '@components/DirectionalIcon'

// const NameInfoStep = ({
//   handleNext,
//   dataFromEmailStep,
//   handlePrev,
//   stepIndex,
//   totalSteps,
//   activeStep,
//   // firstName,
//   // setFirstName,
//   email,
//   setActiveStep
// }) => {
//   const [value, setValue] = useState()
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [errors, setErrors] = useState({})
//   const [isButtonEnabled, setIsButtonEnabled] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const validateName = name => {
//     return /^[A-Za-z]+$/.test(name) && name.length >= 3
//   }

//   const handleFirstNameChange = e => {
//     const value = e.target.value
//     setFirstName(value)
//     if (!validateName(value)) {
//       setErrors(prevErrors => ({
//         ...prevErrors,
//         firstName: 'Minimum 3 alphabetic characters are required'
//       }))
//     } else {
//       setErrors(prevErrors => ({
//         ...prevErrors,
//         firstName: ''
//       }))
//     }
//     setIsButtonEnabled(validateName(value) && validateName(lastName))
//   }

//   const handleLastNameChange = e => {
//     const value = e.target.value
//     setLastName(value)
//     if (!validateName(value)) {
//       setErrors(prevErrors => ({
//         ...prevErrors,
//         lastName: 'Minimum 3 alphabetic characters are required'
//       }))
//     } else {
//       setErrors(prevErrors => ({
//         ...prevErrors,
//         lastName: ''
//       }))
//     }
//     setIsButtonEnabled(validateName(firstName) && validateName(value))
//   }

//   const updateNameDetails = async () => {
//     setLoading(true)
//     try {
//       const result = await RestApi.post(ApiUrls.v0.USERS_PROFILE, {
//         email,
//         firstname: firstName,
//         lastname: lastName
//       })
//       // const result = await clientApi.updateUserProfile(email, { firstname: firstName, lastname: lastName })
//       if (result?.status === 'success') {
//         // toast.success(result?.message || 'Updated Name Details Successfully.')
//         handleNext()
//       } else {
//         // toast.error(result?.message || 'Failed to update name details, Please retry.')
//       }
//     } catch (error) {
//       // toast.error('Error occurred while updating name details, Please retry')
//     }
//     setLoading(false)
//   }

//   // useEffect(() => {
//   //   if (!email) {
//   //     setActiveStep(0)
//   //   }
//   // }, [email])

//   return (
//     <>
//       <Grid container spacing={5}>
//         <Grid item xs={12}>
//           <div style={{ margin: 'auto', display: 'flex', justifyContent: 'center' }}>
//             <Typography fontSize={30} fontStyle={'italic'} color={'#6066d0'}>
//               @name
//             </Typography>
//           </div>
//         </Grid>
//         <Grid item xs={12}>
//           <Typography>Enter your Name details</Typography>
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label='First Name'
//             fullWidth
//             variant='outlined'
//             value={firstName}
//             onChange={handleFirstNameChange}
//             error={errors.firstName ? true : false}
//             helperText={errors.firstName}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label='Last Name'
//             fullWidth
//             variant='outlined'
//             value={lastName}
//             onChange={handleLastNameChange}
//             error={errors.lastName ? true : false}
//             helperText={errors.lastName}
//           />
//         </Grid>

//         <Grid item xs={12}>
//           {loading ? (
//             <CenterBox>
//               <CircularProgress />{' '}
//             </CenterBox>
//           ) : (
//             <CenterBox>
//               <Button
//                 variant='contained'
//                 color={'primary'}
//                 component='label'
//                 onClick={updateNameDetails}
//                 disabled={errors.firstName || errors.lastName || lastName.length < 1 || firstName.length < 1}
//               >
//                 <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
//                   <b>GO!</b>
//                 </span>
//               </Button>
//             </CenterBox>
//           )}
//         </Grid>

//         <Grid item xs={12} className='flex justify-end'>
//           {/* <Button
//             disabled={activeStep === 0}
//             variant='outlined'
//             color='secondary'
//             onClick={handlePrev}
//             startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
//           >
//             Previous
//           </Button> */}
//           <Button
//             variant='contained'
//             onClick={handleNext}
//             endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
//           >
//             Skip
//           </Button>
//         </Grid>
//       </Grid>
//     </>
//   )
// }

// export default NameInfoStep
