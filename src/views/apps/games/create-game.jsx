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
import GameCreationModeSelector from '@/components/apps/games/GameCreationModeSelector'
import GameRequestSponsorshipForm from '@/components/apps/games/GameRequestSponsorshipForm'

function CreateGamePage({ isSuperUser = false }){
  const { data: session } = useSession()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creationMode, setCreationMode] = useState(null) // null, 'existing_sponsors', 'request_sponsorship'
  const router = useRouter()

  useEffect(() => {
    async function getQuizData() {
      setLoading(true)
      try {
        const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?approvalState=approved&privacyFilter=PUBLIC`)
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

  const handleSubmit = async values => {
    try {
      console.log('formData: ', values)
      setLoading(true)
      
      // Handle different creation modes
      let payload = {
        ...values,
        createdBy: session?.user?.id,
        creatorEmail: session?.user?.email,
      }

      if (creationMode === 'existing_sponsors') {
        // Original flow - with scheduling
        payload = {
          ...payload,
          startTime: values.startTime,
          registrationEndTime: values.requireRegistration ? values.registrationEndTime : null,
          timezone: values.timezone,
          duration: Number(values.duration) * 60,
          maxPlayers: values.limitPlayers ? Number(values.maxPlayers) : 100000,
          rewards: values?.rewards.map(reward => ({
            ...(reward._id && { _id: reward._id }),
            position: reward.position,
            numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
            rewardValuePerWinner: reward.rewardValuePerWinner,
            sponsors: reward.sponsors.map(sponsor => ({
              ...(sponsor._id && { _id: sponsor._id }),
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
          })) || [],
          ...(session?.user?.roles?.includes('ADMIN')
            ? { status: 'approved', approvedBy: session?.user?.id, approvedAt: new Date() }
            : {})
        }
      } else if (creationMode === 'request_sponsorship') {
        // New flow - requesting sponsorship
        payload = {
          ...payload,
          status: 'awaiting_sponsorship',
          gameMode: values.gameMode,
          duration: values.gameMode === 'self-paced' ? Number(values.duration) * 60 : null,
          maxPlayers: values.limitPlayers ? Number(values.maxPlayers) : 100000,
          rewards: values?.rewards?.map(reward => ({
            ...(reward._id && { _id: reward._id }),
            position: reward.position,
            numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
            rewardValuePerWinner: reward.rewardValuePerWinner,
            rewardType: reward.rewardType,
            currency: reward.currency,
            nonCashReward: reward.nonCashReward,
            sponsors: reward.sponsors?.map(sponsor => ({
              ...(sponsor._id && { _id: sponsor._id }),
              email: sponsor.email,
              sponsorshipId: sponsor.sponsorshipId,
              allocated: sponsor.allocated,
              rewardType: sponsor.rewardType,
              currency: sponsor.currency,
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
            })) || [],
            winners: reward.winners || []
          })) || []
        }
      }

      if (values.gameMode !== 'self-paced') {
        delete payload.duration
      }
      if (values.gameMode !== 'live') {
        delete payload.forwardType
      }

      console.log('payload: ', payload)

      const result = await RestApi.post(API_URLS.v0.USERS_GAME, payload)

      if (result?.status === 'success') {
        toast.success('Game created successfully!')
        router.push(isSuperUser ? '/manage-games' : '/management/games') // Redirect to games list
      } else {
        console.error('Error creating game:', result.message)
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
    if (creationMode) {
      setCreationMode(null)
    } else {
      router.push(isSuperUser ? '/manage-games' : '/management/games') // Redirect to games list
    }
  }

  const handleModeSelect = (mode) => {
    setCreationMode(mode)
  }

  if (loading && quizzes.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  // Show mode selector for new games only
  if (!creationMode) {
    return (
      <div className='p-4'>
        <GameCreationModeSelector onModeSelect={handleModeSelect} />
      </div>
    )
  }

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>
          {creationMode === 'existing_sponsors' ? 'Create & Schedule Game' : 'Create Game & Request Sponsorship'}
        </h1>
        <p className='text-muted-foreground'>
          {creationMode === 'existing_sponsors' ? 'Fill in the details below to create and schedule your game' : 'Fill in the details below to create your game and request sponsorships'}
        </p>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {creationMode === 'request_sponsorship' ? (
          <GameRequestSponsorshipForm 
            onSubmit={handleSubmit} 
            quizzes={quizzes} 
            onCancel={handleCancel} 
          />
        ) : (
          <GameForm 
            onSubmit={handleSubmit} 
            quizzes={quizzes} 
            onCancel={handleCancel} 
          />
        )}
      </LocalizationProvider>
    </div>
  )
}

export default CreateGamePage
