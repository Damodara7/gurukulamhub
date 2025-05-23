'use client'

import GameForm from '@/components/apps/games/create-game/CreateGameForm'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function EditGamePage({ gameData = null, gameId=null }) {
  const { data: session } = useSession()
  const [quizzes, setQuizzes] = useState([])
  // const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getQuizData() {
      setLoading(true)
      try {
        const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}`)
        if (result?.status === 'success') {
          setQuizzes(result.result)
        } else {
          console.error('Error Fetching quizzes:', result)
          toast.error('Failed to load quizzes')
          setQuizzes([])
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error)
        toast.error('An error occurred while loading quizzes')
        setQuizzes([])
      } finally {
        setLoading(false)
      }
    }

    getQuizData()
  }, [gameData])

  // useEffect(() => {
  //   async function getGameData() {
  //     if (!gameId) return

  //     setLoading(true)
  //     try {
  //       const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${gameId}`)
  //       console.log(result)
  //       if (result?.status === 'success') {
  //         setGameData(result.result)
  //       } else {
  //         console.error('Error Fetching game:', result.message)
  //         toast.error('Failed to load game data')
  //         setGameData(null)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching game:', error)
  //       toast.error('An error occurred while loading game data')
  //       setGameData(null)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   getGameData()
  // }, [gameId])

  const handleSubmit = async values => {
    try {
      console.log('formData: ', values)
      setLoading(true)
      // Convert dates to ISO strings for API
      const payload = {
        ...values,
        createdBy: session?.user?.id,
        creatorEmail: session?.user?.email,
        startTime: values.startTime.toISOString(),
        registrationEndTime: values.requireRegistration ? values.registrationEndTime.toISOString() : null,
        // Ensure duration is a number
        duration: Number(values.duration),
        // Ensure maxPlayers is a number
        maxPlayers: Number(values.maxPlayers),
        // Convert rewards to proper format
        rewards:
          values?.rewards?.map(reward => ({
            ...reward,
            numberOfWinnersForThisPosition: Number(reward.numberOfWinnersForThisPosition),
            sponsors: reward.sponsors.map(sponsor => ({
              ...sponsor,
              rewardDetails: {
                ...sponsor.rewardDetails,
                rewardValue:
                  sponsor.rewardDetails.rewardType === 'cash' ? Number(sponsor.rewardDetails.rewardValue) : undefined,
                numberOfNonCashRewards:
                  sponsor.rewardDetails.rewardType !== 'cash'
                    ? Number(sponsor.rewardDetails.numberOfNonCashRewards)
                    : undefined
              }
            }))
          })) || []
      }

      console.log('payload: ', payload)

      let result
      if (gameId) {
        // Update existing game
        result = await RestApi.put(`${API_URLS.v0.USERS_GAME}`, payload)
      } else {
        // Create new game
        result = await RestApi.post(API_URLS.v0.USERS_GAME, payload)
      }

      if (result?.status === 'success') {
        toast.success(`Game ${gameId ? 'updated' : 'created'} successfully!`)
        router.push('/apps/games') // Redirect to games list
      } else {
        console.error(`Error ${gameId ? 'updating' : 'creating'} game:`, result.message)
        toast.error(result?.message || `Failed to ${gameId ? 'update' : 'create'} game`)
      }
    } catch (error) {
      console.error(`Error ${gameId ? 'updating' : 'creating'} game:`, error)
      toast.error(`An error occurred while ${gameId ? 'updating' : 'creating'} the game`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/apps/games') // Redirect to games list
  }

  if (loading && (quizzes.length === 0 || (gameId && !gameData))) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>{gameId ? 'Edit Game' : 'Create New Game'}</h1>
        <p className='text-muted-foreground'>
          {gameId ? 'Update the game details below' : 'Fill in the details below to create a new game'}
        </p>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <GameForm
          onSubmit={handleSubmit}
          quizzes={quizzes}
          onCancel={handleCancel}
          data={gameData}
        />
      </LocalizationProvider>
    </div>
  )
}

export default EditGamePage
