import React from 'react'
import GameRewardSponsorship from '@/components/sponsor/sponsor-games/GameRewardSponsorship'

function GameRewardSponsorshipPage({ params }) {
  const gameId = params.gameId
  const rewardId = params.rewardId

  return (
    <GameRewardSponsorship gameId={gameId} rewardId={rewardId} />
  )
}

export default GameRewardSponsorshipPage
