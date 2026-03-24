import React from 'react'
import { auth } from '@/libs/auth'
import AIChatPage from '@/views/ai/AIChatPage'

async function page() {
  const session = await auth()
  return (
    <AIChatPage userRoles={session?.user?.roles} userEmail={session?.user?.email} />
  )
}

export default page
