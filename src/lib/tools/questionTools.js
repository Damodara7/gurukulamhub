import { z } from 'zod'
import connectMongo from '@/utils/dbConnect-mongo'
import Question from '@/app/api/question/question.model'

async function fetchQuestions({ limit = 25, quizId, approvalState, languageCode } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const query = { status: { $ne: 'deleted' } }
  if (quizId) query.quizId = quizId
  if (approvalState) query.approvalState = approvalState
  if (languageCode) query.languageCode = languageCode

  const rows = await Question.find(query)
    .select('id quizId templateId createdBy approvalState status languageCode languageName createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()

  return { count: rows.length, items: rows }
}

async function fetchQuestionById({ id }) {
  await connectMongo()
  const value = String(id || '').trim()
  const row = (await Question.findById(value).lean()) || (await Question.findOne({ id: value }).lean())
  if (!row) return { found: false, item: null }
  return { found: true, item: row }
}

async function fetchQuestionsForQuiz({ quizId, limit = 100, approvalState, languageCode } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500)
  const query = { quizId: String(quizId || '').trim(), status: { $ne: 'deleted' } }
  if (approvalState) query.approvalState = approvalState
  if (languageCode) query.languageCode = languageCode

  const rows = await Question.find(query)
    .select('id quizId templateId createdBy approvalState status languageCode languageName createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()

  return { quizId: query.quizId, count: rows.length, items: rows }
}

export const questionTools = [
  {
    name: 'getAllQuestions',
    description: 'Get questions with optional filters.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      quizId: z.string().optional(),
      approvalState: z.string().optional(),
      languageCode: z.string().optional()
    }),
    handler: fetchQuestions
  },
  {
    name: 'getQuestionById',
    description: 'Get a question by Mongo _id or public id.',
    schema: z.object({ id: z.string().min(1) }),
    handler: fetchQuestionById
  },
  {
    name: 'getQuestionsForQuiz',
    description: 'Get all questions for a given quiz id.',
    schema: z.object({
      quizId: z.string().min(1),
      limit: z.number().int().min(1).max(500).optional(),
      approvalState: z.string().optional(),
      languageCode: z.string().optional()
    }),
    handler: fetchQuestionsForQuiz
  }
]

