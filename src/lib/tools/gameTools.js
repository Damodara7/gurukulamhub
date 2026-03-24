import { z } from 'zod'
import connectMongo from '@/utils/dbConnect-mongo'
import Game from '@/app/api/game/game.model'

async function fetchAllGames({ limit = 25, status } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const query = { isDeleted: false }
  if (status) query.status = status

  const rows = await Game.find(query)
    .select('title pin status startTime quiz createdAt creatorEmail')
    .populate('quiz', 'title id')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()

  return {
    count: rows.length,
    items: rows.map(g => ({
      id: String(g._id),
      title: g.title,
      pin: g.pin,
      status: g.status,
      startTime: g.startTime,
      creatorEmail: g.creatorEmail || '',
      quiz: g.quiz
        ? {
            id: String(g.quiz._id),
            publicId: g.quiz.id,
            title: g.quiz.title
          }
        : null
    }))
  }
}

async function fetchGameByPin({ pin }) {
  await connectMongo()
  const row = await Game.findOne({ pin: String(pin || '').trim(), isDeleted: false })
    .select('title pin status description startTime quiz createdAt creatorEmail')
    .populate('quiz', 'title id details owner')
    .lean()

  if (!row) return { found: false, item: null }
  return {
    found: true,
    item: {
      id: String(row._id),
      title: row.title,
      pin: row.pin,
      status: row.status,
      description: row.description || '',
      startTime: row.startTime,
      creatorEmail: row.creatorEmail || '',
      quiz: row.quiz
        ? {
            id: String(row.quiz._id),
            publicId: row.quiz.id,
            title: row.quiz.title,
            details: row.quiz.details || ''
          }
        : null
    }
  }
}

async function fetchGameById({ id }) {
  await connectMongo()
  const row = await Game.findById(String(id || '').trim())
    .select('title pin status description startTime quiz createdAt creatorEmail')
    .populate('quiz', 'title id details owner')
    .lean()
  if (!row) return { found: false, item: null }
  return { found: true, item: row }
}

async function fetchGamesByCreator({ email, limit = 25 }) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const rows = await Game.find({ creatorEmail: String(email || '').trim(), isDeleted: false })
    .select('title pin status startTime createdAt creatorEmail')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchRecentGames({ k = 10, status } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(k) || 10, 1), 200)
  const query = { isDeleted: false }
  if (status) query.status = status

  const rows = await Game.find(query)
    .select('title pin status startTime quiz createdAt creatorEmail')
    .populate('quiz', 'title id')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

export const gameTools = [
  {
    name: 'getAllGames',
    description: 'Get games with filters and key metadata.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      status: z.string().optional()
    }),
    handler: fetchAllGames
  },
  {
    name: 'getGameByPin',
    description: 'Get a single game by pin.',
    schema: z.object({ pin: z.string().min(1) }),
    handler: fetchGameByPin
  },
  {
    name: 'getGameById',
    description: 'Get a single game by Mongo id.',
    schema: z.object({ id: z.string().min(1) }),
    handler: fetchGameById
  },
  {
    name: 'getGamesByCreator',
    description: 'Get games created by an email.',
    schema: z.object({
      email: z.string().min(3),
      limit: z.number().int().min(1).max(200).optional()
    }),
    handler: fetchGamesByCreator
  },
  {
    name: 'getRecentGames',
    description: 'Get k most recent games.',
    schema: z.object({
      k: z.number().int().min(1).max(200).optional(),
      status: z.string().optional()
    }),
    handler: fetchRecentGames
  }
]

