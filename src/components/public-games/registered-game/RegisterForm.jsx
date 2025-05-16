'use client'

import React, { useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const RegisterForm = ({ game }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Registering:', formData)
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ color: 'primary.main' }}>
              <Typography variant='h6' color='primary'>
                Game Summary
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>Title:</strong> {game.title || 'N/A'}
              </Typography>
              <Typography>
                <strong>Start Time:</strong> {new Date(game.startTime).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Registration End Time:</strong>{' '}
                {game.registrationEndTime ? new Date(game.registrationEndTime).toLocaleString() : 'N/A'}
              </Typography>
              <Typography>
                <strong>Location:</strong>{' '}
                {`${game.location?.city || ''}, ${game.location?.region || ''}, ${game.location?.country || ''}`}
              </Typography>

              
              <Typography>
                <strong>Total Reward Value:</strong> ₹{game.totalRewardValue || 0}
              </Typography>

              {game.promotionalVideoUrl && (
                <Typography>
                  <strong>Promotional Video:</strong>{' '}
                  <a href={game.promotionalVideoUrl} target='_blank' rel='noopener noreferrer'>
                    View
                  </a>
                </Typography>
              )}

              {game.thumbnailPoster && (
                <Typography>
                  <strong>Thumbnail:</strong>{' '}
                  <a href={game.thumbnailPoster} target='_blank' rel='noopener noreferrer'>
                    View Image
                  </a>
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Typography variant='h6' gutterBottom color='primary'>
              Register
            </Typography>
            <Stack spacing={2}>
              <TextField label='First Name' name='firstName' required onChange={handleChange} />
              <TextField label='Last Name' name='lastName' required onChange={handleChange} />
              <TextField label='Email' name='email' type='email' required onChange={handleChange} />
              <TextField label='Phone' name='phone' type='tel' required onChange={handleChange} />
            </Stack>
          </CardContent>
          <CardContent>
            <Button type='submit' variant='contained' color='primary' fullWidth>
              Submit
            </Button>
          </CardContent>
        </form>
      </Card>
    </>
  )
}

export default RegisterForm








// 'use client'

// import React, { useState, useEffect } from 'react'
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Card,
//   CardContent,
//   Typography,
//   Stack,
//   TextField,
//   Button,
//   CircularProgress,
//   Alert,
//   Box
// } from '@mui/material'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'
// import { toast } from 'react-toastify'

// const RegisterForm = ({ game, handleClose }) => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: ''
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)

//   const handleChange = e => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
//     if (error) setError(null) // Clear error when user types
//   }

//   const handleSubmit = async e => {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)

//     try {
//       // Basic validation
//       if (!formData.firstName.trim() || !formData.lastName.trim()) {
//         throw new Error('First and last name are required')
//       }
//       if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//         throw new Error('Please enter a valid email address')
//       }
//       if (!/^\d{10}$/.test(formData.phone)) {
//         throw new Error('Please enter a 10-digit phone number')
//       }

//       // API call to register
//       const res = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${game._id}/register`, {
//         user: formData
//       })

//       if (res.status === 'success') {
//         toast.success('Registration successful!')
//         handleClose()
//       } else {
//         throw new Error(res.message || 'Registration failed')
//       }
//     } catch (err) {
//       console.error('Registration error:', err)
//       setError(err.message)
//       toast.error(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatLocation = () => {
//     const { city, region, country } = game.location || {}
//     const parts = []
//     if (city) parts.push(city)
//     if (region) parts.push(region)
//     if (country) parts.push(country)
//     return parts.length > 0 ? parts.join(', ') : 'N/A'
//   }

//   return (
//     <>
//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Accordion defaultExpanded>
//             <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ color: 'primary.main' }}>
//               <Typography variant='h6' color='primary'>
//                 Game Summary
//               </Typography>
//             </AccordionSummary>
//             <AccordionDetails>
//               <Stack spacing={1}>
//                 <Typography>
//                   <strong>Title:</strong> {game.title || 'N/A'}
//                 </Typography>
//                 <Typography>
//                   <strong>Start Time:</strong> {game.startTime ? new Date(game.startTime).toLocaleString() : 'N/A'}
//                 </Typography>
//                 <Typography>
//                   <strong>Registration End Time:</strong>{' '}
//                   {game.registrationEndTime ? new Date(game.registrationEndTime).toLocaleString() : 'N/A'}
//                 </Typography>
//                 <Typography>
//                   <strong>Location:</strong> {formatLocation()}
//                 </Typography>
//                 <Typography>
//                   <strong>Total Reward Value:</strong> ₹{game.totalRewardValue || 0}
//                 </Typography>
//                 {game.promotionalVideoUrl && (
//                   <Typography>
//                     <strong>Promotional Video:</strong>{' '}
//                     <a href={game.promotionalVideoUrl} target='_blank' rel='noopener noreferrer'>
//                       View
//                     </a>
//                   </Typography>
//                 )}
//                 {game.thumbnailPoster && (
//                   <Typography>
//                     <strong>Thumbnail:</strong>{' '}
//                     <a href={game.thumbnailPoster} target='_blank' rel='noopener noreferrer'>
//                       View Image
//                     </a>
//                   </Typography>
//                 )}
//               </Stack>
//             </AccordionDetails>
//           </Accordion>
//         </CardContent>
//       </Card>

//       <Card>
//         <form onSubmit={handleSubmit}>
//           <CardContent>
//             <Typography variant='h6' gutterBottom color='primary'>
//               Register
//             </Typography>
//             {error && (
//               <Alert severity='error' sx={{ mb: 2 }}>
//                 {error}
//               </Alert>
//             )}
//             <Stack spacing={2}>
//               <TextField
//                 label='First Name'
//                 name='firstName'
//                 value={formData.firstName}
//                 required
//                 onChange={handleChange}
//               />
//               <TextField label='Last Name' name='lastName' value={formData.lastName} required onChange={handleChange} />
//               <TextField
//                 label='Email'
//                 name='email'
//                 type='email'
//                 value={formData.email}
//                 required
//                 onChange={handleChange}
//               />
//               <TextField
//                 label='Phone'
//                 name='phone'
//                 type='tel'
//                 value={formData.phone}
//                 required
//                 onChange={handleChange}
//                 inputProps={{ maxLength: 10 }}
//               />
//             </Stack>
//           </CardContent>
//           <CardContent>
//             <Button type='submit' variant='contained' color='primary' fullWidth disabled={loading}>
//               {loading ? <CircularProgress size={24} color='inherit' /> : 'Submit'}
//             </Button>
//           </CardContent>
//         </form>
//       </Card>
//     </>
//   )
// }

// export default RegisterForm