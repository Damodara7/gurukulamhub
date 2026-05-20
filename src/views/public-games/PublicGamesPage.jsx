// app/public-games/page.tsx
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  Typography,
  useTheme,
  alpha
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ReusableTabsList from '@/components/public-games/ReusableTabsList'
import ReusableFiltersList from '@components/public-games/ReusableFiltersList'
import PublicGamesList from '@/components/public-games/all-games/PublicGamesList'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { GAME_GRID_PAGE_SIZE } from '@/constants/gameListPagination'
import { normalizeGameListResult } from '@/utils/gameListApi'

export const PublicGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const statusFilter = searchParams.get('status') || 'all'
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: String(GAME_GRID_PAGE_SIZE),
        page: String(page),
        listStatus: statusFilter
      })
      if (session?.user?.email) {
        params.set('viewerEmail', session.user.email)
      }

      const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/public?${params.toString()}`)
      if (res.status === 'success') {
        const { items, totalPages: tp } = normalizeGameListResult(res.result)
        setGames(items)
        setTotalPages(tp)
        setHasLoadedOnce(true)
      } else {
        setError(res.message)
        setGames([])
        setTotalPages(0)
      }
    } catch (err) {
      setError(err.message)
      setGames([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, session?.user?.email])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, session?.user?.email])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  const handleStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
    setPage(1)
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

  const filteredGames = games?.filter(game => {
    const matchesQuiz = selectedQuizzesIds.length ? selectedQuizzesIds.includes(game.quiz._id) : true

    if (!matchesQuiz) return false
    if (game.location === 'Anywhere') {
      return true
    }
    return selectedLocations.length
      ? selectedLocations.some(loc => {
          if (loc === 'Anywhere') return true

          return (
            (loc.country && game?.location?.country === loc?.country) ||
            (loc.region && game?.location?.region === loc?.region) ||
            (loc.city && game?.location?.city === loc?.city)
          )
        })
      : true
  })

  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.default',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: { xs: 3, sm: 4, md: 6 },
          pb: { xs: 3, sm: 4, md: 6 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth='lg' sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={{ xs: 3, sm: 3.5, md: 4 }}>
            <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 0 } }}>
              <Stack
                direction='row'
                spacing={{ xs: 1, sm: 1.5 }}
                alignItems='center'
                justifyContent='center'
                sx={{ mb: { xs: 1.5, sm: 2 } }}
                flexWrap='wrap'
              >
                <EmojiEventsIcon
                  sx={{
                    fontSize: { xs: 32, sm: 36, md: 40 },
                    color: 'primary.main'
                  }}
                />
                <Typography
                  variant='h3'
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
                variant='body1'
                color='text.secondary'
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
      <Box
        sx={{
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading && !hasLoadedOnce ? (
          <Box display='flex' justifyContent='center' py={8}>
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : loading ? (
          <Box display='flex' justifyContent='center' py={8} minHeight={360}>
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : (
          <>
            <PublicGamesList
              games={filteredGames}
              loading={false}
              error={error}
              onRefresh={fetchGames}
            />
            {totalPages > 1 && !loading && (
              <Stack alignItems='center' sx={{ pt: 4, pb: 2 }}>
                <Pagination
                  color='primary'
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  showFirstButton
                  showLastButton
                  size='large'
                />
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default PublicGamesPage
