export const WEIGHTAGE_OPTIONS = [1, 2, 3, 4, 5]

export const normalizeQuizWeightage = value => {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(10, Math.max(1, Math.round(n)))
}

export const getQuizDefaultWeightage = quiz => normalizeQuizWeightage(quiz?.defaultWeightage ?? 1)

export const getQuestionWeightage = (question, quizDefaultWeightage = 1) => {
  const raw = question?.data?.weightage
  if (raw !== undefined && raw !== null && raw !== '') {
    return normalizeQuizWeightage(raw)
  }
  return normalizeQuizWeightage(quizDefaultWeightage)
}

export const sumQuestionWeightages = (questions = [], quizDefaultWeightage = 1) => {
  if (!Array.isArray(questions) || questions.length === 0) return 0
  const fallback = normalizeQuizWeightage(quizDefaultWeightage)
  return questions.reduce((sum, question) => sum + getQuestionWeightage(question, fallback), 0)
}

/** Quiz points = sum of each question's weightage. */
export const calculateQuizTotalPoints = (questions = [], quizDefaultWeightage = 1) =>
  sumQuestionWeightages(questions, quizDefaultWeightage)

export const resolveInitialQuestionWeightage = (questionData, quizDefaultWeightage = 1) => {
  const raw = questionData?.weightage
  if (raw !== undefined && raw !== null && raw !== '') {
    return normalizeQuizWeightage(raw)
  }
  return normalizeQuizWeightage(quizDefaultWeightage)
}