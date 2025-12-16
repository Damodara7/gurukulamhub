'use client'

import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
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

function CreateGamePage({ isSuperUser = false }) {
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
          setQuizzes(result?.result || [])
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
        creatorEmail: session?.user?.email
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
          rewards:
            values?.rewards.map(reward => ({
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
          rewards:
            values?.rewards?.map(reward => ({
              ...(reward._id && { _id: reward._id }),
              position: reward.position,
              numberOfWinnersForThisPosition: reward.numberOfWinnersForThisPosition,
              rewardValuePerWinner: reward.rewardValuePerWinner,
              rewardType: reward.rewardType,
              currency: reward.currency,
              nonCashReward: reward.nonCashReward,
              sponsors:
                reward.sponsors?.map(sponsor => ({
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

  const handleModeSelect = mode => {
    setCreationMode(mode)
  }

  if (loading && quizzes.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '50vh', md: '64vh' },
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48, md: 56 },
            height: { xs: 40, sm: 48, md: 56 },
            border: '3px solid',
            borderColor: 'primary.main',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        />
      </Box>
    )
  }

  // Show mode selector for new games only
  if (!creationMode) {
    return <GameCreationModeSelector onModeSelect={handleModeSelect} />
  }

  return (
      <Box sx={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {creationMode === 'request_sponsorship' ? (
              <GameRequestSponsorshipForm onSubmit={handleSubmit} quizzes={quizzes} onCancel={handleCancel} />
            ) : (
              <GameForm onSubmit={handleSubmit} quizzes={quizzes} onCancel={handleCancel} />
            )}
        </LocalizationProvider>
      </Box>
  )
}

export default CreateGamePage
