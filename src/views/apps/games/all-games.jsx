'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'

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

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>All Games</h1>

      {games.length === 0 ? (
        <div className='text-center py-8'>No games found</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {games.map(game => (
            <div key={game._id} className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-200'>
              {game.thumbnailPoster && (
                <img src={game.thumbnailPoster} alt={game.title} className='w-full h-48 object-cover' />
              )}

              <div className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h2 className='text-xl font-semibold'>{game.title}</h2>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      game.status === 'created'
                        ? 'bg-yellow-100 text-yellow-800'
                        : game.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {game.status}
                  </span>
                </div>

                <p className='text-gray-600 mb-3 line-clamp-2'>{game.description}</p>

                <div className='flex flex-wrap gap-1 mb-3'>
                  {game.tags?.map(tag => (
                    <span key={tag} className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className='grid grid-cols-2 gap-2 text-sm mb-4'>
                  <div>
                    <p className='text-gray-500'>Start Time</p>
                    <p>{new Date(game.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Duration</p>
                    <p>{Math.floor(game.duration / 60)} mins</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Players</p>
                    <p>
                      {game.participatedUsers?.length || 0} / {game.maxPlayers || '∞'}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Creator</p>
                    <p>{game.creatorEmail}</p>
                  </div>
                </div>

                <div className='flex justify-end space-x-2'>
                  {game.status === 'created' && (
                    <button
                      onClick={() => handleApprove(game._id)}
                      className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition'
                    >
                      Approve
                    </button>
                  )}
                  <button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllGamesPage
