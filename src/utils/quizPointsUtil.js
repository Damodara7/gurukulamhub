export const WEIGHTAGE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const getQuestionWeightage = question => {
  const value = Number(question?.data?.weightage)
  if (!Number.isFinite(value) || value < 1) return 1
  return Math.min(10, Math.max(1, value))
}

export const sumQuestionWeightages = (questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) return 0
  return questions.reduce((sum, question) => sum + getQuestionWeightage(question), 0)
}

/** Quiz points = sum of each question's weightage. */
export const calculateQuizTotalPoints = (questions = []) => sumQuestionWeightages(questions)
