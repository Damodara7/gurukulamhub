import { NextResponse } from 'next/server'
import User from '@/app/models/user.model'
import { auth } from '@/libs/auth'
import * as ApiResponseUtils from '@/utils/apiResponses'
import connectMongo from '@/utils/dbConnect-mongo'

/**
 * POST /api/notifications/push/subscribe
 * Save push notification subscription for the authenticated user
 * Body: {
 *   endpoint: string,
 *   keys: {
 *     p256dh: string,
 *     auth: string
 *   },
 *   userAgent?: string
 * }
 */
export async function POST(request) {
  try {
    // 0. Connect to database
    await connectMongo()

    // 1. Get authenticated user
    const session = await auth()
    if (!session?.user?.email) {
      console.log('[Push Subscribe] ❌ Unauthorized: No session or email found')
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized - Please log in')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    console.log(`[Push Subscribe] ✅ Authenticated user: ${session.user.email}`)

    // 2. Get subscription from request body
    const reqBody = await request.json()
    const { endpoint, keys, userAgent } = reqBody

    // Validate required fields
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      const errorResponse = ApiResponseUtils.createErrorResponse(
        'Missing required fields: endpoint, keys.p256dh, and keys.auth are required'
      )
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // 3. Find user by email
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // 4. Initialize pushSubscriptions array if it doesn't exist
    if (!user.pushSubscriptions) {
      user.pushSubscriptions = []
    }

    // 5. Remove duplicate subscriptions (same endpoint) - keep only the most recent one
    const seenEndpoints = new Set()
    const uniqueSubscriptions = []

    // Process in reverse to keep the most recent subscription for each endpoint
    for (let i = user.pushSubscriptions.length - 1; i >= 0; i--) {
      const sub = user.pushSubscriptions[i]
      if (!seenEndpoints.has(sub.endpoint)) {
        seenEndpoints.add(sub.endpoint)
        uniqueSubscriptions.unshift(sub) // Add to beginning to maintain order
      }
    }

    // If we removed duplicates, update the array
    if (uniqueSubscriptions.length !== user.pushSubscriptions.length) {
      console.log(
        `[Push Subscribe] Removed ${
          user.pushSubscriptions.length - uniqueSubscriptions.length
        } duplicate subscription(s)`
      )
      user.pushSubscriptions = uniqueSubscriptions
    }

    // 6. Check if subscription already exists (by endpoint)
    const existingSubscriptionIndex = user.pushSubscriptions.findIndex(sub => sub.endpoint === endpoint)

    const subscriptionData = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      deviceInfo: {
        userAgent: userAgent || request.headers.get('user-agent') || 'Unknown',
        createdAt: new Date()
      }
    }

    // 7. Add or update subscription
    if (existingSubscriptionIndex !== -1) {
      // Update existing subscription (same endpoint)
      user.pushSubscriptions[existingSubscriptionIndex] = subscriptionData
      console.log(`[Push Subscribe] Updated existing subscription for user: ${session.user.email}`)
    } else {
      // Add new subscription
      user.pushSubscriptions.push(subscriptionData)
      console.log(`[Push Subscribe] Added new subscription for user: ${session.user.email}`)
    }

    // 8. Save user
    await user.save()

    // 9. Return success
    const successResponse = ApiResponseUtils.createSuccessResponse('Push subscription saved successfully', {
      subscriptionCount: user.pushSubscriptions.length,
      endpoint: endpoint.substring(0, 50) + '...' // Return partial endpoint for confirmation
    })
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } catch (error) {
    console.error('[Push Subscribe Route] Error:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Failed to save push subscription')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
