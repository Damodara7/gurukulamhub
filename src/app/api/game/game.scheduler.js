import cron from 'node-cron'
import Game from './game.model' // Adjust path to your Game model
import Player from '@/app/api/player/player.model'
import { broadcastGameDetailsUpdates, broadcastGamesUpdate } from './game.service'

// Object to store our scheduled tasks
const gameStatusTasks = {}

// ✅ IN-MEMORY LOCK: Prevent concurrent processing of the same game
const processingGameIds = new Set()

function convertToISOString(time) {
  const cronTime = `${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} ${time.getDate()} ${
    time.getMonth() + 1
  } *`
  return cronTime
}

// Helper function to safely stop and remove a task
function cancelTask(gameId) {
  if (gameStatusTasks[gameId]) {
    gameStatusTasks[gameId].stop()
    delete gameStatusTasks[gameId]
  }
}

const ADMIN_FORWARD_GRACE_MS = 5 * 60 * 1000

function isAdminForwardGame(game) {
  return game?.forwardType === 'admin' || Boolean(game?.forwardingAdmin)
}

// Only auto-forward games may be moved to live by the scheduler
const AUTO_FORWARD_LIVE_FILTER = { forwardType: 'auto' }

// Admin-forward games stay in lobby until the forwarding admin starts them manually.
// If not started within 5 minutes after scheduled startTime, they are cancelled.
async function scheduleAdminForwardDeadline(gameId, startTime) {
  try {
    const now = new Date()
    await checkAndCancelOverdueGames()

    const game = await Game.findOne({ _id: gameId, isDeleted: false })
    if (!game || ['cancelled', 'completed', 'live'].includes(game.status)) {
      console.log(`📌 Game ${gameId} is ${game?.status || 'deleted'}, skipping admin-forward deadline`)
      return
    }

    const cancelAt = new Date(startTime.getTime() + ADMIN_FORWARD_GRACE_MS)

    if (cancelAt <= now) {
      console.log(`📌 Admin-forward game ${gameId} past start grace, checking cancellation`)
      await checkAndCancelOverdueGames()
      return
    }

    cancelTask(gameId)

    const task = cron.schedule(
      convertToISOString(cancelAt),
      async () => {
        try {
          console.log(`📌 Admin-forward game ${gameId} start grace elapsed, checking cancellation`)
          await checkAndCancelOverdueGames()
        } catch (error) {
          console.error(`❌ Error on admin-forward deadline for game ${gameId}:`, error)
        }
      },
      { scheduled: true, timezone: 'Asia/Kolkata' }
    )

    gameStatusTasks[gameId] = task
    console.log(`📌 Scheduled admin-forward cancel check for game ${gameId} at ${cancelAt}`)
  } catch (error) {
    console.error(`❌ Error scheduling admin-forward deadline for game ${gameId}:`, error)
  }
}

// ✅ Helper function to complete a game with proper notifications (used by scheduler)
async function completeGame(gameId) {
  // ✅ IN-MEMORY LOCK: Prevent concurrent processing
  if (processingGameIds.has(gameId)) {
    console.log(`📌 Game ${gameId} is already being processed, skipping duplicate completion`)
    return
  }

  try {
    processingGameIds.add(gameId)
    console.log(`📌 Completing game ${gameId}...`)

    const currentTime = new Date()

    // ✅ ATOMIC CHECK: Only update if game is still 'live' (prevents duplicate notifications)
    const updatedGame = await Game.findOneAndUpdate(
      {
        _id: gameId,
        isDeleted: false,
        status: 'live' // ✅ CRITICAL: Only complete games that are still 'live'
      },
      {
        $set: { status: 'completed' }
      },
      {
        new: true
      }
    )

    // ✅ Only proceed if game was actually completed by this call
    if (!updatedGame) {
      console.log(`📌 Game ${gameId} was already completed or not in 'live' status, skipping`)
      processingGameIds.delete(gameId)
      return
    }

    // Update all Player documents for this game with status 'participated' to completed
    await Player.updateMany(
      { game: gameId, status: 'participated' },
      { $set: { status: 'completed', completed: true, finishedAt: currentTime } }
    )

    console.log(`📌 Game ${gameId} status updated to completed by scheduler`)
    await broadcastGamesUpdate()
    broadcastGameDetailsUpdates(gameId)

    // ✅ NON-BLOCKING: Send notifications when entire game completes
    ;(async () => {
      try {
        const {
          createGameCompletedNotificationsForParticipatedUsers,
          createGameMissedNotificationsForRegisteredUsers
        } = await import('../notifications/notification.helpers.js')

        // Send "Game Completed" notifications to participated users
        await createGameCompletedNotificationsForParticipatedUsers(gameId.toString(), {
          _id: updatedGame._id || gameId,
          title: updatedGame.title,
          thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
          quiz: updatedGame.quiz
        })
        console.log(`[Game Scheduler] ✅ Sent game completed notifications for game ${gameId}`)

        // Send "Game Missed" notifications to registered but not participated users
        await createGameMissedNotificationsForRegisteredUsers(gameId.toString(), {
          _id: updatedGame._id || gameId,
          title: updatedGame.title,
          thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
          quiz: updatedGame.quiz
        })
        console.log(`[Game Scheduler] ✅ Sent game missed notifications for game ${gameId}`)
      } catch (notificationError) {
        console.error(
          `[Game Scheduler] ❌ Error sending completion/missed notifications for game ${gameId}:`,
          notificationError
        )
      } finally {
        // Remove from processing set after 5 minutes (cleanup)
        setTimeout(
          () => {
            processingGameIds.delete(gameId)
          },
          5 * 60 * 1000
        )
      }
    })()
  } catch (error) {
    console.error(`❌ Error completing game ${gameId}:`, error)
    processingGameIds.delete(gameId)
  }
}

// New function to cancel overdue games
async function checkAndCancelOverdueGames() {
  try {
    const now = new Date()
    const overdueThreshold = new Date(now.getTime() - 5 * 60000) // 5 minutes grace period

    // Find games that should have started but didn't
    const overdueGames = await Game.find({
      isDeleted: false,
      status: { $in: ['created', 'approved', 'lobby'] },
      startTime: { $lte: overdueThreshold }
    })

    for (const game of overdueGames) {
      try {
        console.log(`📌 Game ${game._id} missed start time, cancelling`)
        const updatedGame = await Game.findByIdAndUpdate(
          game._id,
          {
            $set: {
              status: 'cancelled',
              cancellationReason: 'Game did not start on time'
            }
          },
          { new: true }
        )
        cancelTask(game._id)
        await broadcastGamesUpdate()
        await broadcastGameDetailsUpdates(game._id)

        // ✅ NON-BLOCKING: Send "game cancelled" notifications to all registered users
        if (updatedGame) {
          ;(async () => {
            try {
              const { createGameCancelledNotificationsForRegisteredUsers } = await import(
                '../notifications/notification.helpers.js'
              )
              await createGameCancelledNotificationsForRegisteredUsers(game._id.toString(), {
                _id: updatedGame._id || game._id,
                title: updatedGame.title,
                cancellationReason: updatedGame.cancellationReason || 'Game did not start on time',
                thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                quiz: updatedGame.quiz
              })
              console.log(`[Game Scheduler] ✅ Sent game cancelled notifications for game ${game._id}`)
            } catch (notificationError) {
              console.error(
                `[Game Scheduler] ❌ Error sending game cancelled notifications for game ${game._id}:`,
                notificationError
              )
            }
          })()
        }
      } catch (error) {
        console.error(`❌ Error cancelling game ${game._id}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error checking for overdue games:', error)
  }
}

export async function scheduleLobbyTransition(gameId) {
  try {
    const game = await Game.findOne({ _id: gameId, isDeleted: false })
    if (!game) {
      console.error(`❌ Game ${gameId} not found`)
      return
    }

    // Don't schedule if game is already cancelled or completed
    if (['cancelled', 'completed'].includes(game.status)) {
      console.log(`📌 Game ${gameId} is ${game.status}, skipping scheduling`)
      return
    }

    const lobbyTime = new Date(game.startTime.getTime() - 10 * 60000)
    const now = new Date()

    cancelTask(gameId)

    if (lobbyTime < now) {
      console.log(`📌 Lobby time for game ${gameId} is in the past`)

      if (game.status === 'approved' && game.startTime > now) {
        console.log(`📌 Game ${gameId} missed lobby transition but startTime is in future, moving to lobby now`)
        await Game.findByIdAndUpdate(gameId, { $set: { status: 'lobby' } })
        await scheduleLiveTransition(gameId, game.startTime)
        await broadcastGamesUpdate()
        await broadcastGameDetailsUpdates(gameId)
      }
      return
    }

    const task = cron.schedule(
      convertToISOString(lobbyTime),
      async () => {
        try {
          // Re-check status in case it was cancelled while waiting
          const currentGame = await Game.findById(gameId)
          if (!currentGame || ['cancelled', 'completed'].includes(currentGame.status)) {
            console.log(`📌 Game ${gameId} was cancelled/completed before lobby transition`)
            return
          }

          console.log(`📌 Moving game ${gameId} to lobby status`)
          const updatedGame = await Game.findByIdAndUpdate(gameId, { $set: { status: 'lobby' } }, { new: true })

          if (updatedGame) {
            console.log(`📌 Game ${gameId} status updated to lobby`)
            scheduleLiveTransition(gameId, game.startTime)
            await broadcastGamesUpdate()
            await broadcastGameDetailsUpdates(gameId)
          }
        } catch (error) {
          console.error(`❌ Error updating game ${gameId} status:`, error)
        }
      },
      { scheduled: true, timezone: 'Asia/Kolkata' }
    )

    gameStatusTasks[gameId] = task
    console.log(`📌 Scheduled lobby transition for game ${gameId} at ${lobbyTime}`)
  } catch (error) {
    console.error(`❌ Error scheduling lobby transition for game ${gameId}:`, error)
  }
}

async function scheduleLiveTransition(gameId, startTime) {
  try {
    const now = new Date()

    // Clear any previously scheduled start-time task (e.g. before forwardType was admin)
    cancelTask(gameId)

    // First check if the game should be cancelled
    await checkAndCancelOverdueGames()

    const game = await Game.findOne({ _id: gameId, isDeleted: false })
    if (!game || ['cancelled', 'completed'].includes(game.status)) {
      console.log(`📌 Game ${gameId} is ${game?.status || 'deleted'}, skipping live transition`)
      return
    }

    if (isAdminForwardGame(game)) {
      console.log(`📌 Game ${gameId} is admin-forward; waiting for manual start by forwarding admin`)
      await scheduleAdminForwardDeadline(gameId, startTime)
      return
    }

    if (startTime < now) {
      console.log(`📌 Start time for game ${gameId} is in the past, checking if should cancel`)

      const gracePeriod = new Date(now.getTime() - 5 * 60000) // 5 minutes grace period
      if (startTime <= gracePeriod) {
        console.log(`📌 Game ${gameId} missed start time by more than 5 minutes, cancelling`)
        const updatedGame = await Game.findByIdAndUpdate(
          gameId,
          {
            $set: {
              status: 'cancelled',
              cancellationReason: 'Game did not start on time'
            }
          },
          { new: true }
        )
        await broadcastGamesUpdate()
        await broadcastGameDetailsUpdates(gameId)

        // ✅ NON-BLOCKING: Send "game cancelled" notifications to all registered users
        if (updatedGame) {
          ;(async () => {
            try {
              const { createGameCancelledNotificationsForRegisteredUsers } = await import(
                '../notifications/notification.helpers.js'
              )
              await createGameCancelledNotificationsForRegisteredUsers(gameId.toString(), {
                _id: updatedGame._id || gameId,
                title: updatedGame.title,
                cancellationReason: updatedGame.cancellationReason || 'Game did not start on time',
                thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                quiz: updatedGame.quiz
              })
              console.log(`[Game Scheduler] ✅ Sent game cancelled notifications for game ${gameId}`)
            } catch (notificationError) {
              console.error(
                `[Game Scheduler] ❌ Error sending game cancelled notifications for game ${gameId}:`,
                notificationError
              )
            }
          })()
        }
      } else {
        console.log(`📌 Game ${gameId} within grace period, moving to live`)

        // ✅ ATOMIC CHECK: Only update if game is still 'lobby' or 'approved' (prevents duplicate notifications)
        const updatedGame = await Game.findOneAndUpdate(
          {
            _id: gameId,
            isDeleted: false,
            status: { $in: ['approved', 'lobby'] },
            ...AUTO_FORWARD_LIVE_FILTER
          },
          { $set: { status: 'live' } },
          { new: true }
        )

        if (updatedGame) {
          const endTime = new Date(startTime.getTime() + game.duration * 1000)
          await scheduleCompletion(gameId, endTime)
          await broadcastGamesUpdate()

          // ✅ NON-BLOCKING: Send "game started" notifications to all registered users
          // Only sent if this actually moved the game to 'live' (not already 'live')
          ;(async () => {
            try {
              const { createGameStartedNotificationsForRegisteredUsers } = await import(
                '../notifications/notification.helpers.js'
              )
              await createGameStartedNotificationsForRegisteredUsers(gameId.toString(), {
                _id: updatedGame._id || gameId,
                title: updatedGame.title,
                thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                quiz: updatedGame.quiz
              })
              console.log(`[Game Scheduler] ✅ Sent game started notifications for game ${gameId} (grace period)`)
            } catch (notificationError) {
              console.error(
                `[Game Scheduler] ❌ Error sending game started notifications for game ${gameId}:`,
                notificationError
              )
            }
          })()
        } else {
          // Game was already moved to 'live' by another process
          console.log(
            `📌 Game ${gameId} was already moved to 'live' status (grace period), skipping duplicate notification`
          )
        }
      }
      await broadcastGameDetailsUpdates(gameId)
      return
    }

    cancelTask(gameId)

    const task = cron.schedule(
      convertToISOString(startTime),
      async () => {
        try {
          // ✅ CHECK: If game is already 'live', skip (prevent duplicate notifications)
          const currentGame = await Game.findById(gameId).select('status').lean()
          if (!currentGame || ['cancelled', 'completed', 'live'].includes(currentGame.status)) {
            if (currentGame?.status === 'live') {
              console.log(`📌 Game ${gameId} is already 'live' status, skipping duplicate notification`)
            } else {
              console.log(`📌 Game ${gameId} was ${currentGame?.status || 'deleted'}, skipping live transition`)
            }
            return
          }

          if (isAdminForwardGame(currentGame)) {
            console.log(
              `📌 Game ${gameId} is admin-forward — skipping auto live at start time (admin must start manually)`
            )
            await scheduleAdminForwardDeadline(gameId, new Date(currentGame.startTime))
            return
          }

          console.log(`📌 Moving game ${gameId} to live status`)

          const updatedGame = await Game.findOneAndUpdate(
            {
              _id: gameId,
              isDeleted: false,
              status: { $in: ['approved', 'lobby'] },
              ...AUTO_FORWARD_LIVE_FILTER
            },
            { $set: { status: 'live' } },
            { new: true }
          )

          if (updatedGame) {
            console.log(`📌 Game ${gameId} status updated to live by scheduler`)
            const endTime = new Date(startTime.getTime() + updatedGame.duration * 1000)
            if (updatedGame.forwardType !== 'admin') {
              scheduleCompletion(gameId, endTime)
            }
            await broadcastGamesUpdate()
            broadcastGameDetailsUpdates(gameId)

            // ✅ NON-BLOCKING: Send "game started" notifications to all registered users
            // Fire and forget - don't await, let it run in background
            // Only sent if this scheduler actually moved the game to 'live' (not already 'live')
            ;(async () => {
              try {
                const { createGameStartedNotificationsForRegisteredUsers } = await import(
                  '../notifications/notification.helpers.js'
                )
                await createGameStartedNotificationsForRegisteredUsers(gameId.toString(), {
                  _id: updatedGame._id || gameId,
                  title: updatedGame.title,
                  thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                  quiz: updatedGame.quiz
                })
                console.log(`[Game Scheduler] ✅ Sent game started notifications for game ${gameId}`)
              } catch (notificationError) {
                console.error(
                  `[Game Scheduler] ❌ Error sending game started notifications for game ${gameId}:`,
                  notificationError
                )
              }
            })()
          } else {
            // Game was already moved to 'live' by another process (reschedulePendingGames, etc.)
            console.log(`📌 Game ${gameId} was already moved to 'live' status, skipping duplicate notification`)
          }
        } catch (error) {
          console.error(`❌ Error updating game ${gameId} status:`, error)
        }
      },
      { scheduled: true, timezone: 'Asia/Kolkata' }
    )

    gameStatusTasks[gameId] = task
    console.log(`📌 Scheduled live transition for game ${gameId} at ${startTime}`)
  } catch (error) {
    console.error(`❌ Error scheduling live transition for game ${gameId}:`, error)
  }
}

async function scheduleCompletion(gameId, endTime) {
  try {
    const now = new Date()

    // ✅ CHECK: If game is already completed or cancelled, don't schedule
    const game = await Game.findById(gameId).select('status').lean()
    if (!game || ['completed', 'cancelled'].includes(game.status)) {
      console.log(`📌 Game ${gameId} is already ${game?.status || 'deleted'}, skipping completion scheduling`)
      return
    }

    // ✅ CHECK: If task is already scheduled, don't schedule again (prevents duplicates)
    if (gameStatusTasks[gameId]) {
      console.log(`📌 Game ${gameId} already has a completion task scheduled, skipping duplicate`)
      return
    }

    // Don't schedule if the time is in the past (but still complete it immediately)
    if (endTime < now) {
      console.log(`📌 End time for game ${gameId} is in the past, completing immediately`)
      // Complete the game immediately using the helper function
      await completeGame(gameId)
      return
    }

    // Cancel any existing task for this game (shouldn't happen due to check above, but safe guard)
    cancelTask(gameId)

    const task = cron.schedule(
      convertToISOString(endTime),
      async () => {
        try {
          console.log(`📌 Moving game ${gameId} to completed status`)

          const currentTime = new Date()

          // ✅ IN-MEMORY LOCK: Prevent concurrent processing
          if (processingGameIds.has(gameId)) {
            console.log(`📌 Game ${gameId} is already being processed by another task, skipping duplicate`)
            delete gameStatusTasks[gameId]
            return
          }

          processingGameIds.add(gameId)

          try {
            // ✅ ATOMIC CHECK: Only update if game is still 'live' (prevents duplicate notifications)
            // This prevents race conditions where admin-forwarding or manual completion already completed the game
            const updatedGame = await Game.findOneAndUpdate(
              {
                _id: gameId,
                isDeleted: false,
                status: 'live' // ✅ CRITICAL: Only complete games that are still 'live'
              },
              {
                $set: { status: 'completed' }
              },
              {
                new: true
              }
            )

            // ✅ Only proceed if game was actually completed by this scheduler
            if (updatedGame) {
              // Update all Player documents for this game with status 'participated' to completed
              await Player.updateMany(
                { game: gameId, status: 'participated' },
                { $set: { status: 'completed', completed: true, finishedAt: currentTime } }
              )

              console.log(`📌 Game ${gameId} status updated to completed by scheduler`)
              // Clean up the task
              delete gameStatusTasks[gameId]
              await broadcastGamesUpdate()
              broadcastGameDetailsUpdates(gameId)

              // ✅ NON-BLOCKING: Send notifications when entire game completes
              // Only sent if this scheduler actually completed the game (not already completed)
              ;(async () => {
                try {
                  const {
                    createGameCompletedNotificationsForParticipatedUsers,
                    createGameMissedNotificationsForRegisteredUsers
                  } = await import('../notifications/notification.helpers.js')

                  // Send "Game Completed" notifications to participated users
                  await createGameCompletedNotificationsForParticipatedUsers(gameId.toString(), {
                    _id: updatedGame._id || gameId,
                    title: updatedGame.title,
                    thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                    quiz: updatedGame.quiz
                  })
                  console.log(`[Game Scheduler] ✅ Sent game completed notifications for game ${gameId}`)

                  // Send "Game Missed" notifications to registered but not participated users
                  await createGameMissedNotificationsForRegisteredUsers(gameId.toString(), {
                    _id: updatedGame._id || gameId,
                    title: updatedGame.title,
                    thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                    quiz: updatedGame.quiz
                  })
                  console.log(`[Game Scheduler] ✅ Sent game missed notifications for game ${gameId}`)
                } catch (notificationError) {
                  console.error(
                    `[Game Scheduler] ❌ Error sending completion/missed notifications for game ${gameId}:`,
                    notificationError
                  )
                } finally {
                  // Remove from processing set after 2 minutes (cleanup) - shorter timeout since notifications should be sent quickly
                  setTimeout(
                    () => {
                      processingGameIds.delete(gameId)
                      console.log(`[Game Scheduler] 🔓 Released lock for game ${gameId}`)
                    },
                    2 * 60 * 1000
                  )
                }
              })()
            } else {
              // Game was already completed by another process (admin-forwarding, manual completion, etc.)
              // OR game status is not 'live' (maybe already cancelled or completed)
              console.log(
                `📌 Game ${gameId} was already completed or not in 'live' status, skipping scheduler completion`
              )
              // Clean up the task anyway since game is already completed
              delete gameStatusTasks[gameId]
              processingGameIds.delete(gameId)
            }
          } catch (error) {
            console.error(`❌ Error updating game ${gameId} status:`, error)
            processingGameIds.delete(gameId)
            delete gameStatusTasks[gameId]
          }
        } catch (error) {
          console.error(`❌ Error updating game ${gameId} status:`, error)
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Adjust timezone as needed
      }
    )

    gameStatusTasks[gameId] = task

    console.log(`📌 Scheduled completion for game ${gameId} at ${endTime}`)
  } catch (error) {
    console.error(`❌ Error scheduling completion for game ${gameId}:`, error)
  }
}

export function cancelScheduledTasks(gameId) {
  cancelTask(gameId)
}

// Call this when admin approves a game
export async function onGameApproved(gameId) {
  console.log('📌 Inside onGameApproved Scheduler')
  await scheduleLobbyTransition(gameId)
}

// Call this when server starts to reschedule any pending tasks
export async function reschedulePendingGames() {
  try {
    const now = new Date()

    // First check for any overdue games that need cancellation
    await checkAndCancelOverdueGames()

    const pendingGames = await Game.find({
      isDeleted: false,
      $or: [{ status: 'approved', startTime: { $gt: now } }, { status: 'lobby' }, { status: 'live' }],
      status: { $nin: ['awaiting_sponsorship', 'sponsored'] } // Exclude awaiting_sponsorship and sponsored games
    })

    console.log(`📌 Rescheduling ${pendingGames.length} games`)

    for (const game of pendingGames) {
      try {
        if (game.status === 'approved') {
          const lobbyTime = new Date(game.startTime.getTime() - 10 * 60000)
          if (lobbyTime > now) {
            await scheduleLobbyTransition(game._id)
          } else if (game.startTime > now) {
            console.log(`📌 Game ${game._id} missed lobby window, moving to lobby now`)
            await Game.findByIdAndUpdate(game._id, { $set: { status: 'lobby' } })
            await scheduleLiveTransition(game._id, game.startTime)
            await broadcastGamesUpdate()
            await broadcastGameDetailsUpdates(game._id)
          }
        } else if (game.status === 'lobby') {
          if (isAdminForwardGame(game)) {
            await scheduleAdminForwardDeadline(game._id, game.startTime)
          } else if (game.startTime > now) {
            await scheduleLiveTransition(game._id, game.startTime)
          } else {
            const gracePeriod = new Date(now.getTime() - ADMIN_FORWARD_GRACE_MS)
            if (game.startTime <= gracePeriod) {
              console.log(`📌 Game ${game._id} missed start time by more than 5 minutes, cancelling`)
              const updatedGame = await Game.findByIdAndUpdate(
                game._id,
                {
                  $set: {
                    status: 'cancelled',
                    cancellationReason: 'Game did not start on time'
                  }
                },
                { new: true }
              )
              await broadcastGamesUpdate()
              await broadcastGameDetailsUpdates(game._id)

              // ✅ NON-BLOCKING: Send "game cancelled" notifications to all registered users
              if (updatedGame) {
                ;(async () => {
                  try {
                    const { createGameCancelledNotificationsForRegisteredUsers } = await import(
                      '../notifications/notification.helpers.js'
                    )
                    await createGameCancelledNotificationsForRegisteredUsers(game._id.toString(), {
                      _id: updatedGame._id || game._id,
                      title: updatedGame.title,
                      cancellationReason: updatedGame.cancellationReason || 'Game did not start on time',
                      thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                      quiz: updatedGame.quiz
                    })
                    console.log(`[Game Scheduler] ✅ Sent game cancelled notifications for game ${game._id}`)
                  } catch (notificationError) {
                    console.error(
                      `[Game Scheduler] ❌ Error sending game cancelled notifications for game ${game._id}:`,
                      notificationError
                    )
                  }
                })()
              }
            } else {
              console.log(`📌 Game ${game._id} within grace period, moving to live`)

              // ✅ ATOMIC CHECK: Only update if game is still 'lobby' or 'approved' (prevents duplicate notifications)
              const updatedGame = await Game.findOneAndUpdate(
                {
                  _id: game._id,
                  isDeleted: false,
                  status: { $in: ['approved', 'lobby'] },
                  ...AUTO_FORWARD_LIVE_FILTER
                },
                { $set: { status: 'live' } },
                { new: true }
              )

              if (updatedGame) {
                const endTime = new Date(game.startTime.getTime() + game.duration * 1000 + 30 * 1000)
                await scheduleCompletion(game._id, endTime)
                await broadcastGamesUpdate()

                // ✅ NON-BLOCKING: Send "game started" notifications to all registered users
                // Only sent if this actually moved the game to 'live' (not already 'live')
                ;(async () => {
                  try {
                    const { createGameStartedNotificationsForRegisteredUsers } = await import(
                      '../notifications/notification.helpers.js'
                    )
                    await createGameStartedNotificationsForRegisteredUsers(game._id.toString(), {
                      _id: updatedGame._id || game._id,
                      title: updatedGame.title,
                      thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
                      quiz: updatedGame.quiz
                    })
                    console.log(`[Game Scheduler] ✅ Sent game started notifications for game ${game._id} (reschedule)`)
                  } catch (notificationError) {
                    console.error(
                      `[Game Scheduler] ❌ Error sending game started notifications for game ${game._id}:`,
                      notificationError
                    )
                  }
                })()
              } else {
                // Game was already moved to 'live' by another process
                console.log(
                  `📌 Game ${game._id} was already moved to 'live' status (reschedule), skipping duplicate notification`
                )
              }
            }
          }
        } else if (game.status === 'live' && game.forwardType !== 'admin') {
          // ✅ Check if game is already completed before rescheduling
          const currentGame = await Game.findById(game._id).select('status').lean()
          if (currentGame?.status === 'completed') {
            console.log(`📌 Game ${game._id} is already completed, skipping reschedule`)
            continue
          }

          const endTime = new Date(game.startTime.getTime() + game.duration * 1000)
          if (endTime > now) {
            // Schedule completion for future
            await scheduleCompletion(game._id, endTime)
          } else {
            // Game is past end time, complete it immediately with proper notifications
            console.log(`📌 Game ${game._id} live past end time, completing immediately`)
            await completeGame(game._id)
          }
        }
      } catch (error) {
        console.error(`❌ Error rescheduling game ${game._id}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error rescheduling pending games:', error)
  }
}

// Call this when server starts
export async function initializeScheduler() {
  // Initial run
  await reschedulePendingGames()

  // Schedule periodic checks without duplicate initial run
  cron.schedule(
    '*/10 * * * *', // Every 2 minutes
    async () => {
      console.log('⏰ Running periodic schedule check')
      await reschedulePendingGames()
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
      runOnInit: false // ← This prevents the duplicate initial run
    }
  )
}
