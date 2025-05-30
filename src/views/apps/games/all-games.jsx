'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import GamesList from '@/components/apps/games/all-games/GamesList'
import { useSearchParams , useRouter } from 'next/navigation'
import ReusableTabsList from '@/components/public-games/ReusableTabsList';
import { Box } from '@mui/material'


const AllGamesPage = ({ creatorEmail = '', isSuperUser = false }) => {
  const router = useRouter()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const gameStatusFilter = searchParams.get('status') || 'all'
  
  const gamestatuses = [
    {value: 'all', label: 'All'},
    {value: 'created', label: 'Created'},
    {value: 'approved', label: 'Approved'},
    {value: 'lobby', label: 'Lobby'},
    {value: 'live', label: 'Live'},
    {value: 'completed', label: 'Completed'},
    {value: 'cancelled', label: 'Cancelled'},
  ]

  const handleGameStatusChange = newStatus => {
    const params = new URLSearchParams(searchParams.toString())
    newStatus === 'all' ? params.delete('status') : params.set('status', newStatus)
    router.push(`?${params.toString()}`)
  }

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
      
        if(params.length > 0) {
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

  const handleApprove = async gameId => {
    try {
      const result = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${gameId}/approve`, {
        status: 'approved',
        approvedBy: session?.user?.id,
        approverEmail: session?.user?.email
      })

      if (result?.status === 'success') {
        toast.success('Game approved!')
        fetchGames() // Refresh the list
      } else {
        console.error('Error approving game:', result)
        toast.error(result?.message || 'Failed to approve game')
      }
    } catch (error) {
      console.error('Error approving game:', error)
      toast.error('An error occurred while approving game')
    }
  }

  const handleDeleteGame = async gameId => {
    if (!session?.user?.email) {
      toast.error('Authentication required')
      return
    }
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_GAME}?id=${gameId}`, { email: session?.user?.email })
      if (result?.status === 'success') {
        await fetchGames() // Refresh the list
        toast.success('Game deleted successfully!')
      } else {
        console.error('Error deleting game:', result)
        toast.error(result?.message || 'Failed to delete game')
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('An error occurred while deleting game')
    }
  }

  if (loading) {
    return <div className='text-center py-8'>Loading games...</div>
  }

  async function handleViewGame(id) {
    console.log('Clicked View game of id: ', id)
    router.push(isSuperUser ? `/manage-games/${id}` : `/apps/games/${id}`)
  }
  async function handleEditGame(id) {
    console.log('Clicked Edit game of id: ', id)
    router.push(isSuperUser ? `/manage-games/${id}/edit` : `/apps/games/${id}/edit`)
  }
  async function handleCreateNewGame() {
    console.log('Clicked Create new game')
    router.push(isSuperUser ? `/manage-games/create` : `/apps/games/create`)
  }

  return (
    <Box className='flex flex-col items-center p-4'>
      <ReusableTabsList tabsList={gamestatuses} value={gameStatusFilter} onChange={handleGameStatusChange} />
      <GamesList
        games={games}
        onApprove={handleApprove}
        onViewGame={handleViewGame}
        onEditGame={handleEditGame}
        onDeleteGame={handleDeleteGame}
        onCreateNew={handleCreateNewGame}
        isSuperUser={isSuperUser}
      />
    </Box>
  )
}

export default AllGamesPage
