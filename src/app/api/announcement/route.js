import * as NotificationService from '@/app/api/notifications/notification.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import connectMongo from '@/utils/dbConnect-mongo'

/**
 * GET /api/announcement?adminNotificationId=xxx
 * Fetch announcement by adminNotificationId for edit mode. Admin only, creator only.
 */
export async function GET(request) {
  try {
    await connectMongo()

    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.roles?.includes('ADMIN') || session.user.isAdmin
    if (!isAdmin) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Only admins can fetch announcements')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const { searchParams } = new URL(request.url)
    const adminNotificationId = searchParams.get('adminNotificationId')
    if (!adminNotificationId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('adminNotificationId is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const result = await NotificationService.getAnnouncementByAdminNotificationId(
      adminNotificationId,
      session.user.email
    )

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }

    const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error?.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * POST /api/announcement
 * Create announcement (single-model: stored as notification template) and optionally send to all users.
 * Body: { title, message, actionUrl?, actionLabel?, sendToAll: boolean }
 * Admin only.
 */
export async function POST(request) {
  try {
    await connectMongo()

    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.roles?.includes('ADMIN') || session.user.isAdmin
    if (!isAdmin) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Only admins can create announcements')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const body = await request.json()
    const {
      title,
      message,
      actionUrl,
      actionLabel,
      sendToAll = false,
      includeForNewUsers = true,
      targetUserIds,
      filters
    } = body

    if (!title?.trim() || !message?.trim()) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Title and message are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const result = await NotificationService.createAnnouncement({
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl?.trim() || null,
      actionLabel: actionLabel?.trim() || null,
      createdByEmail: session.user.email,
      sendToAll: !!sendToAll,
      includeForNewUsers: includeForNewUsers !== false && includeForNewUsers !== 'false',
      targetUserIds: Array.isArray(targetUserIds) ? targetUserIds : undefined,
      filters: Array.isArray(filters) ? filters : undefined
    })

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }

    const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error?.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * PUT /api/announcement
 * Update announcement by adminNotificationId. Delete existing + create fresh with same ID.
 * Body: { adminNotificationId, title, message, actionUrl?, actionLabel?, includeForNewUsers, targetUserIds?, filters? }
 * Admin only, creator only.
 */
export async function PUT(request) {
  try {
    await connectMongo()

    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.roles?.includes('ADMIN') || session.user.isAdmin
    if (!isAdmin) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Only admins can update announcements')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const body = await request.json()
    const {
      adminNotificationId,
      title,
      message,
      actionUrl,
      actionLabel,
      includeForNewUsers = true,
      targetUserIds,
      filters
    } = body

    if (!adminNotificationId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('adminNotificationId is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    if (!title?.trim() || !message?.trim()) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Title and message are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const result = await NotificationService.updateAnnouncement({
      adminNotificationId: String(adminNotificationId).trim(),
      createdByEmail: session.user.email,
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl?.trim() || null,
      actionLabel: actionLabel?.trim() || null,
      includeForNewUsers: includeForNewUsers !== false && includeForNewUsers !== 'false',
      targetUserIds: Array.isArray(targetUserIds) ? targetUserIds : undefined,
      filters: Array.isArray(filters) ? filters : undefined
    })

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }

    const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error?.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
