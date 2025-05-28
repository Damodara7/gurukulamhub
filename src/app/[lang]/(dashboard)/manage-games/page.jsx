import { auth } from '@/libs/auth'
import AllGamesPage from '@/views/apps/games/all-games'
import React from 'react'

async function page() {
  const session = await auth()
  return <AllGamesPage creatorEmail={session?.user?.email} isSuperUser={true} />
}

export default page
