import React from 'react'
import ForwardGameQuestion from '@/components/admin-forward/ForwardGameQuestion'
export default async function page( {params}) {  
    return (
      <>
        <ForwardGameQuestion gameId={params.id} />
      </>
    )
  }