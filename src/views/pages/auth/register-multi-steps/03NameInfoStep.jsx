import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import { TextField, Button, Typography, CircularProgress } from '@mui/material'
import CenterBox from '@components/CenterBox'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import DirectionalIcon from '@components/DirectionalIcon'

const NameInfoStep = ({ handleNext, dataFromEmailStep, email }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickName, setNickName] = useState('')
  const [errors, setErrors] = useState({})
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateName = name => /^[A-Za-z]+$/.test(name) && name.length >= 3

  const handleInputChange = (setter, field) => e => {
    const value = e.target.value
    setter(value)
    if (!validateName(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Minimum 3 alphabetic characters are required' }))
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    setIsButtonEnabled(validateName(firstName) && validateName(lastName))
  }

  const updateNameDetails = async () => {
    setLoading(true)

    if (!firstName || !lastName) {
      setErrors(prev => ({ ...prev, firstName: 'First name is required', lastName: 'Last name is required' }))
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
      const result = await RestApi.post(ApiUrls.v0.USERS_PROFILE, payload)
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
