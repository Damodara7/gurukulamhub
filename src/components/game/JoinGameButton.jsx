'use client'

import React from 'react'

import { Button } from '@mui/material'
import Link from 'next/link'

function JoinGameButton({ href, ...rest }) {
  // const theme = useTheme()
  // const isBelowSm = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Button component={Link} {...rest} href={href} variant='contained' color='primary'>
      Join Game
    </Button>
  )
}

export default JoinGameButton
