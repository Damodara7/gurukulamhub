import React from 'react'
import CreateGame from '@/views/game/CreateGame';

function page({ params,searchParams }) {
  console.error("Params", params,searchParams)

  return (
    <CreateGame />
  )
}

export default page
