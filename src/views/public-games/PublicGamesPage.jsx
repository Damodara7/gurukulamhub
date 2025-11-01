// app/public-games/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Box, Container, Typography, Stack, useTheme, alpha } from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSearchParams, useRouter } from 'next/navigation'
import ReusableTabsList from '@/components/public-games/ReusableTabsList'
import ReusableFiltersList from '@components/public-games/ReusableFiltersList'
import PublicGamesList from '@/components/public-games/all-games/PublicGamesList'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

export const PublicGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusFilter = searchParams.get('status') || 'all'
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])

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

  console.log('games data' , games);
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

  const selectedQuizzesIds = selectedQuizzes?.map(q => q._id) || []

  let filteredGames = games?.filter(game => {
    // Quiz filter condition
    const matchesQuiz = selectedQuizzesIds.length ? selectedQuizzesIds.includes(game.quiz._id) : true

    if(!matchesQuiz) return false
    // Check if game location is "Anywhere" - matches all location filters
    if (game.location === 'Anywhere') {
      
      return true
    }
    console.log('game location', game.location)
    // Check if game matches ANY location condition (country OR region OR city)
    return  selectedLocations.length ? selectedLocations.some(loc => {

      if (loc === 'Anywhere') return true

      return (
        (loc.country && game?.location?.country === loc?.country) ||
        (loc.region && game?.location?.region === loc?.region) ||
        (loc.city && game?.location?.city === loc?.city)
      )

    }) : true
  })

  const theme = useTheme()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 },
          borderBottom: '1px solid #e8eaed'
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {/* Title Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Exciting Competitions
                </Typography>
              </Stack>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 600, mx: 'auto' }}>
                Join exciting live games and win amazing rewards
              </Typography>
            </Box>

            {/* Filters and Tabs */}
            <Box>
              <ReusableTabsList tabsList={statuses} value={statusFilter} onChange={handleStatusChange} />
              <Box sx={{ mt: 3 }}>
                <ReusableFiltersList 
                  selectedLocations={selectedLocations} 
                  setSelectedLocations={setSelectedLocations} 
                  selectedQuizzes={selectedQuizzes} 
                  setSelectedQuizzes={setSelectedQuizzes} 
                />
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Games List */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <PublicGamesList games={filteredGames} loading={loading} error={error} />
      </Container>
    </Box>
  )
}

export default PublicGamesPage
