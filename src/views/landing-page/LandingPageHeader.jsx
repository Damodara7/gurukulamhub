import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import Link from 'next/link'
import Logo from '@/@core/svg/Logo'
import themeConfig from '@/configs/themeConfig'
import JoinGameButton from '@/components/game/JoinGameButton'

const Header = () => {
  return (
    <AppBar
      position='sticky'
      elevation={4}
      className='mb-3 shadow-sm'
      style={{ backgroundColor: 'var(--mui-palette-background-default)' }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className='flex justify-center items-center gap-1'>
          <Logo className='text-primary' height={28} width={35} />
          <Typography variant='h5' className='font-semibold tracking-[0.15px]'>
            {`${themeConfig.templateName}`}
          </Typography>
        </div>
        <Box className='flex items-center gap-1'>
          <Button color={'primary'} component={Link} href='/auth/login' size='small' variant='outlined'>
            Sign In
          </Button>
          <JoinGameButton href={`/auth/login?redirectTo=/public-games/join`} size='small' style={{ color: 'white' }} />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
