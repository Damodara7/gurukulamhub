import webpush from 'web-push'
import connectMongo from '@/utils/dbConnect-mongo'
import User from '@/app/models/user.model'

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL

// Set VAPID details for webpush
if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
  console.log('[Push Service] ✅ VAPID keys configured:', {
    email: vapidEmail,
    publicKey: vapidPublicKey?.substring(0, 20) + '...',
    hasPrivateKey: !!vapidPrivateKey
  })
} else {
  console.warn('[Push Service] ⚠️ VAPID keys not configured. Push notifications will not work.')
  console.warn('[Push Service] Missing:', {
    publicKey: !vapidPublicKey,
    privateKey: !vapidPrivateKey,
    email: !vapidEmail
  })
}

/**
 * Send push notification to a user
 *
 * @param {string|ObjectId} userId - User ID to send notification to
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.body - Notification body/message
 * @param {string} [notificationData.icon] - Icon URL (default: /icons/icon-192x192.png)
 * @param {string} [notificationData.badge] - Badge URL (default: /icons/icon-192x192.png)
 * @param {string} [notificationData.url] - URL to open when notification is clicked
 * @param {string} [notificationData.tag] - Notification tag for grouping
 * @param {string} [notificationData.sound] - Sound file URL (default: /sounds/notification.mp3)
 * @param {Object} [notificationData.data] - Additional data to pass with notification
 * @returns {Promise<Object>} Result object with status and message
 */
export async function sendPushNotification(userId, notificationData) {
  await connectMongo()

  try {
    // Validate VAPID keys
    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      return {
        status: 'error',
        message: 'VAPID keys are not configured',
        sentCount: 0,
        failedCount: 0
      }
    }

    // Validate required fields
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID is required',
        sentCount: 0,
        failedCount: 0
      }
    }

    if (!notificationData || !notificationData.title || !notificationData.body) {
      return {
        status: 'error',
        message: 'Notification title and body are required',
        sentCount: 0,
        failedCount: 0
      }
    }

    // Get user with push subscriptions
    const user = await User.findById(userId).select('pushSubscriptions email')

    if (!user) {
      return {
        status: 'error',
        message: 'User not found',
        sentCount: 0,
        failedCount: 0
      }
    }

    // Check if user has push subscriptions
    if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return {
        status: 'success',
        message: 'User has no push subscriptions',
        sentCount: 0,
        failedCount: 0
      }
    }

    // Filter out large data from metadata to keep payload under 4096 bytes
    // Push notifications have a 4096 byte limit, so we exclude large base64 images
    const filteredData = {}
    if (notificationData.data) {
      Object.keys(notificationData.data).forEach(key => {
        const value = notificationData.data[key]
        // Skip large base64 images and other large data
        if (typeof value === 'string' && value.length > 1000) {
          // Skip large strings (likely base64 images)
          return
        }
        // Skip thumbnailPoster and other large image fields
        if (key === 'thumbnailPoster' || key === 'thumbnailUrl' || key === 'avatarImage') {
          return
        }
        filteredData[key] = value
      })
    }

    // Prepare push payload (must be under 4096 bytes)
    // Include sound for push notifications (default sound for all notifications)
    const payload = JSON.stringify({
      title: notificationData.title,
      body: notificationData.body,
      icon: notificationData.icon || '/icons/icon-192x192.png',
      badge: notificationData.badge || '/icons/icon-192x192.png',
      tag: notificationData.tag || 'default',
      url: notificationData.url || notificationData.actionUrl || '/',
      sound: notificationData.sound || '/sounds/notification.mp3', // Default sound for all push notifications
      data: {
        url: notificationData.url || notificationData.actionUrl || '/',
        ...filteredData
      }
    })

    // Check payload size and warn if too large
    const payloadSize = Buffer.byteLength(payload, 'utf8')
    if (payloadSize > 3500) {
      console.warn(`[Push Service] ⚠️ Payload size is ${payloadSize} bytes (limit: 4096). Consider reducing data size.`)
    }

    // Track results
    let sentCount = 0
    let failedCount = 0
    const invalidSubscriptions = []

    // Send push to all user's subscriptions
    const sendPromises = user.pushSubscriptions.map(async (subscription, index) => {
      try {
        // Convert subscription to format expected by webpush
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        }

        // Send push notification
        await webpush.sendNotification(pushSubscription, payload)

        sentCount++
        console.log(`[Push Service] ✅ Push sent successfully to subscription ${index + 1}`)
      } catch (error) {
        failedCount++
        console.error(`[Push Service] ❌ Failed to send push to subscription ${index + 1}:`, error.message)
        console.error(`[Push Service] Error details:`, {
          statusCode: error.statusCode,
          statusMessage: error.statusMessage,
          body: error.body,
          endpoint: subscription.endpoint?.substring(0, 50) + '...',
          errorName: error.name
        })

        // Log full error for debugging
        if (error.statusCode) {
          console.error(
            `[Push Service] Full error object:`,
            JSON.stringify(
              {
                statusCode: error.statusCode,
                statusMessage: error.statusMessage,
                body: typeof error.body === 'string' ? error.body.substring(0, 200) : error.body
              },
              null,
              2
            )
          )
        }

        // Check if subscription is invalid (expired/gone)
        // Status codes: 410 = Gone, 404 = Not Found, 403 = Forbidden, 401 = Unauthorized (VAPID mismatch)
        if (
          error.statusCode === 410 ||
          error.statusCode === 404 ||
          error.statusCode === 403 ||
          error.statusCode === 401
        ) {
          console.log(`[Push Service] 🗑️ Marking subscription ${index + 1} as invalid (status: ${error.statusCode})`)
          if (error.statusCode === 401) {
            console.error(`[Push Service] ⚠️ VAPID key mismatch detected! User needs to re-subscribe.`)
          }
          invalidSubscriptions.push(subscription.endpoint)
        }
      }
    })

    // Wait for all push sends to complete
    await Promise.allSettled(sendPromises)

    // Remove invalid subscriptions from database
    if (invalidSubscriptions.length > 0) {
      try {
        user.pushSubscriptions = user.pushSubscriptions.filter(sub => !invalidSubscriptions.includes(sub.endpoint))
        await user.save()
        console.log(`[Push Service] 🧹 Removed ${invalidSubscriptions.length} invalid subscription(s)`)
      } catch (error) {
        console.error('[Push Service] Error removing invalid subscriptions:', error)
      }
    }

    // Return result
    return {
      status: sentCount > 0 ? 'success' : 'error',
      message: `Sent ${sentCount} push notification(s), ${failedCount} failed`,
      sentCount,
      failedCount,
      invalidSubscriptionsRemoved: invalidSubscriptions.length
    }
  } catch (error) {
    console.error('[Push Service] Error sending push notification:', error)
    return {
      status: 'error',
      message: error.message || 'Failed to send push notification',
      sentCount: 0,
      failedCount: 0
    }
  }
}

/**
 * Send push notification to multiple users
 *
 * @param {Array<string|ObjectId>} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data (same as sendPushNotification)
 * @returns {Promise<Object>} Result object with status and summary
 */
export async function sendPushNotificationToMultipleUsers(userIds, notificationData) {
  await connectMongo()

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        status: 'error',
        message: 'User IDs array is required and must not be empty',
        totalSent: 0,
        totalFailed: 0
      }
    }

    let totalSent = 0
    let totalFailed = 0
    const results = []

    // Send push to each user
    for (const userId of userIds) {
      const result = await sendPushNotification(userId, notificationData)
      results.push({ userId, ...result })
      totalSent += result.sentCount || 0
      totalFailed += result.failedCount || 0
    }

    return {
      status: totalSent > 0 ? 'success' : 'error',
      message: `Sent ${totalSent} push notification(s) to ${userIds.length} user(s), ${totalFailed} failed`,
      totalSent,
      totalFailed,
      totalUsers: userIds.length,
      results
    }
  } catch (error) {
    console.error('[Push Service] Error sending push to multiple users:', error)
    return {
      status: 'error',
      message: error.message || 'Failed to send push notifications',
      totalSent: 0,
      totalFailed: 0
    }
  }
}
