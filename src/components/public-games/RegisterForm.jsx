// 'use client'

// import React, { useState } from 'react'
// import { Box, TextField, Typography, Stack, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore' // ✅ FIXED

// const RegisterForm = ({ game }) => {
//   const [form, setForm] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: ''
//   })

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = e => {
//     e.preventDefault()
//     console.log('Form submitted:', form)
//     alert('Registration submitted successfully!')
//   }

//   return (
//     <Box p={4} display='flex' justifyContent='center'>
//       <Box
//         component='form'
//         onSubmit={handleSubmit}
//         sx={{
//           maxWidth: 500,
//           width: '100%',
//           bgcolor: 'background.paper',
//           p: 3,
//           borderRadius: 2,
//           boxShadow: 3
//         }}
//       >
//         {/* Accordion for Game Info */}
//         <Accordion>
//           <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content'>
//             <Typography variant='h6' color='primary'>
//               Game Details
//             </Typography>
//           </AccordionSummary>
//           <AccordionDetails>
//             <Typography>
//               <strong>ID:</strong> {game.id}
//             </Typography>
//             <Typography>
//               <strong>Name:</strong> {game.name}
//             </Typography>
//             <Typography>
//               <strong>Live Date:</strong> {game.liveDate}
//             </Typography>
//             <Typography>
//               <strong>Details:</strong> {game.details}
//             </Typography>
//           </AccordionDetails>
//         </Accordion>

//         {/* Registration Form */}
//         <Box mt={3}>
//           <Typography variant='h6' gutterBottom color='secondary'>
//             Register
//           </Typography>
//           <Stack spacing={2}>
//             <TextField label='First Name' name='firstName' required onChange={handleChange} size='small' />
//             <TextField label='Last Name' name='lastName' required onChange={handleChange} size='small' />
//             <TextField label='Email' name='email' type='email' required onChange={handleChange} size='small' />
//             <TextField label='Phone' name='phone' type='tel' required onChange={handleChange} size='small' />
//             <Button type='submit' variant='contained' color='secondary' fullWidth>
//               Submit
//             </Button>
//           </Stack>
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// export default RegisterForm

'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'

import { useRouter } from 'next/navigation'


const RegisterForm = ({ game, open, handleClose }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const router = useRouter()

  const onCloseAndRedirect = () => {
    handleClose()
    router.push('/en/public-games')
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Form submitted:', form)
    alert('Registration submitted successfully!')
  }
  
  return (
    <Dialog open={open} onClose={onCloseAndRedirect} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogContent className='relative pbs-0 pbe-6 pli-10 sm:pli-16' sx={{ mt: 10}}>
          {/* Close Button */}
          <IconButton onClick={onCloseAndRedirect} className='absolute block-start-4 inline-end-4' aria-label='close'>
            <CloseIcon className='text-textSecondary' />
          </IconButton>

          {/* Game Details */}
          <Accordion defaultExpanded sx={{ mb: 5 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content'>
              <Typography variant='h6' color='primary'>
                Game Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <strong>ID:</strong> {game.id}
              </Typography>
              <Typography>
                <strong>Name:</strong> {game.name}
              </Typography>
              <Typography>
                <strong>Live Date:</strong> {game.liveDate}
              </Typography>
              <Typography>
                <strong>Details:</strong> {game.details}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Registration Form */}
          <Typography variant='h6' gutterBottom color='primary'>
            Register
          </Typography>
          <Stack spacing={2}>
            <TextField label='First Name' name='firstName' required onChange={handleChange} size='medium' />
            <TextField label='Last Name' name='lastName' required onChange={handleChange} size='medium' />
            <TextField label='Email' name='email' type='email' required onChange={handleChange} size='medium' />
            <TextField label='Phone' name='phone' type='tel' required onChange={handleChange} size='medium' />
          </Stack>
        </DialogContent>

        <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
          <Button type='submit' variant='contained' color='primary' fullWidth style={{ color: 'white' }}>
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RegisterForm
