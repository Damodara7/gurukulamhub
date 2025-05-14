'use client'

import GameForm from '@/components/apps/games/create-game/CreateGameForm'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

function CreateGamePage() {
  const [quizzes, setQuizzes] = useState([])
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
  }, [])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      // Convert dates to ISO strings for API
      const payload = {
        ...values,
        startTime: values.startTime.toISOString(),
        registrationEndTime: values.requireRegistration 
          ? values.registrationEndTime.toISOString() 
          : null,
        // Ensure duration is a number
        duration: Number(values.duration),
        // Ensure maxPlayers is a number
        maxPlayers: Number(values.maxPlayers),
        // Convert rewards to proper format
        rewards: values.rewards.map(reward => ({
          ...reward,
          numberOfWinnersForThisPosition: Number(reward.numberOfWinnersForThisPosition),
          sponsors: reward.sponsors.map(sponsor => ({
            ...sponsor,
            rewardDetails: {
              ...sponsor.rewardDetails,
              rewardValue: sponsor.rewardDetails.rewardType === 'cash' 
                ? Number(sponsor.rewardDetails.rewardValue) 
                : undefined,
              numberOfNonCashRewards: sponsor.rewardDetails.rewardType !== 'cash' 
                ? Number(sponsor.rewardDetails.numberOfNonCashRewards) 
                : undefined
            }
          }))
        }))
      }

      const result = await RestApi.post(API_URLS.v0.GAMES, payload)

      if (result?.status === 'success') {
        toast.success('Game created successfully!')
        router.push('/apps/games') // Redirect to games list
      } else {
        console.error('Error creating game:', result)
        toast.error(result?.message || 'Failed to create game')
      }
    } catch (error) {
      console.error('Error creating game:', error)
      toast.error('An error occurred while creating the game')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/apps/games') // Redirect to games list
  }

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Game</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new game
        </p>
      </div>
      
      <GameForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        quizzes={quizzes} 
      />
    </div>
  )
}

export default CreateGamePage