import { z } from 'zod'
import connectMongo from '@/utils/dbConnect-mongo'
import Quiz from '@/app/api/quiz/quiz.model'

async function fetchAllQuizzes({ limit = 25, approvalState, owner } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const query = { status: { $ne: 'deleted' } }
  if (approvalState) query.approvalState = approvalState
  if (owner) query.owner = owner

  const rows = await Quiz.find(query)
    .select('id title details owner status approvalState language createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()

  return {
    count: rows.length,
    items: rows.map(q => ({
      id: String(q._id),
      publicId: q.id,
      title: q.title,
      details: q.details || '',
      owner: q.owner || '',
      status: q.status,
      approvalState: q.approvalState,
      language: q.language || null
    }))
  }
}

async function fetchQuizById({ id }) {
  await connectMongo()
  const value = String(id || '').trim()
  const row = (await Quiz.findById(value).lean()) || (await Quiz.findOne({ id: value }).lean())
  if (!row) return { found: false, item: null }
  return {
    found: true,
    item: {
      id: String(row._id),
      publicId: row.id,
      title: row.title,
      details: row.details || '',
      owner: row.owner || '',
      status: row.status,
      approvalState: row.approvalState,
      language: row.language || null,
      tags: row.tags || []
    }
  }
}

async function fetchQuizzesByOwner({ owner, limit = 25 }) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const rows = await Quiz.find({ owner: String(owner || '').trim(), status: { $ne: 'deleted' } })
    .select('id title details owner status approvalState language createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchRecentQuizzes({ k = 10, approvalState } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(k) || 10, 1), 200)
  const query = { status: { $ne: 'deleted' } }
  if (approvalState) query.approvalState = approvalState

  const rows = await Quiz.find(query)
    .select('id title details owner status approvalState language createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()

  return { count: rows.length, items: rows }
}

export const quizTools = [
  {
    name: 'getAllQuizzes',
    description: 'Get quizzes with optional filters.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      approvalState: z.string().optional(),
      owner: z.string().optional()
    }),
    handler: fetchAllQuizzes
  },
  {
    name: 'getQuizById',
    description: 'Get a single quiz by Mongo _id or public id.',
    schema: z.object({ id: z.string().min(1) }),
    handler: fetchQuizById
  },
  {
    name: 'getQuizzesByOwner',
    description: 'Get quizzes by owner email/id.',
    schema: z.object({
      owner: z.string().min(1),
      limit: z.number().int().min(1).max(200).optional()
    }),
    handler: fetchQuizzesByOwner
  },
  {
    name: 'getRecentQuizzes',
    description: 'Get k most recent quizzes.',
    schema: z.object({
      k: z.number().int().min(1).max(200).optional(),
      approvalState: z.string().optional()
    }),
    handler: fetchRecentQuizzes
  }
]

