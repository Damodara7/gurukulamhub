import React from 'react'
import EditGamePage from '@/views/apps/games/edit-game';

function page({ params,searchParams }) {
  console.error("Params", params,searchParams)
  const {id } = params;
  return (
    <EditGamePage mode='edit' gameId={id}/>
  )
}

export default page
