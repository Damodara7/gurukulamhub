/** Sum per-question timerSeconds from quiz questions (live game duration source). */
export function sumQuestionTimerSeconds(questions = []) {
  return questions.reduce((sum, q) => sum + (Number(q?.data?.timerSeconds) || 0), 0)
}

/** Format duration stored in seconds for display. */
export function formatGameDurationSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0))
  if (seconds === 0) return '0 min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? '' : 's'}`)
  if (minutes > 0) parts.push(`${minutes} min`)
  if (secs > 0 && hours === 0) parts.push(`${secs} sec`)

  return parts.join(' ') || '0 min'
}

/** Label for game cards / details; admin-forward live games may not have a fixed duration. */
export function getGameDurationLabel(game) {
  if (game?.forwardType === 'admin' && game?.status !== 'completed') {
    return 'Admin controlled'
  }
  if (!game?.duration) return null
  return formatGameDurationSeconds(game.duration)
}
