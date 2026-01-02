'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import { Box } from '@mui/material'
import IndividualChatPage from '@/views/apps/messenger/IndividualChatPage'

export default function IndividualChatRoute() {
  const params = useParams()
  const chatId = params.chatId

  if (!chatId) {
    return null
  }

  // Decode chatId if it's URL-encoded
  let decodedChatId = chatId
  try {
    decodedChatId = decodeURIComponent(chatId)
  } catch (e) {
    // If decoding fails, use original
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <IndividualChatPage chatId={decodedChatId} backPath='/messanger' />
    </Box>
  )
}


