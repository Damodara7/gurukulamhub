'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CircularProgress, Alert } from '@mui/material'
import GamePaymentSuccess from '@/components/sponsor/sponsor-games/GamePaymentSuccess'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export default function GamePaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [sponsorship, setSponsorship] = useState(null)
  const [game, setGame] = useState(null)
  const [reward, setReward] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paymentId = searchParams.get('paymentId')
  const sponsorshipId = searchParams.get('sponsorshipId')
  const amount = searchParams.get('amount')
  const gameId = searchParams.get('gameId')
  const rewardId = searchParams.get('rewardId')

  useEffect(() => {
    if (sponsorshipId && gameId && rewardId) {
      fetchPaymentDetails()
    }
  }, [sponsorshipId, gameId, rewardId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch sponsorship details
      const sponsorshipResult = await RestApi.get(`${API_URLS.v0.GAME_SPONSORSHIP}?sponsorshipId=${sponsorshipId}`)
      
      if (sponsorshipResult?.status === 'success' && sponsorshipResult.result?.length > 0) {
        const sponsorshipData = sponsorshipResult.result[0]
        setSponsorship(sponsorshipData)
        
        // Fetch game details
        const gameResult = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${gameId}`)
        
        if (gameResult?.status === 'success') {
          setGame(gameResult.result)
          
          // Find the specific reward
          const rewardData = gameResult.result.rewards?.find(r => 
            (r._id && r._id.toString() === rewardId) || 
            r.position.toString() === rewardId
          )
          
          if (rewardData) {
            setReward(rewardData)
          } else {
            setError('Reward not found')
          }
        } else {
          setError('Game not found')
        }
      } else {
        setError('Sponsorship not found')
      }
    } catch (err) {
      console.error('Error fetching payment details:', err)
      setError('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert severity="error">{error}</Alert>
      </div>
    )
  }

  if (!sponsorship || !game || !reward) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert severity="error">Unable to load payment details</Alert>
      </div>
    )
  }

  return (
    <GamePaymentSuccess 
      paymentId={paymentId}
      sponsorship={sponsorship}
      amount={parseFloat(amount)}
      game={game}
      reward={reward}
    />
  )
}
