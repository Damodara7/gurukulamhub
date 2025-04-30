import React, { useState, useEffect } from 'react'
import { Grid, TextField, Button, CircularProgress, Typography } from '@mui/material'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const ReferralDetailsStep = ({ onSuccess, email }) => {
  const [referredMemberId, setReferredMemberId] = useState('')
  const [referredUsername, setReferredUsername] = useState('')
  const [referrer, setReferrer] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState({ verifyReferrer: false, submit: false })
  const [validMemberId, setValidMemberId] = useState(false)
  const [validEmail, setValidEmail] = useState(true)
  const [isDirty, setIsDirty] = useState(false)

  const validateMemberId = id => /^[0-9]{6}[0-9]{4}$/.test(id)

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleMemberIdChange = e => {
    const id = e.target.value.toUpperCase()
    setReferredMemberId(id)
    setValidMemberId(validateMemberId(id))
  }

  const handleUsernameChange = e => {
    if (e.target.value === email) {
      toast.error('Referrer email should not be the same as yours.')
      setReferredUsername('')
      setIsDirty(false)
      setValidEmail(false)
      return
    }
    setReferredUsername(e.target.value)
    const isValid = validateEmail(e.target.value)
    setValidEmail(isValid)
    setIsDirty(true)
  }

  const handleVerifyClick = async () => {
    if (!validMemberId) {
      toast.error('Please enter a valid Member ID.')
      return
    }
    if (!(referredUsername && validEmail)) {
      toast.error("Please enter a valid referrer's email.")
      return
    }

    setLoading(prev => ({ ...prev, verifyReferrer: true }))
    setFirstName('')
    setLastName('')
    setReferrer(null)
    setIsDirty(false)

    try {
      const result = await RestApi.get(
        `${API_URLS.v0.USERS_REFERRAL_INFO}?email=${referredUsername}&memberId=${referredMemberId}`
      )
      console.log(result)
      if (result?.status === 'success') {
        toast.success('Referrer found. Please Confirm the details.')
        const { user, profile } = result.result
        if (profile) {
          setFirstName(profile?.firstname)
          setLastName(profile?.lastname)
          setReferrer({ user, profile })
        }
      } else {
        console.error(result.message)
        toast.error('Referrer not found.')
      }
    } catch (error) {
      console.error('Error occurred while fetching referrer details. Please try again.', error)
      toast.error('Error occurred while fetching referrer details. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, verifyReferrer: false }))
    }
  }

  const handleConfirmClick = async () => {
    setLoading(prev => ({ ...prev, submit: true }))
    try {
      const result = await RestApi.put(API_URLS.v0.USERS_REFERRER_PROFILE, {
        email,
        referredBy: referredUsername
      })
      if (result?.status === 'success') {
        const response = await RestApi.post(API_URLS.v0.USERS_SEND_REFERRER_NOTIFICATION_EMAIL, {
          referrerEmail: referredUsername,
          referrerMemberId: referredMemberId,
          referrerName: `${firstName}${lastName && ' ' + lastName}`,
          newUserEmail: email
        })
        console.log('Send referrer notification response: ', response)
        toast.success('Updated Referrer Details Successfully.')
        onSuccess()
      } else {
        toast.error(result?.message || 'Updating referrer details failed. Please retry.')
      }
    } catch (error) {
      toast.error('Error occurred while updating referrer details. Please retry.')
    } finally {
      setLoading(prev => ({ ...prev, submit: false }))
    }
  }

  useEffect(() => {
    if (isDirty || validEmail) {
      setFirstName('')
      setLastName('')
      setReferrer(null)
    }
  }, [validEmail, isDirty])

  useEffect(() => {
    setFirstName('')
    setLastName('')
    setReferrer(null)
  }, [referredMemberId, referredUsername])

  return (
    <>
      {/* <TextField
        label='Referred Member ID'
        variant='outlined'
        value={referredMemberId}
        onChange={handleMemberIdChange}
        fullWidth
        margin='normal'
        inputProps={{ maxLength: 10 }}
        helperText={validMemberId ? '' : 'Eg: ABCD123456'}
        error={!validMemberId && referredMemberId !== ''}
      /> */}
      <TextField
        label='Referred Member ID'
        variant='outlined'
        value={referredMemberId}
        onChange={handleMemberIdChange}
        fullWidth
        margin='normal'
        inputProps={{ maxLength: 10 }} // 6 for YYMMDD + 4 for sequence
        helperText={validMemberId ? '' : 'Eg: 2412260001'} // Updated example format
        error={!validMemberId && referredMemberId !== ''}
      />

      {validMemberId && (
        <TextField
          label="Referred Person's Email"
          variant='outlined'
          value={referredUsername}
          onChange={handleUsernameChange}
          fullWidth
          margin='normal'
          onBlur={() => setValidEmail(validateEmail(referredUsername))}
          helperText={validEmail ? '' : 'Invalid email'}
          error={!validEmail}
        />
      )}
      <Grid container spacing={5} mt={1}>
        {loading.verifyReferrer ? (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Button
              style={{ color: 'white' }}
              component='label'
              variant='contained'
              onClick={handleVerifyClick}
              disabled={!validMemberId || !validEmail || !referredUsername}
            >
              Verify
            </Button>
          </Grid>
        )}

        {referrer && (
          <>
            <Grid item xs={6}>
              <TextField fullWidth label='First Name' value={firstName} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label='Last Name' value={lastName} disabled />
            </Grid>
          </>
        )}
        {referrer && (
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            {loading.submit ? (
              <Grid item xs={12} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </Grid>
            ) : (
              <Button
                style={{ color: 'white' }}
                component='label'
                variant='contained'
                onClick={handleConfirmClick}
                disabled={!referrer}
              >
                Confirm & Go
              </Button>
            )}
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default ReferralDetailsStep

// import React, { useEffect, useState } from 'react'
// import { TextField, Button, Grid, CircularProgress, CenterBox, Typography } from '@mui/material'
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'
// import { toast } from 'react-toastify'

// const ReferralDetailsStep = ({ onSuccess, email }) => {
//   const [referredUsername, setReferredUsername] = useState('')
//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [validEmail, setValidEmail] = useState(true)
//   const [isDirty, setIsDirty] = useState(false)

//   const handleUsernameChange = e => {
//     if (e.target.value === email) {
//       toast.error("Referrer email should not be same as your's.")
//       setReferredUsername('')
//       setIsDirty(false)
//       setValidEmail(false)
//       return
//     }
//     setReferredUsername(e.target.value)
//     const isValid = validateEmail(e.target.value)
//     setValidEmail(isValid)
//     setIsDirty(true)
//     console.log('isDirty', isDirty)
//   }

//   const handleVerifyClick = async () => {
//     setLoading(true)
//     setFirstName('')
//     setLastName('')
//     setIsDirty(false)

//     if (!(referredUsername && validEmail(referredUsername))) {
//       toast.error("Please enter a valid referrer's email.")
//       return
//     }

//     try {
//       const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}/${referredUsername}`)
//       if (result?.status === 'success') {
//         console.log(result)
//         toast.success('Referrer found. Please Confirm the details.')
//         setFirstName(result.result.firstname)
//         setLastName(result.result.lastname)
//       } else {
//         toast.error('Referrer not found.')
//       }
//     } catch (error) {
//       // toast.error('Error occurred while Fetching name details of referrer, Please retry')
//     }
//     setLoading(false)
//   }

//   const handleConfirmClick = async () => {
//     setLoading(true)
//     if (referredUsername)
//       try {
//         const result = await RestApi.put(API_URLS.v0.USERS_REFERRER_PROFILE, {
//           email,
//           referredBy: referredUsername
//         })
//         if (result?.status === 'success') {
//           toast.success('Updated Referrer Details Successfully.')
//           onSuccess()
//         } else {
//           // toast.error(result?.message || 'Updating referrer details failed, Please retry')
//         }
//       } catch (error) {
//         // toast.error('Error occurred while updating referrer details, Please retry')
//       }
//     else {
//       // toast.error("Referred person's email is not verified.")
//     }
//     setLoading(false)
//   }

//   const validateEmail = email => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return emailRegex.test(email)
//   }

//   const handleBlur = () => {
//     // Check if the entered email is valid
//     const isValid = validateEmail(referredUsername)
//     setValidEmail(isValid)
//   }

//   // Function to handle resend button enable/disable
//   useEffect(() => {
//     if (isDirty || validEmail) {
//       setFirstName('')
//       setLastName('')
//     }
//   }, [validEmail, isDirty])

//   return (
//     <>
//       <Grid container spacing={5}>
//         <TextField
//           label="Referred Person's email"
//           variant='outlined'
//           value={referredUsername}
//           onChange={handleUsernameChange}
//           fullWidth
//           margin='normal'
//           onBlur={handleBlur}
//         />
//         <CenterBox>
//           <Typography fontSize={'0.8rem'} color={'orange'}>
//             {validEmail ? '(valid)' : '(invalid)'}
//           </Typography>
//         </CenterBox>
//         <br />
//         <Grid item xs={12} sm={12}>
//           {loading ? (
//             <CenterBox>
//               <CircularProgress />{' '}
//             </CenterBox>
//           ) : (
//             <div style={{ margin: 'auto', textAlign: 'center' }}>
//               <Button
//                 variant='contained'
//                 component='button'
//                 disabled={(!validEmail && !phoneValid) || !isDirty}
//                 onClick={handleVerifyClick}
//               >
//                 Verify
//               </Button>
//             </div>
//           )}
//         </Grid>
//         <Grid item xs={6}>
//           <TextField fullWidth label='First Name' placeholder='' disabled value={firstName} />
//         </Grid>
//         <Grid item xs={6}>
//           <TextField fullWidth label='Last Name' placeholder='John Doe' disabled value={lastName} />
//         </Grid>

//         <Grid item xs={12}>
//           <div style={{ margin: 'auto', textAlign: 'center' }}>
//             <Button
//               variant='contained'
//               disabled={isDirty || !referredUsername}
//               component='button'
//               style={{ paddingBottom: '10px' }}
//               onClick={handleConfirmClick}
//             >
//               Confirm &
//               <span style={{ color: '#ffff', fontStyle: 'italic', letterSpacing: '1px' }}>
//                 <b>&nbsp;GO!</b>
//               </span>
//             </Button>
//           </div>
//         </Grid>
//       </Grid>
//     </>
//   )
// }

// export default ReferralDetailsStep
