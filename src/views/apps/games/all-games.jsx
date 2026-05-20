'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import CreatorGamesList from '@/components/apps/games/all-games/CreatorGamesList'
import { useSearchParams, useRouter } from 'next/navigation'
import ReusableTabsList from '@/components/public-games/ReusableTabsList'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  Typography,
  useTheme,
  alpha
} from '@mui/material'
import { Add as AddIcon, Games as GamesIcon } from '@mui/icons-material'
import ReusablePopUpList from '@/components/public-games/ReusableFiltersList'
import { GAME_GRID_PAGE_SIZE } from '@/constants/gameListPagination'
import { normalizeGameListResult } from '@/utils/gameListApi'

const gamestatuses = [
  { value: 'all', label: 'All' },
  { value: 'created', label: 'Created' },
  { value: 'approved', label: 'Approved' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'awaiting_sponsorship', label: 'Awaiting Sponsorship' },
  { value: 'sponsored', label: 'Sponsored' }
]

const AllGamesPage = ({ creatorEmail = '', isSuperUser = false }) => {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const gameStatusFilter = searchParams.get('status') || 'all'
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])
  const theme = useTheme()

  const fetchGames = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(GAME_GRID_PAGE_SIZE),
        page: String(page)
      })
      if (creatorEmail) {
        params.set('email', creatorEmail)
      }
      if (gameStatusFilter && gameStatusFilter !== 'all') {
        params.set('status', gameStatusFilter)
      }

      const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?${params.toString()}`)

      if (result?.status === 'success') {
        const { items, totalPages: tp } = normalizeGameListResult(result.result)
        setGames(items)
        setTotalPages(tp)
        setHasLoadedOnce(true)
      } else {
        console.error('Error fetching games:', result)
        toast.error('Failed to load games')
        setGames([])
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('An error occurred while loading games')
      setGames([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [page, gameStatusFilter, creatorEmail])

  useEffect(() => {
    setPage(1)
  }, [gameStatusFilter, creatorEmail])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  async function handleCreateNewGame() {
    console.log('Clicked Create new game')
    router.push(isSuperUser ? `/manage-games/create` : `/management/games/create`)
  }

  const handleGameStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
    setPage(1)
    router.push(`?${params.toString()}`)
  }

  const selectedQuizzesIds = selectedQuizzes?.map(q => q._id) || []

  let filteredGames = games?.filter(game => {
    // Quiz filter condition
    const matchesQuiz = selectedQuizzesIds.length ? selectedQuizzesIds.includes(game.quiz._id) : true

    if (!matchesQuiz) return false
    // Check if game location is "Anywhere" - matches all location filters
    if (game.location === 'Anywhere') {
      return true
    }
    console.log('game location', game.location)
    // Check if game matches ANY location condition (country OR region OR city)
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

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg' sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 3 }} alignItems='center'>
            {/* Elegant Title */}
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              {/* Icon and Title */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  mb: { xs: 1.5, sm: 2 },
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: { xs: 40, sm: 48, md: 56 },
                    height: { xs: 40, sm: 48, md: 56 },
                    borderRadius: { xs: '10px', sm: '12px' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <GamesIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 }, color: 'white' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                >
                  Game Management
                </Typography>
              </Box>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.05rem' },
                  lineHeight: { xs: 1.6, sm: 1.8 },
                  width: '100%',
                  mx: 'auto',
                  fontWeight: 400,
                  px: { xs: 1, sm: 0 }
                }}
              >
                create, manage and monitor your games
              </Typography>
            </Box>

            {/* Filters and Tabs */}
            <Box sx={{ width: '100%' }}>
              <ReusableTabsList tabsList={gamestatuses} value={gameStatusFilter} onChange={handleGameStatusChange} />
              <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                <ReusablePopUpList
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
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
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
            <CreatorGamesList
              games={filteredGames}
              isSuperUser={isSuperUser}
              setGames={setGames}
              onRefresh={fetchGames}
              loading={false}
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

      {/* Create New Button - Mobile: Below cards, Desktop: Fixed position */}
      <Box
        sx={{
          position: { xs: 'relative', sm: 'fixed' },
          display: { xs: 'flex', sm: 'block' },
          justifyContent: { xs: 'center', sm: 'flex-start' },
          width: { xs: '100%', sm: 'auto' },
          mt: { xs: 3, sm: 0 },
          mb: { xs: 3, sm: 0 }
        }}
      >
        <Button
          variant='contained'
          component='label'
          sx={{
            color: 'white',
            position: { xs: 'relative', sm: 'fixed' },
            bottom: { xs: 'auto', sm: 20 },
            right: { xs: 'auto', sm: 20 },
            zIndex: 1001,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 3, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            boxShadow: 3,
            width: { xs: 'auto', sm: 'auto' },
            '&:hover': {
              boxShadow: 6
            }
          }}
          startIcon={<AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
          onClick={handleCreateNewGame}
        >
          Create New
        </Button>
      </Box>
    </Box>
  )
}

export default AllGamesPage
