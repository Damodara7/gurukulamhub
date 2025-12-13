'use client'
import React from 'react'
import { Box, Typography, Chip, useTheme, alpha } from '@mui/material'
import { useSession } from 'next-auth/react'

const SystemMessage = ({ message, getSenderName }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const { data: session } = useSession()

  const msg = message.message
  const currentUserEmail = session?.user?.email
  const currentUserName = getSenderName(currentUserEmail || '')

  // Parse "____ was added by ____" or "____ was removed by ____"
  const addedMatch = msg.match(/^(.+?)\s+was\s+added\s+by\s+(.+?)$/i)
  const removedMatch = msg.match(/^(.+?)\s+was\s+removed\s+by\s+(.+?)$/i)

  const renderContent = () => {
    if (addedMatch) {
      const [, userName, adminName] = addedMatch
      const isYou = currentUserEmail && (
        userName.toLowerCase() === currentUserName.toLowerCase() ||
        userName.toLowerCase().includes(currentUserEmail.split('@')[0].toLowerCase())
      )
      const isYouAdmin = message.senderEmail === currentUserEmail

      return (
        <>
          <Typography component='span' sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {isYou ? 'You' : userName}
          </Typography>
          <Typography component='span'>was added by</Typography>
          <Typography component='span' sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
            {isYouAdmin ? 'you' : adminName}
          </Typography>
        </>
      )
    }

    if (removedMatch) {
      const [, userName, adminName] = removedMatch
      const isYou = currentUserEmail && (
        userName.toLowerCase() === currentUserName.toLowerCase() ||
        userName.toLowerCase().includes(currentUserEmail.split('@')[0].toLowerCase())
      )
      const isYouAdmin = message.senderEmail === currentUserEmail

      return (
        <>
          <Typography component='span' sx={{ fontWeight: 600, color: theme.palette.error.main }}>
            {isYou ? 'You' : userName}
          </Typography>
          <Typography component='span'>was removed by</Typography>
          <Typography component='span' sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
            {isYouAdmin ? 'you' : adminName}
          </Typography>
        </>
      )
    }

    return <Typography component='span'>{msg}</Typography>
  }

  return (
    <Box
      sx={{
        textAlign: 'center',
        background: alpha(theme.palette.info.light, isDarkMode ? 0.15 : 0.1),
        borderRadius: 1,
        my: { xs: 0.75, sm: 1 },
        px: { xs: 1, sm: 2 },
        py: 1
      }}
    >
      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
          fontStyle: 'italic',
          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 0.5
        }}
      >
        {renderContent()}
      </Typography>
    </Box>
  )
}

export default SystemMessage

