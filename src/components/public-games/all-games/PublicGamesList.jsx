// components/public-games/PublicGamesList.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'
import GameCard from './GameCard'
import { Box, Grid, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import Loading from '@/components/Loading'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import FallBackCard from '@/components/apps/games/FallBackCard'
const PublicGamesList = ({ games, loading, error, setGames, onRefresh }) => {
  const { data: session } = useSession()
  const wsRef = useRef(null)
  // If setGames is not provided, use local state for demonstration
  const [localGames, setLocalGames] = useState(games)
  const gamesToUse = setGames ? games : localGames
  const [currentUserGroupIdIds, setCurrentUserGroupIdIds] = useState([])
  const [currentUserProfile, setCurrentUserProfile] = useState(null)

  useEffect(() => {
    // console.log('games', games)
    setLocalGames(games)
  }, [games])

  useEffect(() => {
    // WebSocket connection for real-time games list updates
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games`
        : ''
    if (wsUrl) {
      wsRef.current = new WebSocket(wsUrl)
      wsRef.current.onopen = () => {
        console.log('[WS] Connected to games list updates')
      }
      wsRef.current.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'gamesList') {
            if (onRefresh) {
              onRefresh()
            } else if (setGames) {
              setGames(msg.data)
            } else {
              setLocalGames(msg.data)
            }
          }
        } catch (e) {
          console.error('[WS] Error parsing games list message', e)
        }
      }
      wsRef.current.onerror = err => {
        console.error('[WS] Games list error', err)
      }
      wsRef.current.onclose = () => {
        console.log('[WS] Games list connection closed')
      }
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [onRefresh, setGames])

  // Fetch current user's groupIds + profile once
  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        if (!session?.user?.email) return
        const [userRes, profileRes] = await Promise.all([
          RestApi.get(`${API_URLS.v0.USER}/${session.user.email}`),
          RestApi.get(`${API_URLS.v0.USERS_PROFILE}?email=${encodeURIComponent(session.user.email)}`)
        ])
        if (userRes?.status === 'success') {
          const user = userRes.result
          if (user?.groupIds) setCurrentUserGroupIdIds(user.groupIds.map(g => g?.toString?.() || g))
        }
        if (profileRes?.status === 'success') {
          const profilePayload = profileRes.result
          const normalizedProfile =
            profilePayload?.profile || (Array.isArray(profilePayload) ? profilePayload[0] : profilePayload) || null
          setCurrentUserProfile(normalizedProfile)
        }
      } catch (e) {
        console.error('Error fetching user context', e)
      }
    }
    fetchUserContext()
  }, [session?.user?.email])

  // Status tabs are filtered server-side via listStatus; quiz/location filters apply to the current page.
  const filteredGames = gamesToUse

  if (loading) {
    return (
      <Box p={{ xs: 2, sm: 3, md: 4 }} display='flex' justifyContent='center' minHeight={200}>
        <Loading />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={{ xs: 2, sm: 3, md: 4 }}>
        <FallBackCard error={error} content='Error: {error}' path='/' btnText='Back To Home Page' />
      </Box>
    )
  }

  return (
    <>
      {filteredGames.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 6, sm: 8, md: 10 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Box
            sx={{
              fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
              mb: { xs: 1.5, sm: 2 },
              opacity: 0.7
            }}
          >
            🏆
          </Box>
          <Typography
            variant='h5'
            fontWeight={700}
            gutterBottom
            sx={{
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              textAlign: 'center'
            }}
          >
            No Games Found
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            textAlign='center'
            sx={{
              maxWidth: 400,
              lineHeight: 1.7,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            No competitions match your current filters. Try adjusting your search criteria.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {filteredGames.map(game => (
            <Grid item key={game._id || game.id} xs={12} sm={6} md={4}>
              <GameCard game={game} currentUsergroupIds={currentUserGroupIdIds} currentUserProfile={currentUserProfile} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default PublicGamesList
