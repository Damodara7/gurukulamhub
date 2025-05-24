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
import { DUMMY_SPONSORS } from '@/components/apps/games/RewardDialog'

function EditGamePage({ gameData = null, gameId = null }) {
  const { data: session } = useSession()
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
  }, [gameData])

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
        maxPlayers: values.limitPlayers ? Number(values.maxPlayers) : 100000,
        // Convert rewards to proper format
        rewards:
          values?.rewards.map(reward => ({
            position: reward.position,
            numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
            rewardValuePerWinner: reward.rewardValuePerWinner,
            sponsors: reward.sponsors.map(sponsor => ({
              email: sponsor.email,
              rewardDetails: {
                rewardType: sponsor.rewardType,
                ...(sponsor.rewardType === 'cash' && {
                  rewardValue: sponsor.allocated,
                  currency: sponsor.currency
                }),
                ...(sponsor.rewardType === 'physicalGift' && {
                  nonCashReward: sponsor.nonCashItem,
                  numberOfNonCashRewards: sponsor.allocated
                })
              }
            })),
            winners: reward.winners || []
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

  // Utility function to transform database rewards to UI format
const transformRewardsFromDB = (rewards) => {
  return rewards.map(reward => {
    // Calculate total allocations from sponsors
    const cashSponsors = reward.sponsors.filter(s => s.rewardDetails.rewardType === 'cash');
    const physicalSponsors = reward.sponsors.filter(s => s.rewardDetails.rewardType === 'physicalGift');
    
    const totalCash = cashSponsors.reduce((sum, s) => sum + (s.rewardDetails.rewardValue || 0), 0);
    const totalPhysical = physicalSponsors.reduce((sum, s) => sum + (s.rewardDetails.numberOfNonCashRewards || 0), 0);

    return {
      id: reward._id?.$oid || reward._id,
      position: reward.position,
      numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
      rewardValuePerWinner: reward.rewardValuePerWinner,
      rewardType: reward.sponsors[0]?.rewardDetails?.rewardType || 'cash',
      currency: reward.sponsors[0]?.rewardDetails?.currency || 'INR',
      nonCashReward: reward.sponsors[0]?.rewardDetails?.nonCashReward,
      sponsors: reward.sponsors.map(sponsor => ({
        id: sponsor._id?.$oid || sponsor._id,
        email: sponsor.email,
        name: DUMMY_SPONSORS.find(ds => ds.email === sponsor.email)?.name || sponsor.email,
        rewardType: sponsor.rewardDetails.rewardType,
        amount: sponsor.rewardDetails.rewardValue,
        currency: sponsor.rewardDetails.currency,
        availableAmount: DUMMY_SPONSORS.find(ds => ds.email === sponsor.email)?.availableAmount || 0,
        nonCashItem: sponsor.rewardDetails.nonCashReward,
        numberOfNonCashItems: sponsor.rewardDetails.numberOfNonCashRewards,
        availableItems: DUMMY_SPONSORS.find(ds => ds.email === sponsor.email)?.availableItems || 0,
        logo: DUMMY_SPONSORS.find(ds => ds.email === sponsor.email)?.logo || 'SP',
        allocated: sponsor.rewardDetails.rewardType === 'cash' 
          ? sponsor.rewardDetails.rewardValue 
          : sponsor.rewardDetails.numberOfNonCashRewards
      })),
      winners: reward.winners,
      totalCash,
      totalPhysical
    };
  });
};

  const updatedGameData = {...gameData, rewards: transformRewardsFromDB(gameData?.rewards|| [])}

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>{gameId ? 'Edit Game' : 'Create New Game'}</h1>
        <p className='text-muted-foreground'>
          {gameId ? 'Update the game details below' : 'Fill in the details below to create a new game'}
        </p>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <GameForm onSubmit={handleSubmit} quizzes={quizzes} onCancel={handleCancel} data={updatedGameData} />
      </LocalizationProvider>
    </div>
  )
}

export default EditGamePage
