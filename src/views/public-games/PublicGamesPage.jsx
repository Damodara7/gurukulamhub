// app/public-games/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Grid } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSearchParams, useRouter } from 'next/navigation'
import ReusableTabsList from '@/components/public-games/ReusableTabsList'
import PublicGamesList from '@/components/public-games/all-games/PublicGamesList'

export const PublicGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusFilter = searchParams.get('status') || 'all'

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/public`)
        if (res.status === 'success') {
          setGames(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
    router.push(`?${params.toString()}`)
  }

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'lobby', label: 'Lobby' },
    { value: 'live', label: 'Live' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'registered', label: 'Registered' },
    { value: 'missed', label: 'Missed' },
    { value: 'completed', label: 'You Finished' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <Box p={4} className='flex flex-col items-center gap-5'>
      <ReusableTabsList tabsList={statuses} value={statusFilter} onChange={handleStatusChange} />
      <PublicGamesList games={games} loading={loading} error={error} />
    </Box>
  )
}

export default PublicGamesPage
