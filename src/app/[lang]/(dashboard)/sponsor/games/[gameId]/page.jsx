
import React from 'react'
import SponsorGameDetails from '@/components/sponsor/sponsor-games/SponsorGameDetails'

function SponsorGameDetailsPage({ params }) {
  const gameId = params.gameId

  return <SponsorGameDetails gameId={gameId} />
}

export default SponsorGameDetailsPage