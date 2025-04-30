import { Box, Button, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function GoBackButton({ path }) {
  const router = useRouter()
  const handleGoBack = () => {
    if (path) {
      router.push(path)
    } else {
      router.back()
    }
  }
  return (
    <Box className='mb-2' position='sticky' top={70} zIndex={10}>
      <Button
        onClick={handleGoBack}
        color='secondary'
        variant='contained'
        component='label'
        className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
      >
        <i className='ri-arrow-left-line' />
      </Button>
      {/* <IconButtonTooltip title='' variant='contained' component={Link} href={path}>
        <ArrowBackIcon />
      </IconButtonTooltip> */}
    </Box>
  )
}

export default GoBackButton
