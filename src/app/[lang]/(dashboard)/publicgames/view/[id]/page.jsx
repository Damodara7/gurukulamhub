import React from 'react'
import ViewGame from '@/views/game/ViewGame'


function page({ params,searchParams }) {
  console.error("Params", params,searchParams)
  const {id } = params;
  return <ViewGame mode='view' gameId={id}/>
}

export default page
