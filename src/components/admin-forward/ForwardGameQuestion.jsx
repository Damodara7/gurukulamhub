'use client'
import React, {useEffect, useState } from 'react' // Combined import
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import AdminForwardLivePage from './AdminForwardLivePage'
import AdminForwardPage from './AdminForwardPage'
function ForwardGameQuestion({ gameId }) {
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${gameId}`)
        if (res.status === 'success') {
          setGameData(res?.result || [])
        } else {
          setError(res.message)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [gameId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!gameData) return <p>No game data found</p>

  if (
    gameData?.status === 'approved' ||
    gameData?.status === 'lobby'    ||
    gameData?.status === 'completed' ||
    gameData?.status === 'cancelled'
  ) {
    return (
      <AdminForwardPage game={gameData} setGame={setGameData}/>
    )
  }

  if (gameData?.status === 'live') {
    const { quiz, questions, ...restGameData } = gameData
    return <AdminForwardLivePage quiz={quiz} questions={questions} game={restGameData} setGame={setGameData} />
  }
  return null
}

export default ForwardGameQuestion
