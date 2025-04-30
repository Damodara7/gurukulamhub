import React, { useRef, useState } from 'react'
import { TextField, Box } from '@mui/material'

export default function OtpForm({ otpValue, setOtpValue, setIsDirty, disabled = false }) {
  const inputRefs = useRef([])

  const handlePaste = event => {
    const pastedValue = event.clipboardData.getData('text')
    if (pastedValue.length === 6 && /^\d+$/.test(pastedValue)) {
      setOtpValue(pastedValue)
      setIsDirty(true)
      pastedValue.split('').forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = char
        }
      })
      // Focus the last input field
      inputRefs.current[5]?.focus()
    }
    event.preventDefault()
  }

  const handleInputChange = (index, event) => {
    const value = event.target.value
    if (/^\d$/.test(value)) {
      const updatedOtpValue = otpValue.split('')
      updatedOtpValue[index] = value
      setOtpValue(updatedOtpValue.join(''))
      setIsDirty(true)

      // Focus the next input field
      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    } else {
      event.target.value = '' // Clear invalid input
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (event.target.value === '') {
        // Focus previous field
        if (index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
      } else {
        event.target.value = '' // Clear current field
      }
      const updatedOtpValue = otpValue.split('')
      updatedOtpValue[index] = ''
      setOtpValue(updatedOtpValue.join(''))
      setIsDirty(true)
    }
  }

  return (
    <Box display='flex' gap={1} onPaste={handlePaste}>
      {[...Array(6)].map((_, index) => (
        <TextField
          key={index}
          disabled={disabled}
          value={otpValue[index] || ''}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center', fontSize: '20px', padding: '8px 4px' }
          }}
          inputRef={el => (inputRefs.current[index] = el)}
          variant='outlined'
          onChange={e => handleInputChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          style={{ maxWidth: '40px' }}
        />
      ))}
    </Box>
  )
}

// /********** Standard imports.*********************/
// import React, { useEffect, useState, useRef } from 'react'
// import { TextField } from '@mui/material'
// /********************************************/

// export default function OtpForm({ otpValue, setOtpValue, setIsDirty, disabled = false }) {
//   const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

//   const handleInputChange = (index, event) => {
//     const value = event.target.value
//     // Handle pasting of the entire OTP at once
//     if (value.length === 6) {
//       // Set OTP value directly from the pasted value
//       setOtpValue(value)
//       setIsDirty(true)
//       // Populate each input field with the respective character
//       value.split('').forEach((char, i) => {
//         if (inputRefs[i].current) {
//           inputRefs[i].current.value = char
//         }
//       })
//       // Focus the last input field
//       inputRefs[5].current.focus()
//     } else {
//       // Handle single character input
//       const newOtpValue = otpValue.slice(0, index) + value + otpValue.slice(index + 1)
//       setOtpValue(newOtpValue)
//       setIsDirty(true)
//       // Move focus to the next input field if value is entered
//       if (value && index < inputRefs.length - 1) {
//         inputRefs[index + 1].current.focus()
//       }
//     }
//   }

//   const handleBackspace = (index, event) => {
//     if (event.key === 'Backspace') {
//       if (index > 0) {
//         event.preventDefault()
//         inputRefs[index].current.value = ''
//         inputRefs[index - 1].current.focus()
//       } else {
//         // Clear content if backspace is pressed in the first input field
//         event.preventDefault()
//         inputRefs[index].current.value = ''
//       }
//       const newOtpValue = otpValue.slice(0, index - 1) + otpValue.slice(index + 1)
//       setOtpValue(newOtpValue)
//       setIsDirty(true)
//     }
//   }

//   return (
//     <div>
//       {[...Array(6)].map((_, index) => (
//         <TextField
//           key={index}
//           disabled={disabled}
//           inputProps={{ maxLength: 1 }}
//           inputRef={inputRefs[index]}
//           variant='outlined'
//           autoFocus={index === 0}
//           onChange={e => handleInputChange(index, e)}
//           onKeyDown={e => handleBackspace(index, e)}
//           style={{ marginRight: '5px', width: '40px' }}
//         />
//       ))}
//     </div>
//   )
// }
