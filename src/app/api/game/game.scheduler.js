import cron from 'node-cron'
import Game from './game.model' // Adjust path to your Game model
import Player from '@/app/api/player/player.model'
import { broadcastGameDetailsUpdates, broadcastGamesUpdate } from './game.service'

// Object to store our scheduled tasks
const gameStatusTasks = {}

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
        await Game.findByIdAndUpdate(game._id, {
          $set: {
            status: 'cancelled',
            cancellationReason: 'Game did not start on time'
          }
        })
        cancelTask(game._id)
        await broadcastGamesUpdate()
        broadcastGameDetailsUpdates(game._id)
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
            broadcastGameDetailsUpdates(gameId)
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

    // First check if the game should be cancelled
    await checkAndCancelOverdueGames()

    const game = await Game.findOne({ _id: gameId, isDeleted: false })
    if (!game || ['cancelled', 'completed'].includes(game.status)) {
      console.log(`📌 Game ${gameId} is ${game?.status || 'deleted'}, skipping live transition`)
      return
    }

    if (startTime < now) {
      console.log(`📌 Start time for game ${gameId} is in the past, checking if should cancel`)

      const gracePeriod = new Date(now.getTime() - 5 * 60000) // 5 minutes grace period
      if (startTime <= gracePeriod) {
        console.log(`📌 Game ${gameId} missed start time by more than 5 minutes, cancelling`)
        await Game.findByIdAndUpdate(gameId, {
          $set: {
            status: 'cancelled',
            cancellationReason: 'Game did not start on time'
          }
        })
        await broadcastGamesUpdate()
      } else {
        console.log(`📌 Game ${gameId} within grace period, moving to live`)
        await Game.findByIdAndUpdate(gameId, { $set: { status: 'live' } })
        const endTime = new Date(startTime.getTime() + game.duration * 1000)
        await scheduleCompletion(gameId, endTime)
        await broadcastGamesUpdate()
      }
      broadcastGameDetailsUpdates(gameId)
      return
    }

    cancelTask(gameId)

    const task = cron.schedule(
      convertToISOString(startTime),
      async () => {
        try {
          const currentGame = await Game.findById(gameId)
          if (!currentGame || ['cancelled', 'completed'].includes(currentGame.status)) {
            console.log(`📌 Game ${gameId} was cancelled/completed before live transition`)
            return
          }

          console.log(`📌 Moving game ${gameId} to live status`)
          const updatedGame = await Game.findByIdAndUpdate(gameId, { $set: { status: 'live' } }, { new: true })

          if (updatedGame) {
            console.log(`📌 Game ${gameId} status updated to live`)
            const endTime = new Date(startTime.getTime() + updatedGame.duration * 1000)
            if (updatedGame.forwardType !== 'admin') {
              scheduleCompletion(gameId, endTime)
            }
            await broadcastGamesUpdate()
            broadcastGameDetailsUpdates(gameId)
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

    // Don't schedule if the time is in the past
    if (endTime < now) {
      console.log(`📌 End time for game ${gameId} is in the past, not scheduling`)
      return
    }

    // Cancel any existing task for this game
    cancelTask(gameId)

    const task = cron.schedule(
      convertToISOString(endTime),
      async () => {
        try {
          console.log(`📌 Moving game ${gameId} to completed status`)

          const currentTime = new Date()
          // Update the game status
          const updatedGame = await Game.findOneAndUpdate(
            {
              _id: gameId,
              isDeleted: false
            },
            {
              $set: { status: 'completed' }
            },
            {
              new: true
            }
          )

          // Update all Player documents for this game with status 'participated' to completed
          await Player.updateMany(
            { game: gameId, status: 'participated' },
            { $set: { status: 'completed', completed: true, finishedAt: currentTime } }
          )

          if (updatedGame) {
            console.log(`📌 Game ${gameId} status updated to completed`)
            // Clean up the task
            delete gameStatusTasks[gameId]
            await broadcastGamesUpdate()
            broadcastGameDetailsUpdates(gameId)
          } else {
            console.error(`❌ Failed to update game ${gameId} status`)
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
          }
        } else if (game.status === 'lobby') {
          if (game.startTime > now) {
            await scheduleLiveTransition(game._id, game.startTime)
          } else {
            const gracePeriod = new Date(now.getTime() - 5 * 60000)
            if (game.startTime <= gracePeriod) {
              console.log(`📌 Game ${game._id} missed start time by more than 5 minutes, cancelling`)
              await Game.findByIdAndUpdate(game._id, {
                $set: {
                  status: 'cancelled',
                  cancellationReason: 'Game did not start on time'
                }
              })
              await broadcastGamesUpdate()
            } else {
              console.log(`📌 Game ${game._id} within grace period, moving to live`)
              await Game.findByIdAndUpdate(game._id, { $set: { status: 'live' } })
              const endTime = new Date(game.startTime.getTime() + game.duration * 1000 + 30 * 1000)
              await scheduleCompletion(game._id, endTime)
              await broadcastGamesUpdate()
            }
          }
        } else if (game.status === 'live' && game.forwardType !== 'admin') {
          const endTime = new Date(game.startTime.getTime() + game.duration * 1000)
          if (endTime > now) {
            await scheduleCompletion(game._id, endTime)
          } else {
            console.log(`📌 Game ${game._id} live past end time, completing`)
            await Game.findByIdAndUpdate(game._id, { $set: { status: 'completed' } })
            await broadcastGamesUpdate()
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
