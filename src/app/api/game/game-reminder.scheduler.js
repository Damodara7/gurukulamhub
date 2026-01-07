import cron from 'node-cron'
import connectMongo from '@/utils/dbConnect-mongo'
import Game from './game.model'
import Player from '@/app/api/player/player.model'
import { createGameReminderNotification } from '../notifications/notification.helpers.js'

/**
 * Check for games starting in 24 hours and send reminder notifications to registered users
 */
async function checkAndSendGameReminders() {
  await connectMongo()

  try {
    console.log('[Game Reminder Scheduler] ===== Checking for games starting in 24 hours =====')

    const now = new Date()

    // Check for games starting in the next 48 hours
    // Then filter to only send reminders for games that are approximately 24 hours away
    const futureWindowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000) // 20 hours from now
    const futureWindowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000) // 28 hours from now

    const potentialGames = await Game.find({
      isDeleted: false,
      status: { $in: ['approved', 'lobby'] }, // Only remind for upcoming games
      startTime: {
        $gte: futureWindowStart,
        $lte: futureWindowEnd
      }
    }).lean()

    // Filter games to only those that are approximately 24 hours away (23-25 hour window)
    const gamesToRemind = potentialGames.filter(game => {
      const gameStartTime = new Date(game.startTime)
      const hoursUntilGame = (gameStartTime - now) / (1000 * 60 * 60)
      // Only include games that are 23-25 hours away
      return hoursUntilGame >= 23 && hoursUntilGame <= 25
    })

    console.log(`[Game Reminder Scheduler] Found ${gamesToRemind.length} game(s) starting in ~24 hours`)

    let totalNotificationsSent = 0
    let totalNotificationsFailed = 0
    let gamesProcessed = 0

    for (const game of gamesToRemind) {
      try {
        gamesProcessed++
        console.log(
          `[Game Reminder Scheduler] Processing game: "${game.title}" (ID: ${game._id}), starts at: ${game.startTime}`
        )

        // Get all registered users for this game (status: 'registered')
        const registeredPlayers = await Player.find({
          game: game._id,
          status: 'registered' // Only send to users who registered but haven't participated yet
        })
          .populate('user', '_id email')
          .lean()

        console.log(
          `[Game Reminder Scheduler] Found ${registeredPlayers.length} registered user(s) for game "${game.title}"`
        )

        if (registeredPlayers.length === 0) {
          console.log(`[Game Reminder Scheduler] No registered users for game "${game.title}", skipping`)
          continue
        }

        // Check if reminder was already sent today for this game
        // We use a 12-hour window to prevent duplicate reminders
        const todayStart = new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago
        const todayEnd = new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours from now

        // Send reminder to each registered user
        for (const player of registeredPlayers) {
          try {
            const userId = player.user?._id || player.user

            if (!userId) {
              console.warn(`[Game Reminder Scheduler] ⚠️ Player ${player._id} has no user ID, skipping`)
              continue
            }

            // Check if reminder was already sent to this user for this game today
            const Notification = (await import('../notifications/notification.model.js')).default
            const existingReminder = await Notification.findOne({
              userId: userId,
              type: 'GAME_REMINDER',
              'metadata.gameId': game._id.toString(),
              createdAt: {
                $gte: todayStart,
                $lte: todayEnd
              }
            }).lean()

            if (existingReminder) {
              console.log(
                `[Game Reminder Scheduler] Reminder already sent to user ${userId} for game "${game.title}" today, skipping`
              )
              continue
            }

            // Send reminder notification
            const notificationResult = await createGameReminderNotification(userId, {
              _id: game._id,
              title: game.title,
              startTime: game.startTime,
              thumbnailPoster: game.thumbnailPoster
            })

            if (notificationResult.status === 'success') {
              totalNotificationsSent++
              console.log(`[Game Reminder Scheduler] ✅ Sent reminder to user ${userId} for game "${game.title}"`)
            } else {
              totalNotificationsFailed++
              console.error(
                `[Game Reminder Scheduler] ❌ Failed to send reminder to user ${userId} for game "${game.title}": ${notificationResult.message}`
              )
            }
          } catch (userError) {
            totalNotificationsFailed++
            console.error(
              `[Game Reminder Scheduler] ❌ Error sending reminder to user for game "${game.title}":`,
              userError
            )
          }
        }
      } catch (gameError) {
        console.error(`[Game Reminder Scheduler] ❌ Error processing game ${game._id}:`, gameError)
      }
    }

    console.log('[Game Reminder Scheduler] ===== Summary =====')
    console.log(`[Game Reminder Scheduler] Games processed: ${gamesProcessed}`)
    console.log(`[Game Reminder Scheduler] Notifications sent: ${totalNotificationsSent}`)
    console.log(`[Game Reminder Scheduler] Notifications failed: ${totalNotificationsFailed}`)
    console.log('[Game Reminder Scheduler] ===== Check Complete =====')
  } catch (error) {
    console.error('[Game Reminder Scheduler] ❌❌❌ ERROR in checkAndSendGameReminders ❌❌❌')
    console.error('[Game Reminder Scheduler] Error message:', error.message)
    console.error('[Game Reminder Scheduler] Error stack:', error.stack)
  }
}

/**
 * Initialize the game reminder scheduler
 * Runs every 2 hours to check for games starting in 24 hours
 * This ensures we catch games starting at ANY time of day
 *
 * Example:
 * - Game on Aug 31 at 2:00 PM
 * - Scheduler runs at Aug 30 at 2:00 PM
 * - Finds game starting in 24 hours
 * - Sends reminder notification
 */
export async function initializeGameReminderScheduler() {
  console.log('[Game Reminder Scheduler] Initializing game reminder scheduler...')

  // Schedule to run every 2 hours
  // This ensures we catch games starting at any time of day
  // The 2-hour window (23-25 hours) means we'll catch all games
  cron.schedule(
    '0 */2 * * *', // Every 2 hours
    async () => {
      await checkAndSendGameReminders()
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
      runOnInit: false // Don't run immediately, wait for first scheduled time
    }
  )

  console.log('[Game Reminder Scheduler] Initialized - Every 2 hours (Asia/Kolkata)')
  console.log('[Game Reminder Scheduler] Will check for games starting between 23-25 hours from now')
  console.log('[Game Reminder Scheduler] This ensures reminders are sent exactly 24 hours before game start')
}

// Export the check function for manual testing if needed
export { checkAndSendGameReminders }
