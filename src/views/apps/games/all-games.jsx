'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import GamesList from '@/components/apps/games/all-games/GamesList'

const AllGamesPage = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const fetchGames = async () => {
    setLoading(true)
    try {
      const result = await RestApi.get(API_URLS.v0.USERS_GAME)
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
  }, [])

  const handleApprove = async gameId => {
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_GAME}`, {
        status: 'live',
        _id: gameId
      })

      if (result?.status === 'success') {
        toast.success('Game approved and set to live!')
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

  if (loading) {
    return <div className='text-center py-8'>Loading games...</div>
  }

  async function handleViewGame(id){
    console.log('Clicked View game of id: ', id)
  }

  return (
    <GamesList games={games} onApprove={handleApprove} onViewGame={handleViewGame} />
  )
}

export default AllGamesPage
