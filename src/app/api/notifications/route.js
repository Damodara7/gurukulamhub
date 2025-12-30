import * as NotificationService from './notification.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import User from '@/app/models/user.model.js'

const Artifact = 'Notifications'
const ArtifactService = NotificationService

/**
 * GET /api/notifications
 * Query params:
 * - id: Get single notification by ID
 * - userId: Get notifications for specific user (admin only)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 * - type: Filter by notification type
 * - isRead: Filter by read status (true/false)
 * - priority: Filter by priority (low/medium/high)
 * - unread: Get only unread notifications (true)
 * - count: Get notification counts only (true)
 */
export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { id, userId, unread, favorite, count, ...rest } = queryParamsObj

    // Get session for authentication
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    let artifact

    // Get single notification by ID
    if (id) {
      artifact = await ArtifactService.getOne({ _id: id })

      // Security check: ensure user can only access their own notifications
      if (artifact.status === 'success' && artifact.result) {
        const notificationUserId = artifact.result.userId?._id?.toString() || artifact.result.userId?.toString()
        const currentUser = await User.findOne({ email: session.user.email })
        const currentUserId = currentUser?._id?.toString()

        // Check if user is admin or owns the notification
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
        if (!isAdmin && notificationUserId !== currentUserId) {
          const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to access this notification')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
      }
    }
    // Get notification counts
    else if (count === 'true') {
      // Determine target userId
      let targetUserId = userId

      // If userId not provided, use current user's ID
      if (!targetUserId) {
        const currentUser = await User.findOne({ email: session.user.email })
        if (!currentUser) {
          const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
        targetUserId = currentUser._id.toString()
      } else {
        // Security check: only admins can get counts for other users
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
        if (!isAdmin) {
          const currentUser = await User.findOne({ email: session.user.email })
          const currentUserId = currentUser?._id?.toString()
          if (targetUserId !== currentUserId) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to access notification counts')
            return ApiResponseUtils.sendErrorResponse(errorResponse)
          }
        }
      }

      artifact = await ArtifactService.getCount(targetUserId)
    }
    // Get unread notifications
    else if (unread === 'true') {
      // Determine target userId
      let targetUserId = userId

      // If userId not provided, use current user's ID
      if (!targetUserId) {
        const currentUser = await User.findOne({ email: session.user.email })
        if (!currentUser) {
          const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
        targetUserId = currentUser._id.toString()
      } else {
        // Security check: only admins can get unread notifications for other users
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
        if (!isAdmin) {
          const currentUser = await User.findOne({ email: session.user.email })
          const currentUserId = currentUser?._id?.toString()
          if (targetUserId !== currentUserId) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to access notifications')
            return ApiResponseUtils.sendErrorResponse(errorResponse)
          }
        }
      }

      artifact = await ArtifactService.getUnread(targetUserId, rest)
    }
    // Get favorite notifications
    else if (favorite === 'true') {
      // Determine target userId
      let targetUserId = userId

      // If userId not provided, use current user's ID
      if (!targetUserId) {
        const currentUser = await User.findOne({ email: session.user.email })
        if (!currentUser) {
          const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
        targetUserId = currentUser._id.toString()
      } else {
        // Security check: only admins can get favorite notifications for other users
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
        if (!isAdmin) {
          const currentUser = await User.findOne({ email: session.user.email })
          const currentUserId = currentUser?._id?.toString()
          if (targetUserId !== currentUserId) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to access notifications')
            return ApiResponseUtils.sendErrorResponse(errorResponse)
          }
        }
      }

      artifact = await ArtifactService.getFavorite(targetUserId, rest)
    }
    // Get all notifications
    else {
      // Determine target userId
      let targetUserId = userId

      // If userId not provided, use current user's ID
      if (!targetUserId) {
        const currentUser = await User.findOne({ email: session.user.email })
        if (!currentUser) {
          const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
        targetUserId = currentUser._id.toString()
      } else {
        // Security check: only admins can get notifications for other users
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
        if (!isAdmin) {
          const currentUser = await User.findOne({ email: session.user.email })
          const currentUserId = currentUser?._id?.toString()
          if (targetUserId !== currentUserId) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to access notifications')
            return ApiResponseUtils.sendErrorResponse(errorResponse)
          }
        }
      }

      // Validate and call getAll
      console.log('[Notifications Route] Getting notifications for userId:', targetUserId)
      console.log('[Notifications Route] Options:', rest)
      artifact = await ArtifactService.getAll(targetUserId, rest)
      console.log('[Notifications Route] getAll result status:', artifact?.status)
    }

    if (artifact.status === 'success') {
      // Include pagination in result if available
      const responseData = artifact.pagination
        ? { notifications: artifact.result, pagination: artifact.pagination }
        : artifact.result
      const successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, responseData)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else if (artifact.status === 'error') {
      const errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('[Notifications Route GET] Error:', error)
    console.error('[Notifications Route GET] Error stack:', error.stack)
    console.error('[Notifications Route GET] Error message:', error.message)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * POST /api/notifications
 * Create notification(s)
 * Body: Single notification object or array of notification objects
 */
export async function POST(request) {
  try {
    const reqBody = await request.json()

    // Get session for authentication
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Check if it's an array (batch creation) or single notification
    if (Array.isArray(reqBody)) {
      // Batch creation - only admins can create notifications for multiple users
      const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin
      if (!isAdmin) {
        const errorResponse = ApiResponseUtils.createErrorResponse('Only admins can create batch notifications')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }

      const newArtifact = await ArtifactService.addMany(reqBody)

      if (newArtifact?.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(
          `Created ${newArtifact.result.length} notifications successfully`,
          newArtifact?.result
        )
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact?.message || 'Unknown error')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    } else {
      // Single notification creation
      // Security check: ensure user can only create notifications for themselves unless admin
      const currentUser = await User.findOne({ email: session.user.email })
      const currentUserId = currentUser?._id?.toString()
      const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin

      const targetUserId = reqBody.userId?.toString()
      if (!isAdmin && targetUserId !== currentUserId) {
        const errorResponse = ApiResponseUtils.createErrorResponse(
          'Unauthorized to create notifications for other users'
        )
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }

      const newArtifact = await ArtifactService.addOne(reqBody)

      if (newArtifact?.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(
          `New ${Artifact} created successfully`,
          newArtifact?.result
        )
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact?.message || 'Unknown error')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * PUT /api/notifications
 * Update notification or mark as read
 * Body: { _id, ...updateData } or { markAsRead: notificationId } or { markAllAsRead: true } or { toggleFavorite: notificationId }
 */
export async function PUT(request) {
  try {
    const reqBody = await request.json()

    // Get session for authentication
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const currentUser = await User.findOne({ email: session.user.email })
    const currentUserId = currentUser?._id?.toString()

    // Handle toggle favorite operation
    if (reqBody.toggleFavorite) {
      // Toggle favorite status for single notification
      const notificationId = reqBody.toggleFavorite
      const updateResult = await ArtifactService.toggleFavorite(notificationId, currentUserId)

      if (updateResult.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    }
    // Handle mark as read operations
    else if (reqBody.markAsRead) {
      // Mark single notification as read
      const notificationId = reqBody.markAsRead
      const updateResult = await ArtifactService.markAsRead(notificationId, currentUserId)

      if (updateResult.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    } else if (reqBody.markAllAsRead === true) {
      // Mark all notifications as read for current user
      const updateResult = await ArtifactService.markAllAsRead(currentUserId)

      if (updateResult.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    } else {
      // Regular update
      const notificationId = reqBody._id
      if (!notificationId) {
        const errorResponse = ApiResponseUtils.createErrorResponse('Notification ID is required')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }

      // Security check: ensure user can only update their own notifications
      const notification = await ArtifactService.getOne({ _id: notificationId })
      if (notification.status === 'success' && notification.result) {
        const notificationUserId = notification.result.userId?._id?.toString() || notification.result.userId?.toString()
        const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin

        if (!isAdmin && notificationUserId !== currentUserId) {
          const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to update this notification')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
      }

      // Remove _id from update data
      const { _id, ...updateData } = reqBody
      const updateResult = await ArtifactService.updateOne(notificationId, updateData)

      if (updateResult.status === 'success') {
        const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
        return ApiResponseUtils.sendSuccessResponse(successResponse)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * DELETE /api/notifications?id=notificationId
 * Delete a notification
 */
export async function DELETE(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const id = searchParams.get('id')

    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Notification ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Get session for authentication
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const currentUser = await User.findOne({ email: session.user.email })
    const currentUserId = currentUser?._id?.toString()
    const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.isAdmin

    // Security check: ensure user can only delete their own notifications
    if (!isAdmin) {
      const notification = await ArtifactService.getOne({ _id: id })
      if (notification.status === 'success' && notification.result) {
        const notificationUserId = notification.result.userId?._id?.toString() || notification.result.userId?.toString()
        if (notificationUserId !== currentUserId) {
          const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized to delete this notification')
          return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
      }
    }

    const deletedNotification = await ArtifactService.deleteOne(id, isAdmin ? null : currentUserId)

    if (deletedNotification.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Notification deleted successfully',
        deletedNotification.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedNotification.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
