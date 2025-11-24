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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: { xs: 3, sm: 4, md: 6 },
          pb: { xs: 3, sm: 4, md: 6 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={{ xs: 3, sm: 3.5, md: 4 }}>
            {/* Title Section */}
            <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 0 } }}>
              <Stack 
                direction="row" 
                spacing={{ xs: 1, sm: 1.5 }} 
                alignItems="center" 
                justifyContent="center" 
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                flexWrap="wrap"
              >
                <EmojiEventsIcon sx={{ 
                  fontSize: { xs: 32, sm: 36, md: 40 }, 
                  color: 'primary.main' 
                }} />
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2
                  }}
                >
                  Exciting Competitions
                </Typography>
              </Stack>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' }, 
                  lineHeight: 1.7, 
                  maxWidth: 600, 
                  mx: 'auto',
                  px: { xs: 1, sm: 0 }
                }}
              >
                Join exciting live games and win amazing rewards
              </Typography>
            </Box>

            {/* Filters and Tabs */}
            <Box sx={{ width: '100%' }}>
              <ReusableTabsList tabsList={statuses} value={statusFilter} onChange={handleStatusChange} />
              <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 } }}>
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
      <Container maxWidth="lg" sx={{ 
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <PublicGamesList games={filteredGames} loading={loading} error={error} />
      </Container>
    </Box>
  )
}

export default PublicGamesPage
