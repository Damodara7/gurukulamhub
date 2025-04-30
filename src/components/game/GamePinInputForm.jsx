'use client'

import { useEffect, useState } from 'react'
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from '@core/svg/Logo'
import AuthForm from '@/views/AuthForm'

// MUI ICONS
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import Link from 'next/link'

const initialLoadingState = { submitGamePin: false }

const GamePinInputForm = ({ mode = 'join' ,gamePin}) => {
  const router = useRouter()
  const [pin, setPin] = useState(gamePin ? gamePin :'')
  const [errorMessage, setErrorMessage] = useState('')
  const { data: session } = useSession()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [loading, setLoading] = useState(initialLoadingState)

  const correctPin = '123456' // Assumed correct PIN

  const handleSubmit = e => {
    e.preventDefault()
    console.log('game pin: ', pin)
    setLoading(prev => ({ ...prev, submitGamePin: true }))
    try {
      if (pin === correctPin) {
        if (session?.user?.email) {
          console.log('Accessed')
        } else {
          // setShowAuthForm(true)
          router.push(`/auth/login?gamePin=${pin}`)
        }
      } else {
        setErrorMessage('Invalid Game PIN. Please try again.')
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to submit Game PIN. Please try again.')
    } finally {
      setLoading(prev => ({ ...prev, submitGamePin: false }))
    }
  }

  function handleClickCreateQuizLink() {
    if (session?.user?.email) {
      // navigate to create quiz page
    } else {
      // setShowAuthForm(true)
      router.push(`/auth/login?redirectTo=/myquizzes/create`)
    }
  }

  useEffect(() => {
    setErrorMessage('')
    setLoading(initialLoadingState)
  }, [pin])

  // if (showAuthForm) {
  //   return <AuthForm gamePin={pin} />
  // }

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      height='100%'
      bgcolor='#8C57FF'
      gap='0.5rem'
      //bgcolor='#ff981f'
      // className='bg-primary'
    >
      {/* Logo Title */}
      <div
        style={{
          background: 'rgb(255,255,255)',
          width: 'fit-content',
          height: '106px',
          borderRadius: '50%',
          padding: '5px'
        }}
      >
        <Link href='/' style={{ height: '100%', width: '100%' }}>
          <Logo className='text-primary' height={98} width={95} />
        </Link>
      </div>
      <div>
        <Typography
          variant='h2'
          component='label'
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            mb: 6,
            fontSize: '3rem'
            //letterSpacing: '0.05em'
          }}
        >
          <div>GurukulamHub</div>
        </Typography>
        {mode === 'run' ? (
          <div className='text-center'>
            <Typography
              variant='h6'
              component='label'
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif'
                // letterSpacing: '0.05em'
              }}
            >
              {' '}
              (Run Game){' '}
            </Typography>
          </div>
        ) : (
          <div className='text-center'>
            <Typography
              variant='h6'
              component='label'
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif'
                // letterSpacing: '0.05em'
              }}
            >
              {' '}
              (Join Game)
            </Typography>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        noValidate
        autoComplete='off'
        onSubmit={handleSubmit}
        className='flex flex-col items-center justify-between gap-2 p-4 rounded-lg shadow-lg'
        style={{
          backgroundColor: 'white',
          width: '380px',
          maxWidth: '90%'
        }}
      >
        {/* Input Field */}
        <TextField
          label=''
          disabled={loading.submitGamePin}
          placeholder='Game PIN'
          variant='outlined'
          value={pin}
          onChange={e => {
            setPin(e.target.value)
          }}
          InputProps={{
            classes: {
              notchedOutline: 'border-2' // Adding Tailwind's 2px border width class
            },
            endAdornment: errorMessage ? <PriorityHighIcon color='error' /> : ''
          }}
          sx={{
            mb: 2,
            width: '100%',
            '& .MuiInputBase-input': {
              textAlign: 'center',
              padding: '10px',
              fontSize: '18px',
              letterSpacing: '0.05em',
              fontWeight: 'bold'
            }
          }}
        />

        {/* Enter Button */}
        <Button
          type='submit'
          disabled={loading.submitGamePin}
          onClick={handleSubmit}
          variant='contained'
          component='label'
          style={{
            backgroundColor: 'rgb(66, 66, 66)',
            color: 'white',
            width: '100%',
            fontWeight: 'bold',
            fontSize: '18px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textTransform: 'none',
            padding: '10px',
            '&:hover': {
              backgroundColor: 'white'
            }
          }}
        >
          {loading.submitGamePin ? <CircularProgress color='inherit' size={24} /> : 'Enter'}
        </Button>
        {/* Error Message */}
        {errorMessage && (
          <Alert
            severity='error'
            style={{
              marginTop: '10px',
              width: '100%',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {errorMessage}
          </Alert>
        )}
      </form>

      <div style={{ position: 'fixed', bottom: 50 }}>
        <Typography
          className='underline underline-offset-4 cursor-pointer'
          onClick={handleClickCreateQuizLink}
          style={{ color: 'white' }}
        >
          Create your own quiz for free.
        </Typography>
      </div>
    </Box>
  )
}

export default GamePinInputForm
