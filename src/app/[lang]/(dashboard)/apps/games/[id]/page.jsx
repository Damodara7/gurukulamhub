import React from 'react'

function page({ params }) {
  const {id } = params;
  return (
    <ViewGamePage gameId={id}/>
  )
}

export default page
