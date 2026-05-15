'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Avatar, Box, Tooltip, Typography, useTheme, alpha, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight, People } from '@mui/icons-material'

export function getLobbyParticipantInfo(player) {
  const profile = player?.user?.profile
  const email = player?.email || player?.user?.email || ''
  const first = profile?.firstname || profile?.firstName
  const last = profile?.lastname || profile?.lastName
  const displayName = [first, last].filter(Boolean).join(' ') || (email ? email.split('@')[0] : 'Player')
  const avatarUrl = profile?.image || profile?.profilePhotoFile?.url || null
  const initial = (displayName[0] || email[0] || '?').toUpperCase()

  return {
    id: player?._id?.toString() || email,
    displayName,
    email,
    avatarUrl,
    initial
  }
}

function LobbyParticipantTile({ participant, theme }) {
  const tileWidth = { xs: 76, sm: 84, md: 88 }

  return (
    <Tooltip title={participant.email || participant.displayName} arrow placement='top'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: tileWidth,
          minWidth: tileWidth,
          flexShrink: 0,
          scrollSnapAlign: 'start'
        }}
      >
        <Avatar
          src={participant.avatarUrl || undefined}
          alt={participant.displayName}
          sx={{
            width: { xs: 52, sm: 56, md: 60 },
            height: { xs: 52, sm: 56, md: 60 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 700,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.12)}`
          }}
        >
          {participant.initial}
        </Avatar>
        <Typography
          variant='caption'
          title={participant.displayName}
          sx={{
            mt: 0.75,
            width: '100%',
            px: 0.25,
            textAlign: 'center',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word'
          }}
        >
          {participant.displayName}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function GameLobbyParticipants({ registeredUsers = [], title = 'In the lobby', subtitle }) {
  const theme = useTheme()
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const participants = useMemo(
    () => (registeredUsers || []).map(getLobbyParticipantInfo),
    [registeredUsers]
  )

  const updateScrollButtons = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollButtons()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons, { passive: true })
    window.addEventListener('resize', updateScrollButtons)
    return () => {
      el.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [participants.length])

  const scrollBy = direction => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.75, 200)
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (!participants.length) {
    return (
      <Box
        sx={{
          py: 3,
          px: 2,
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04),
          border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`
        }}
      >
        <People sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant='body2' color='text.secondary'>
          No players in the lobby yet. Be the first to join!
        </Typography>
      </Box>
    )
  }

  const showScrollControls = participants.length > 4

  return (
    <Box
      sx={{
        py: { xs: 2, sm: 2.5 },
        px: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: { xs: 0.5, sm: 0 } }}>
        <People color='primary' fontSize='small' />
        <Typography variant='subtitle1' fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
          {title} ({participants.length})
        </Typography>
      </Box>
      {subtitle && (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 1.5, px: { xs: 0.5, sm: 0 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
        >
          {subtitle}
        </Typography>
      )}

      <Box sx={{ position: 'relative', mt: subtitle ? 0 : 1 }}>
        {showScrollControls && canScrollLeft && (
          <IconButton
            size='small'
            aria-label='Scroll players left'
            onClick={() => scrollBy(-1)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              left: -4,
              top: '50%',
              transform: 'translateY(-70%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
        {showScrollControls && canScrollRight && (
          <IconButton
            size='small'
            aria-label='Scroll players right'
            onClick={() => scrollBy(1)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              right: -4,
              top: '50%',
              transform: 'translateY(-70%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            overflowX: 'auto',
            overflowY: 'hidden',
            py: 1,
            px: { xs: 0.5, sm: 1 },
            mx: { xs: 0, sm: showScrollControls ? 2 : 0 },
            scrollSnapType: 'x proximity',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.palette.primary.main, 0.4)} transparent`,
            '&::-webkit-scrollbar': {
              height: 6
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.35)
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: alpha(theme.palette.divider, 0.2),
              borderRadius: 3
            }
          }}
        >
          {participants.map(p => (
            <LobbyParticipantTile key={p.id} participant={p} theme={theme} />
          ))}
        </Box>

        {participants.length > 4 && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              display: { xs: 'block', sm: 'none' },
              textAlign: 'center',
              mt: 0.5,
              fontStyle: 'italic'
            }}
          >
            Swipe to see all players
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default GameLobbyParticipants
