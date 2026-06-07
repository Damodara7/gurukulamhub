/** Game points weightage per question (independent of quiz question weightage). */
export const GAME_POINTS_WEIGHTAGE_OPTIONS = [1, 2, 3, 4, 5]

export const normalizeGamePointsWeightage = value => {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(5, Math.max(1, Math.round(n)))
}

/** Total game points = number of questions × points weightage. */
export const calculateGameTotalPoints = (questionsCount = 0, pointsWeightage = 1) => {
  const count = Number(questionsCount) || 0
  const weightage = normalizeGamePointsWeightage(pointsWeightage)
  return count * weightage
}
