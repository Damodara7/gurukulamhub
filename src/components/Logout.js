'use client'

import { useState } from 'react'
import { signOut } from '../libs/auth'
import LoadingDialog from './LoadingDialog'

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  return (
    <>
      <button
        onClick={async () => {
          setIsLoggingOut(true)
          console.log('Clicked!')
          await signOut()
          setIsLoggingOut(false)
        }}
        className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
      >
        Logout
      </button>
      {isLoggingOut && <LoadingDialog open={isLoggingOut}/>}
    </>
  )
}
