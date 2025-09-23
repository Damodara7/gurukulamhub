'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import CreatorGamesList from '@/components/apps/games/all-games/CreatorGamesList'
import { useSearchParams, useRouter } from 'next/navigation'
import ReusableTabsList from '@/components/public-games/ReusableTabsList'
import { Box, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import ReusablePopUpList from '@/components/public-games/ReusableFiltersList'

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
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const gameStatusFilter = searchParams.get('status') || 'all'
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])

  const fetchGames = async () => {
    setLoading(true)
    try {
      const params = []
      if (creatorEmail) {
        params.push(`email=${creatorEmail}`)
      }
      if (gameStatusFilter && gameStatusFilter !== 'all') {
        params.push(`status=${gameStatusFilter}`)
      }
      let url = `${API_URLS.v0.USERS_GAME}`
      // Only add ? if there are any parameters

      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const result = await RestApi.get(url)

      if (result?.status === 'success') {
        setGames(result.result || [])
      } else {
        console.error('Error fetching games:', result)
        toast.error('Failed to load games')
        setGames([])
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('An error occurred while loading games')
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [gameStatusFilter, creatorEmail])

  async function handleCreateNewGame() {
    console.log('Clicked Create new game')
    router.push(isSuperUser ? `/manage-games/create` : `/management/games/create`)
  }

  const handleGameStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
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
    <>
      <Box className='flex flex-col items-center gap-5'>
        <ReusableTabsList tabsList={gamestatuses} value={gameStatusFilter} onChange={handleGameStatusChange} />
        <ReusablePopUpList
          selectedLocations={selectedLocations}
          setSelectedLocations={setSelectedLocations}
          selectedQuizzes={selectedQuizzes}
          setSelectedQuizzes={setSelectedQuizzes}
        />
        <CreatorGamesList games={filteredGames} isSuperUser={isSuperUser} setGames={setGames} onRefresh={fetchGames} loading={loading} />
      </Box>
      <Box sx={{ position: 'relative' }}>
        <Button
          variant='contained'
          component='label'
          style={{ color: 'white', position: 'fixed', bottom: 20, right: 10, zIndex: 1001 }}
          startIcon={<AddIcon />}
          onClick={handleCreateNewGame}
        >
          Create New
        </Button>
      </Box>
    </>
  )
}

export default AllGamesPage
