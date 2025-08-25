// components/public-games/PublicGamesList.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'
import GameCard from './GameCard'
import { Box, Grid, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Loading from '@/components/Loading'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const PublicGamesList = ({ games, loading, error, setGames }) => {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const statusFilter = searchParams.get('status') || 'all'
  const wsRef = useRef(null)
  // If setGames is not provided, use local state for demonstration
  const [localGames, setLocalGames] = useState(games)
  const gamesToUse = setGames ? games : localGames
  const [currentUseraudienceIds, setCurrentUseraudienceIds] = useState([])

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
            if (setGames) {
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
  }, [])

  // Fetch current user's audienceIds once
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        if (!session?.user?.email) return
        const res = await RestApi.get(`${API_URLS.v0.USER}/${session.user.email}`)
        if (res?.status === 'success') {
          const user = res.result
          console.log('Current user group Ids', user.audienceIds)
          if (user?.audienceIds) setCurrentUseraudienceIds(user.audienceIds.map(g => g?.toString?.() || g))
        }
      } catch (e) {
        // silent fail
        console.error('Error fetching user groups', e)
      }
    }
    fetchUserGroups()
  }, [session?.user?.email])

  const getUserGameStatus = (game) => {
    const userEmail = session?.user?.email

    // User participation checks should come first
    const participation = game?.participatedUsers?.find((p) => p.email === userEmail)
    if (participation) {
      return participation.completed 
        ? { status: 'completed' } 
        : { status: 'inProgress' }
    }

    // Then check game status
    if (game.status === 'cancelled') return { status: 'cancelled' }
    if (game.status === 'lobby') return { status: 'lobby' }
    if (game.status === 'approved') return { status: 'upcoming' }
    
    // Special handling for live games where user hasn't participated yet
    if (game.status === 'live') return { status: 'live' }
    
    // Registration checks
    const isRegistered = game?.registeredUsers?.some((r) => r.email === userEmail)
    if (isRegistered) {
      return game.status === 'completed' ? { status: 'missed' } : { status: 'registered' }
    }

    return { status: '' }
  }

  const filteredGames = gamesToUse.filter((game) => {
    const userStatus = getUserGameStatus(game).status
    const userEmail = session?.user?.email
    const globalStatus = game.status

    if (statusFilter === 'all') return true
    if (statusFilter === 'upcoming') return globalStatus === 'approved'
    if (statusFilter === 'registered') {
      return globalStatus === 'approved' && game.registeredUsers?.some((r) => r.email === userEmail)
    }
    if (statusFilter === 'live') {
      return globalStatus === 'live' || 
             (userStatus === 'completed' && globalStatus === 'live')
    }

    return userStatus === statusFilter
  })

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <Loading />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color='error'>Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <>
      {filteredGames.length === 0 ? (
        <Box p={4}>
          <Typography>No games found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredGames.map((game) => (
            <Grid item key={game._id || game.id} xs={12} sm={6} md={4} lg={3}>
              <GameCard game={game} currentUseraudienceIds={currentUseraudienceIds} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )
}

export default PublicGamesList