import React from 'react'
import CreateGamePage from '@/views/apps/games/create-game';

function page({ params,searchParams }) {

  return (
    <CreateGamePage isSuperUser={true} />
  )
}

export default page
