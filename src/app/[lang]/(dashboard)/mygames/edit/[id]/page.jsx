import React from 'react'
import ManageGame from '@/views/game/ManageGame';
import EditGame from '@/views/game/EditGame';

function page({ params,searchParams }) {
  console.error("Params", params,searchParams)
  const {id } = params;
  return (
    <EditGame mode='edit' gameId={id}/>
  )
}

export default page
