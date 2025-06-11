'use client'

import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import GameForm from '@/components/apps/games/GameForm'
import NonEditableGamePage from '@/components/apps/games/game-details/NonEditableGamePage'
function EditGamePage({ gameData = null, gameId = null, isSuperUser = false }) {
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
      let payload = {
        ...values,
        updatedBy: session?.user?.id,
        updaterEmail: session?.user?.email,
        startTime: values.startTime, //.toISOString()
        registrationEndTime: values.requireRegistration ? values.registrationEndTime : null,
        // Ensure duration is a number
        duration: Number(values.duration) * 60, // because duration entered by user is in minutes
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
              sponsorshipId: sponsor.sponsorshipId,
              rewardDetails: {
                rewardType: sponsor.rewardType,
                allocated: sponsor.allocated,
                currency: sponsor.currency,
                ...(sponsor.rewardType === 'cash' && {
                  rewardValue: sponsor.allocated
                }),
                ...(sponsor.rewardType === 'physicalGift' && {
                  nonCashReward: sponsor.nonCashItem,
                  numberOfNonCashRewards: sponsor.allocated,
                  rewardValuePerItem: sponsor.rewardValuePerItem,
                  rewardValue: sponsor.allocated * sponsor.rewardValuePerItem
                })
              }
            })),
            winners: reward.winners || []
          })) || []
      }

      if (gameData?.status === 'cancelled') {
        payload = {
          ...payload,
          cancellationReason: null,
          ...(isSuperUser
            ? { status: 'created', approvedBy: null, approverEmail: null, approvedAt: null }
            : { status: 'approved', approverEmail: session?.user?.email, approvedAt: new Date() })
        }
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
        router.push(isSuperUser ? '/manage-games' : '/apps/games') // Redirect to games list
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
    router.push(isSuperUser ? '/manage-games' : '/apps/games') // Redirect to games list
  }

  if (loading && (quizzes.length === 0 || (gameId && !gameData))) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  //main conditional rendering

  if (!['created', 'cancelled'].includes(gameData?.status)) {
    return <NonEditableGamePage gameData={gameData} />
  }

  // Utility function to transform database rewards to UI format
  const transformRewardsFromDB = rewards => {
    return rewards.map(reward => {
      // Calculate total allocations from sponsors
      const cashSponsors = reward.sponsors.filter(s => s.rewardDetails.rewardType === 'cash')
      const physicalSponsors = reward.sponsors.filter(s => s.rewardDetails.rewardType === 'physicalGift')

      const totalCash = cashSponsors.reduce((sum, s) => sum + (s.rewardDetails.rewardValue || 0), 0)
      const totalPhysical = physicalSponsors.reduce((sum, s) => sum + (s.rewardDetails.numberOfNonCashRewards || 0), 0)

      return {
        ...reward,
        id: reward._id,
        position: reward.position,
        numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
        rewardValuePerWinner: reward.rewardValuePerWinner,
        rewardType: reward.sponsors[0]?.rewardDetails?.rewardType || 'cash',
        currency: reward.sponsors[0]?.rewardDetails?.currency || 'INR',
        nonCashReward: reward.sponsors[0]?.rewardDetails?.nonCashReward,
        sponsors: reward.sponsors.map(sponsor => {
          const rewardType = sponsor.rewardDetails.rewardType
          const allocated = sponsor.rewardDetails.allocated
          const available = rewardType === 'cash' ? sponsor.sponsorshipId.availableAmount : sponsor.sponsorshipId.availableItems
          
          return {
            ...sponsor.sponsorshipId,
            ...sponsor,
            sponsorshipId: sponsor.sponsorshipId._id,
            ...sponsor.rewardDetails,
            _id: sponsor._id,
            id: sponsor._id,
            allocated: allocated,
            ...(rewardType === 'cash' ? {
              availableAmount: available,
              prevAvailableAmount: available , // Store the original available amount before allocation
            } : {
              availableItems: available,
              prevAvailableItems: available, // Store the original available amount before allocation
            }),
            rewardType: rewardType,
            currency: sponsor.rewardDetails.currency
          }
        }),
        winners: reward.winners
      }
    })
  }

  const updatedGameData = { ...gameData, rewards: transformRewardsFromDB(gameData?.rewards || []) }

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
