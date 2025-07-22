import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GameDetailsPage from '@/views/apps/games/game-details'

import FallBackCard from '@/components/apps/games/FallBackCard'

async function getGameData(gameId) {
  try {
    const result = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${gameId}`)
    if (result?.status === 'success') {
      return result.result
    }
    console.error('Error Fetching game:', result.message)
    return null
  } catch (error) {
    console.error('Error fetching game:', error)
    return null
  }
}

export default async function page({ params }) {
  const { id } = params
  const [gameData] = await Promise.all([getGameData(id)])

  if (!gameData) {
    // You might want to redirect or show a not found page here
    return <FallBackCard content='You can go back to All Games' path='/manage-games' btnText='Back To All Games' />
  }

  return <GameDetailsPage gameId={id} game={gameData} />
}
