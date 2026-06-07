export const MIN_ADMIN_START_GRACE_MINUTES = 10
export const MAX_ADMIN_START_GRACE_MINUTES = 120
export const DEFAULT_ADMIN_START_GRACE_MINUTES = 10
export const ADMIN_START_GRACE_STEP_MINUTES = 10

/** Grace period options in 10-minute steps from 10 min to 2 hours. */
export const ADMIN_START_GRACE_OPTIONS = Array.from(
  { length: (MAX_ADMIN_START_GRACE_MINUTES - MIN_ADMIN_START_GRACE_MINUTES) / ADMIN_START_GRACE_STEP_MINUTES + 1 },
  (_, index) => MIN_ADMIN_START_GRACE_MINUTES + index * ADMIN_START_GRACE_STEP_MINUTES
)

export function getAdminStartGraceMinutes(game) {
  const minutes = Number(game?.adminStartGraceMinutes)
  if (
    Number.isFinite(minutes) &&
    minutes >= MIN_ADMIN_START_GRACE_MINUTES &&
    minutes <= MAX_ADMIN_START_GRACE_MINUTES
  ) {
    return minutes
  }
  return DEFAULT_ADMIN_START_GRACE_MINUTES
}

export function getAdminStartGraceMs(game) {
  return getAdminStartGraceMinutes(game) * 60 * 1000
}

export function isAdminForwardGame(game) {
  return game?.forwardType === 'admin' || Boolean(game?.forwardingAdmin)
}

export function normalizeAdminStartGraceMinutes(gameData) {
  if (gameData?.gameMode === 'live' && gameData?.forwardType === 'admin') {
    gameData.adminStartGraceMinutes = getAdminStartGraceMinutes(gameData)
  } else if (gameData && 'adminStartGraceMinutes' in gameData) {
    delete gameData.adminStartGraceMinutes
  }
}

export function formatAdminStartGraceMinutes(minutes) {
  const value = Number(minutes)
  if (!Number.isFinite(value) || value <= 0) return ''

  const hours = Math.floor(value / 60)
  const mins = value % 60

  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`
  if (hours > 0) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${mins} min`
}
