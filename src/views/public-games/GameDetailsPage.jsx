'use client'

import React from 'react'
import ViewDetails from '@/views/public-games/ViewDetails';

const games = {
  1: {
    id: '1',
    name: 'Battle Royale',
    liveDate: '2025-06-15 18:00',
    details: 'A last-man-standing survival game.'
  },
  2: {
    id: '2',
    name: 'Trivia Challenge',
    liveDate: '2025-06-18 14:00',
    details: 'Answer quickly and accurately!'
  }
}

export default function GameDetailsPage({ params }) {
  const game = games[params.id]

  return <ViewDetails game={game} />
}
