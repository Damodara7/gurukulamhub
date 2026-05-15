import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import Notification from './notification.model.js'
import User from '@/app/models/user.model.js'
import {
  broadcastNotificationToUser,
  broadcastNotificationCount,
  broadcastNotificationUpdate
} from '../ws/notifications/[userId]/publishers.js'
import { broadcastToUser } from '../ws/users/[userEmail]/publishers.js'
import { sendPushNotification } from './push.service.js'

export const getOne = async (filter = {}) => {
  await connectMongo()
  try {
    if (filter._id && !mongoose.Types.ObjectId.isValid(filter._id)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid notification ID format'
      }
    }

    const notification = await Notification.findOne(filter).populate('userId', 'email').lean()

    if (!notification) {
      return {
        status: 'error',
        result: null,
        message: 'Notification not found'
      }
    }

    return {
      status: 'success',
      result: notification,
      message: 'Notification retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve notification'
    }
  }
}

export const getAll = async (userId, options = {}) => {
  await connectMongo()
  try {
    if (!userId) {
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    // Convert userId to ObjectId if it's a string
    let userIdObjectId = userId
    if (typeof userId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          status: 'error',
          result: null,
          message: 'Invalid user ID format'
        }
      }
      userIdObjectId = new mongoose.Types.ObjectId(userId)
    }

    // Parse options - handle string values from query params
    const page = options.page ? parseInt(options.page) : 1
    const limit = options.limit ? parseInt(options.limit) : 50
    const type = options.type
    const isRead = options.isRead !== undefined ? options.isRead === 'true' || options.isRead === true : undefined
    const isFavorite =
      options.isFavorite !== undefined ? options.isFavorite === 'true' || options.isFavorite === true : undefined
    const sortBy = options.sortBy || 'createdAt'

    // Handle sortOrder - can be "desc", "asc", or a number
    let sortOrder = -1
    if (options.sortOrder) {
      if (typeof options.sortOrder === 'string') {
        if (options.sortOrder.toLowerCase() === 'desc') {
          sortOrder = -1
        } else if (options.sortOrder.toLowerCase() === 'asc') {
          sortOrder = 1
        } else {
          sortOrder = parseInt(options.sortOrder) || -1
        }
      } else {
        sortOrder = parseInt(options.sortOrder) || -1
      }
    }

    // Build filter - use ObjectId for proper MongoDB query
    const filter = { userId: userIdObjectId }
    if (type) filter.type = type
    if (isRead !== undefined) filter.isRead = isRead
    if (isFavorite !== undefined) filter.isFavorite = isFavorite

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sort = { [sortBy]: sortOrder }

    // Execute query
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).populate('userId', 'email').lean(),
      Notification.countDocuments(filter)
    ])

    return {
      status: 'success',
      result: notifications,
      message: `Found ${notifications.length} notifications`,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }
  } catch (error) {
    console.error('[Notifications Service getAll] Error:', error)
    console.error('[Notifications Service getAll] Error stack:', error.stack)
    console.error('[Notifications Service getAll] userId:', userId)
    console.error('[Notifications Service getAll] options:', options)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve notifications'
    }
  }
}

export const getUnread = async (userId, options = {}) => {
  await connectMongo()
  try {
    return await getAll(userId, { ...options, isRead: false })
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve unread notifications'
    }
  }
}

export const getFavorite = async (userId, options = {}) => {
  await connectMongo()
  try {
    return await getAll(userId, { ...options, isFavorite: true })
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve favorite notifications'
    }
  }
}

export const getCount = async userId => {
  await connectMongo()
  try {
    if (!userId) {
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const [total, unread] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false })
    ])

    return {
      status: 'success',
      result: { total, unread },
      message: 'Notification counts retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve notification counts'
    }
  }
}

/**
 * Get notifications created by an admin (for admin list with seen/total).
 * No limit by default (same as games): returns all. Optional options.limit / options.page for pagination.
 */
export const getByCreatedBy = async (createdByEmail, options = {}) => {
  await connectMongo()
  try {
    if (!createdByEmail) {
      return {
        status: 'error',
        result: null,
        message: 'createdByEmail is required'
      }
    }

    const sortBy = options.sortBy || 'createdAt'
    let sortOrder = -1
    if (options.sortOrder === 'asc') sortOrder = 1

    const filter = { createdByEmail: String(createdByEmail).trim(), type: 'ADMIN_NOTIFICATION' }
    const sort = { [sortBy]: sortOrder }

    const hasLimit = options.limit != null && options.limit !== ''
    let notifications, total

    if (hasLimit) {
      const page = Math.max(1, options.page ? parseInt(options.page) : 1)
      const limit = Math.min(1000, Math.max(1, parseInt(options.limit) || 20))
      const skip = (page - 1) * limit
      ;[notifications, total] = await Promise.all([
        Notification.find(filter).sort(sort).skip(skip).limit(limit).populate('userId', 'email').lean(),
        Notification.countDocuments(filter)
      ])
      const totalPages = Math.ceil(total / limit)
      return {
        status: 'success',
        result: notifications,
        pagination: { page, limit, total, totalPages },
        message: `Found ${notifications.length} notifications`
      }
    }

    notifications = await Notification.find(filter).sort(sort).populate('userId', 'email').lean()

    return {
      status: 'success',
      result: notifications,
      message: `Found ${notifications.length} notifications`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get notifications by creator'
    }
  }
}

/**
 * Get all admin notifications (no createdByEmail filter). For SUPER_ADMIN only.
 */
export const getAllAdminNotifications = async (options = {}) => {
  await connectMongo()
  try {
    const sortBy = options.sortBy || 'createdAt'
    let sortOrder = -1
    if (options.sortOrder === 'asc') sortOrder = 1

    const filter = { type: 'ADMIN_NOTIFICATION' }
    const sort = { [sortBy]: sortOrder }

    const notifications = await Notification.find(filter).sort(sort).populate('userId', 'email').lean()

    return {
      status: 'success',
      result: notifications,
      message: `Found ${notifications.length} admin notifications`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get all admin notifications'
    }
  }
}

export const addOne = async notificationData => {
  await connectMongo()
  try {
    // Validate required fields
    const requiredFields = ['userId', 'type', 'title', 'message']
    const missingFields = requiredFields.filter(field => !notificationData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(notificationData.userId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    // Verify user exists
    const user = await User.findById(notificationData.userId)
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    // Create new notification instance
    const newNotification = new Notification(notificationData)

    // Validate the notification
    const validationError = newNotification.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    const savedNotification = await newNotification.save()
    const notificationObj = savedNotification.toObject()

    // Emit WebSocket event for real-time notification
    try {
      broadcastNotificationToUser(notificationData.userId.toString(), notificationObj)

      // Also update notification count
      const countResult = await getCount(notificationData.userId)
      if (countResult.status === 'success') {
        broadcastNotificationCount(notificationData.userId.toString(), countResult.result)
      }
    } catch (wsError) {
      console.error('Error broadcasting notification via WebSocket:', wsError)
      // Don't fail the notification creation if WebSocket fails
    }

    // Send push notification
    try {
      // Filter out large base64 images from metadata for push notifications
      // Push notifications have a 4096 byte limit, so exclude large images
      const filteredMetadata = {}
      if (notificationData.metadata) {
        Object.keys(notificationData.metadata).forEach(key => {
          const value = notificationData.metadata[key]
          // Skip large base64 images (base64 strings are typically > 1000 chars)
          if (typeof value === 'string' && value.length > 1000) {
            return
          }
          // Skip known large image fields
          if (key === 'thumbnailPoster' || key === 'thumbnailUrl' || key === 'avatarImage') {
            return
          }
          filteredMetadata[key] = value
        })
      }

      // Use default icon instead of base64 image to keep payload small
      const pushResult = await sendPushNotification(notificationData.userId, {
        title: notificationData.title,
        body: notificationData.message,
        icon: '/icons/icon-192x192.png', // Always use default icon, not base64 image
        url: notificationData.actionUrl || '/',
        tag: notificationData.type,
        data: {
          notificationId: notificationObj._id?.toString() || notificationObj._id,
          type: notificationData.type,
          ...filteredMetadata
        }
      })

      if (pushResult.status === 'success') {
        console.log(`[Notification Service] ✅ Push notification sent: ${pushResult.message}`)
      } else {
        console.warn(`[Notification Service] ⚠️ Push notification failed: ${pushResult.message}`)
      }
    } catch (pushError) {
      console.error('[Notification Service] Error sending push notification:', pushError)
      // Don't fail the notification creation if push fails
    }

    return {
      status: 'success',
      result: notificationObj,
      message: 'Notification created successfully'
    }
  } catch (error) {
    // Handle mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${validationErrors.join(', ')}`
      }
    }

    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create notification'
    }
  }
}

export const addMany = async notificationsData => {
  await connectMongo()
  try {
    if (!Array.isArray(notificationsData) || notificationsData.length === 0) {
      return {
        status: 'error',
        result: null,
        message: 'Notifications data must be a non-empty array'
      }
    }

    // Validate all notifications
    const notifications = []
    for (const notificationData of notificationsData) {
      const requiredFields = ['userId', 'type', 'title', 'message']
      const missingFields = requiredFields.filter(field => !notificationData[field])

      if (missingFields.length > 0) {
        return {
          status: 'error',
          result: null,
          message: `Missing required fields in notification: ${missingFields.join(', ')}`
        }
      }

      if (!mongoose.Types.ObjectId.isValid(notificationData.userId)) {
        return {
          status: 'error',
          result: null,
          message: `Invalid user ID format in notification`
        }
      }

      notifications.push(new Notification(notificationData))
    }

    // Verify all users exist before creating notifications
    const userIds = [...new Set(notificationsData.map(n => n.userId.toString()))]
    const existingUsers = await User.find({ _id: { $in: userIds } })
      .select('_id')
      .lean()
    const existingUserIds = new Set(existingUsers.map(u => u._id.toString()))

    // Check if all userIds exist
    const invalidUserIds = userIds.filter(id => !existingUserIds.has(id))
    if (invalidUserIds.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `User(s) not found: ${invalidUserIds.join(', ')}`
      }
    }

    // Bulk insert
    const savedNotifications = await Notification.insertMany(notifications, {
      ordered: false // Continue inserting even if some fail
    })

    // Emit WebSocket events for each notification
    try {
      const userIds = new Set()
      for (const savedNotification of savedNotifications) {
        const notificationObj = savedNotification.toObject ? savedNotification.toObject() : savedNotification
        const userId = notificationObj.userId?.toString() || notificationObj.userId

        if (userId) {
          broadcastNotificationToUser(userId, notificationObj)
          userIds.add(userId)
        }
      }

      // Update notification counts for all affected users
      for (const userId of userIds) {
        try {
          const countResult = await getCount(userId)
          if (countResult.status === 'success') {
            broadcastNotificationCount(userId, countResult.result)
          }
        } catch (countError) {
          console.error(`Error getting count for user ${userId}:`, countError)
        }
      }
    } catch (wsError) {
      console.error('Error broadcasting notifications via WebSocket:', wsError)
      // Don't fail the notification creation if WebSocket fails
    }

    // Send push notifications for each notification
    try {
      for (let i = 0; i < savedNotifications.length; i++) {
        const savedNotification = savedNotifications[i]
        const notificationObj = savedNotification.toObject ? savedNotification.toObject() : savedNotification
        const originalNotificationData = notificationsData[i]

        // Filter out large base64 images from metadata for push notifications
        // Push notifications have a 4096 byte limit, so exclude large images
        const filteredMetadata = {}
        if (originalNotificationData.metadata) {
          Object.keys(originalNotificationData.metadata).forEach(key => {
            const value = originalNotificationData.metadata[key]
            // Skip large base64 images (base64 strings are typically > 1000 chars)
            if (typeof value === 'string' && value.length > 1000) {
              return
            }
            // Skip known large image fields
            if (key === 'thumbnailPoster' || key === 'thumbnailUrl' || key === 'avatarImage') {
              return
            }
            filteredMetadata[key] = value
          })
        }

        // Use default icon instead of base64 image to keep payload small
        const pushResult = await sendPushNotification(originalNotificationData.userId, {
          title: originalNotificationData.title,
          body: originalNotificationData.message,
          icon: '/icons/icon-192x192.png', // Always use default icon, not base64 image
          url: originalNotificationData.actionUrl || '/',
          tag: originalNotificationData.type,
          data: {
            notificationId: notificationObj._id?.toString() || notificationObj._id,
            type: originalNotificationData.type,
            ...filteredMetadata
          }
        })

        if (pushResult.status === 'success') {
          console.log(
            `[Notification Service] ✅ Push notification sent to user ${originalNotificationData.userId}: ${pushResult.message}`
          )
        } else {
          console.warn(
            `[Notification Service] ⚠️ Push notification failed for user ${originalNotificationData.userId}: ${pushResult.message}`
          )
        }
      }
    } catch (pushError) {
      console.error('[Notification Service] Error sending push notifications:', pushError)
      // Don't fail the notification creation if push fails
    }

    return {
      status: 'success',
      result: savedNotifications,
      message: `Created ${savedNotifications.length} notifications successfully`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create notifications'
    }
  }
}

export const markAsRead = async (notificationId, userId = null) => {
  await connectMongo()
  try {
    if (!notificationId) {
      return {
        status: 'error',
        result: null,
        message: 'Notification ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid notification ID format'
      }
    }

    // Build filter
    const filter = { _id: notificationId }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          status: 'error',
          result: null,
          message: 'Invalid user ID format'
        }
      }
      filter.userId = userId
    }

    // Update notification
    const notification = await Notification.findOneAndUpdate(
      filter,
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    ).lean()

    if (!notification) {
      return {
        status: 'error',
        result: null,
        message: 'Notification not found or unauthorized'
      }
    }

    // Emit WebSocket event for notification update
    try {
      const notificationUserId = notification.userId?.toString() || notification.userId
      if (notificationUserId) {
        broadcastNotificationUpdate(notificationUserId, {
          notificationId: notification._id?.toString() || notification._id,
          isRead: true,
          readAt: notification.readAt
        })

        // Update notification count
        const countResult = await getCount(notificationUserId)
        if (countResult.status === 'success') {
          broadcastNotificationCount(notificationUserId, countResult.result)
        }
      }

      // Notify admin (creator) so "Seen: X / Y users" updates in real time on admin list
      const createdByEmail = notification.createdByEmail
      if (createdByEmail && notification.type === 'ADMIN_NOTIFICATION') {
        try {
          broadcastToUser(createdByEmail, {
            kind: 'adminNotificationSeenUpdate',
            adminNotificationId: notification.adminNotificationId
          })
        } catch (adminWsError) {
          console.error('Error broadcasting admin notification seen update via WebSocket:', adminWsError)
        }
      }
    } catch (wsError) {
      console.error('Error broadcasting notification update via WebSocket:', wsError)
      // Don't fail the operation if WebSocket fails
    }

    return {
      status: 'success',
      result: notification,
      message: 'Notification marked as read'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to mark notification as read'
    }
  }
}

export const markAllAsRead = async userId => {
  await connectMongo()
  try {
    if (!userId) {
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const result = await Notification.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date()
      }
    )

    // Emit WebSocket event for notification count update
    try {
      const countResult = await getCount(userId)
      if (countResult.status === 'success') {
        broadcastNotificationCount(userId.toString(), countResult.result)
      }
    } catch (wsError) {
      console.error('Error broadcasting notification count via WebSocket:', wsError)
      // Don't fail the operation if WebSocket fails
    }

    return {
      status: 'success',
      result: {
        modifiedCount: result.modifiedCount
      },
      message: `Marked ${result.modifiedCount} notifications as read`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to mark all notifications as read'
    }
  }
}

export const updateOne = async (notificationId, updateData) => {
  await connectMongo()
  try {
    if (!notificationId) {
      return {
        status: 'error',
        result: null,
        message: 'Notification ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid notification ID format'
      }
    }

    // Find the existing notification
    const existingNotification = await Notification.findById(notificationId)
    if (!existingNotification) {
      return {
        status: 'error',
        result: null,
        message: 'Notification not found'
      }
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        existingNotification[key] = updateData[key]
      }
    })

    // Validate the updated notification
    const validationError = existingNotification.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    // Save the updated notification
    const updatedNotification = await existingNotification.save()

    return {
      status: 'success',
      result: updatedNotification.toObject(),
      message: 'Notification updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update notification'
    }
  }
}

export const deleteOne = async (notificationId, userId = null) => {
  await connectMongo()
  try {
    if (!notificationId) {
      return {
        status: 'error',
        result: null,
        message: 'Notification ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid notification ID format'
      }
    }

    // Build filter
    const filter = { _id: notificationId }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          status: 'error',
          result: null,
          message: 'Invalid user ID format'
        }
      }
      filter.userId = userId
    }

    const deletedNotification = await Notification.findOneAndDelete(filter)

    if (!deletedNotification) {
      return {
        status: 'error',
        result: null,
        message: 'Notification not found or unauthorized'
      }
    }

    return {
      status: 'success',
      result: deletedNotification,
      message: 'Notification deleted successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete notification'
    }
  }
}

/**
 * Delete all notifications for an admin announcement (by adminNotificationId). Admin only; optionally scoped by createdByEmail.
 */
/**
 * Delete all notification documents (all users). Super-admin / admin maintenance only.
 * @param {{ preserveAnnouncementTemplates?: boolean }} options
 */
export const deleteAllNotifications = async ({ preserveAnnouncementTemplates = false } = {}) => {
  await connectMongo()
  try {
    const filter = preserveAnnouncementTemplates ? { isAnnouncementTemplate: { $ne: true } } : {}

    const result = await Notification.deleteMany(filter)

    return {
      status: 'success',
      result: { deletedCount: result.deletedCount },
      message: `Deleted ${result.deletedCount} notification(s) successfully`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete all notifications'
    }
  }
}

export const deleteByAdminNotificationId = async (adminNotificationId, createdByEmail = null) => {
  await connectMongo()
  try {
    if (!adminNotificationId) {
      return {
        status: 'error',
        result: null,
        message: 'adminNotificationId is required'
      }
    }

    const filter = { adminNotificationId: String(adminNotificationId), type: 'ADMIN_NOTIFICATION' }
    if (createdByEmail) filter.createdByEmail = String(createdByEmail).trim()

    const result = await Notification.deleteMany(filter)

    return {
      status: 'success',
      result: { deletedCount: result.deletedCount },
      message: `Deleted ${result.deletedCount} notification(s) successfully`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete notifications by adminNotificationId'
    }
  }
}

export const getByType = async (userId, type, options = {}) => {
  await connectMongo()
  try {
    return await getAll(userId, { ...options, type })
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve notifications by type'
    }
  }
}

export const toggleFavorite = async (notificationId, userId = null) => {
  await connectMongo()
  try {
    if (!notificationId) {
      return {
        status: 'error',
        result: null,
        message: 'Notification ID is required'
      }
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid notification ID format'
      }
    }

    // Build filter
    const filter = { _id: notificationId }
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          status: 'error',
          result: null,
          message: 'Invalid user ID format'
        }
      }
      filter.userId = userId
    }

    // Get current notification to toggle favorite status
    const notification = await Notification.findOne(filter)
    if (!notification) {
      return {
        status: 'error',
        result: null,
        message: 'Notification not found or unauthorized'
      }
    }

    // Toggle favorite status
    const newFavoriteStatus = !notification.isFavorite
    const updatedNotification = await Notification.findOneAndUpdate(
      filter,
      {
        isFavorite: newFavoriteStatus
      },
      { new: true }
    ).lean()

    // Emit WebSocket event for notification update
    try {
      const notificationUserId = updatedNotification.userId?.toString() || updatedNotification.userId
      if (notificationUserId) {
        broadcastNotificationUpdate(notificationUserId, {
          notificationId: updatedNotification._id?.toString() || updatedNotification._id,
          isFavorite: newFavoriteStatus
        })
      }
    } catch (wsError) {
      console.error('Error broadcasting notification update via WebSocket:', wsError)
      // Don't fail the operation if WebSocket fails
    }

    return {
      status: 'success',
      result: updatedNotification,
      message: `Notification ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to toggle favorite status'
    }
  }
}

export const deleteExpired = async () => {
  await connectMongo()
  try {
    const now = new Date()
    const result = await Notification.deleteMany({
      expiresAt: { $lt: now }
    })

    return {
      status: 'success',
      result: {
        deletedCount: result.deletedCount
      },
      message: `Deleted ${result.deletedCount} expired notifications`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete expired notifications'
    }
  }
}

// ——— Single-model announcements (stored as notification templates) ———

/**
 * Check if a user matches the filters array (Audience canonical format).
 * user must have profile populated (age, gender, locality, region, country).
 */
export const userMatchesFilters = (user, filters) => {
  if (!Array.isArray(filters) || filters.length === 0) return true
  const profile = user?.profile || {}

  let result = null
  for (let i = 0; i < filters.length; i++) {
    const f = filters[i]
    let matches = false
    if (f.type === 'age' && f.criteria) {
      const age = profile?.age
      const hasAge = age != null
      const { min, max } = f.criteria
      matches = hasAge && age >= min && age <= max
    } else if (f.type === 'location' && f.criteria) {
      const c = f.criteria
      const countryMatch = !c.country || (profile?.country?.toLowerCase() === c.country?.toLowerCase())
      const regionMatch = !c.region || (profile?.region?.toLowerCase() === c.region?.toLowerCase())
      const cityMatch = !c.city || (profile?.locality?.toLowerCase() === c.city?.toLowerCase())
      matches = countryMatch && regionMatch && cityMatch
    } else if (f.type === 'gender' && f.criteria) {
      // Canonical format: { values: ['male','female'] } or legacy: array/object
      let genders = []
      if (Array.isArray(f.criteria?.values)) {
        genders = f.criteria.values
      } else if (Array.isArray(f.criteria)) {
        genders = f.criteria
      } else if (f.criteria && typeof f.criteria === 'object') {
        genders = Object.entries(f.criteria)
          .filter(([k, v]) => k !== 'values' && Boolean(v))
          .map(([k]) => k)
      }
      const userGender = profile?.gender?.toLowerCase()
      matches = Boolean(userGender) && genders.some(g => String(g).toLowerCase() === userGender)
    }

    if (i === 0) {
      result = matches
    } else {
      const op = (f.operator || 'AND').toUpperCase()
      if (op === 'AND') result = result && matches
      else if (op === 'OR') result = result || matches
      else if (op === 'NOT') result = result && !matches
      else result = result && matches
    }
  }
  return result === null ? true : !!result
}

/**
 * Get announcement data by adminNotificationId for edit mode.
 * Returns title, message, actionUrl, actionLabel, filters, includeForNewUsers, recipientUserIds.
 * We always save a config doc now, so template exists; template.isActive = includeForNewUsers.
 */
export const getAnnouncementByAdminNotificationId = async (adminNotificationId, createdByEmail = null) => {
  await connectMongo()
  try {
    if (!adminNotificationId) {
      return { status: 'error', result: null, message: 'adminNotificationId is required' }
    }

    const filter = { adminNotificationId: String(adminNotificationId), type: 'ADMIN_NOTIFICATION' }
    if (createdByEmail) filter.createdByEmail = String(createdByEmail).trim()

    const docs = await Notification.find(filter).lean()
    if (!docs?.length) {
      return { status: 'error', result: null, message: 'Announcement not found' }
    }

    const template = docs.find(d => d.isAnnouncementTemplate === true)
    const userNotifications = docs.filter(d => d.userId && !d.isAnnouncementTemplate)

    const contentSource = template || userNotifications[0]
    const title = contentSource?.title || ''
    const message = contentSource?.message || ''
    const actionUrl = contentSource?.actionUrl || null
    const actionLabel = contentSource?.actionLabel || null

    let filters = []
    let includeForNewUsers = false
    let recipientUserIds = []

    if (template) {
      includeForNewUsers = template.isActive === true
      filters = Array.isArray(template.filters) && template.filters.length > 0 ? template.filters : []

      if (filters.length > 0) {
        // Scenario 1 or 2: has filters → re-apply to current users
        const users = await User.find({}).populate('profile').lean()
        recipientUserIds = users
          .filter(u => userMatchesFilters(u, filters))
          .map(u => u._id?.toString())
          .filter(Boolean)
      } else {
        // Scenario 3 or 4: no filters
        if (includeForNewUsers) {
          // Scenario 4: include new users, send to all → current all users
          const users = await User.find({}).select('_id').lean()
          recipientUserIds = users.map(u => u._id?.toString()).filter(Boolean)
        } else {
          // Scenario 3: no include, was sent to all at create time → use user notifications
          recipientUserIds = userNotifications
            .map(n => n.userId?.toString?.() || n.userId)
            .filter(Boolean)
        }
      }
    } else {
      // Legacy: no template (old announcements before we always saved config)
      recipientUserIds = userNotifications
        .map(n => n.userId?.toString?.() || n.userId)
        .filter(Boolean)
    }

    return {
      status: 'success',
      result: {
        adminNotificationId: String(adminNotificationId),
        title,
        message,
        actionUrl,
        actionLabel,
        filters,
        includeForNewUsers,
        recipientUserIds
      },
      message: 'Announcement retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get announcement'
    }
  }
}

/**
 * Create an announcement with 4-scenario logic:
 * Scenario 1: Filters + No include new users → Save config (isActive=false) with filters, send to targetUserIds only
 * Scenario 2: Filters + Yes include new users → Save template WITH filters (isActive=true), send to targetUserIds
 * Scenario 3: No filters + No include new users → Save config (isActive=false) with filters:null, send to all
 * Scenario 4: No filters + Yes include new users → Save template filters:null (isActive=true), send to all
 * We always save a config/template doc so edit mode can retrieve filters; isActive=false means "don't send to new users".
 * @param {Object} options
 * @param {string} [options.existingAdminNotificationId] - For edit: reuse this ID instead of creating new
 */
export const createAnnouncement = async ({
  title,
  message,
  actionUrl,
  actionLabel,
  createdByEmail,
  sendToAll = false,
  includeForNewUsers = true,
  targetUserIds,
  filters,
  existingAdminNotificationId = null
}) => {
  await connectMongo()
  try {
    const adminNotificationId = existingAdminNotificationId || new mongoose.Types.ObjectId().toString()
    const isIncludeForNewUsers = includeForNewUsers === true || includeForNewUsers === 'true'
    const hasFilters = Array.isArray(filters) && filters.length > 0
    const hasTargetUsers = Array.isArray(targetUserIds) && targetUserIds.length > 0

    // Always save a config doc for edit-time retrieval of filters; isActive controls whether new users get it
    const templateFilters = hasFilters ? filters : null
    const template = new Notification({
      type: 'ADMIN_NOTIFICATION',
      title,
      message,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      createdByEmail,
      adminNotificationId,
      isAnnouncementTemplate: true,
      isActive: isIncludeForNewUsers,
      activeUntil: null,
      filters: templateFilters
    })
    const savedTemplate = await template.save()

    // Determine who to send to now
    let userIds = []
    if (hasTargetUsers) {
      userIds = targetUserIds.filter(id => id && mongoose.Types.ObjectId.isValid(id))
    } else {
      const users = await User.find({}).select('_id').lean()
      userIds = users.map(u => u._id.toString()).filter(Boolean)
    }

    const sentCount = userIds.length
    if (userIds.length > 0) {
      const payloads = userIds.map(uid => ({
        userId: uid,
        type: 'ADMIN_NOTIFICATION',
        title,
        message,
        actionUrl: actionUrl || undefined,
        actionLabel: actionLabel || undefined,
        adminNotificationId,
        createdByEmail
      }))
      const batchResult = await addMany(payloads)
      if (batchResult.status !== 'success') {
        console.error('[Notification Service] createAnnouncement batch failed:', batchResult.message)
      }
    }

    return {
      status: 'success',
      result: {
        announcement: savedTemplate,
        adminNotificationId,
        sentCount
      },
      message:
        sentCount > 0
          ? `Announcement created and sent to ${sentCount} user(s)`
          : 'Announcement created successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create announcement'
    }
  }
}

/**
 * Update an announcement: delete all existing (user notifications + template), then create fresh with same adminNotificationId.
 */
export const updateAnnouncement = async ({
  adminNotificationId,
  createdByEmail,
  title,
  message,
  actionUrl,
  actionLabel,
  includeForNewUsers = true,
  targetUserIds,
  filters
}) => {
  await connectMongo()
  try {
    if (!adminNotificationId) {
      return { status: 'error', result: null, message: 'adminNotificationId is required' }
    }

    const deleteResult = await deleteByAdminNotificationId(adminNotificationId, createdByEmail)
    if (deleteResult.status !== 'success') {
      return deleteResult
    }

    const hasTargetUsers = Array.isArray(targetUserIds) && targetUserIds.length > 0
    const result = await createAnnouncement({
      title,
      message,
      actionUrl,
      actionLabel,
      createdByEmail,
      sendToAll: !hasTargetUsers,
      includeForNewUsers,
      targetUserIds: hasTargetUsers ? targetUserIds : undefined,
      filters,
      existingAdminNotificationId: adminNotificationId
    })

    if (result.status === 'success') {
      return {
        ...result,
        message:
          result.result?.sentCount > 0
            ? `Announcement updated and sent to ${result.result.sentCount} user(s)`
            : 'Announcement updated successfully'
      }
    }
    return result
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update announcement'
    }
  }
}

/**
 * Get all active announcement templates (single-model: stored as notifications with isAnnouncementTemplate true).
 */
export const getActiveAnnouncementTemplates = async () => {
  await connectMongo()
  try {
    const now = new Date()
    const templates = await Notification.find({
      isAnnouncementTemplate: true,
      isActive: true,
      $or: [{ activeUntil: null }, { activeUntil: { $gt: now } }]
    })
      .sort({ createdAt: -1 })
      .lean()

    return {
      status: 'success',
      result: templates,
      message: `Found ${templates.length} active announcement(s)`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to get active announcements'
    }
  }
}

/**
 * For a new user: create one notification per active announcement template (single-model).
 * - Templates with filters:null (Scenario 4) → send to all new users
 * - Templates with filters (Scenario 2) → send only if user matches filters
 */
export const sendActiveAnnouncementsToUser = async userId => {
  await connectMongo()
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return { status: 'error', result: null, message: 'Invalid user ID' }
    }

    const activeResult = await getActiveAnnouncementTemplates()
    if (activeResult.status !== 'success' || !activeResult.result?.length) {
      return { status: 'success', result: { count: 0 }, message: 'No active announcements' }
    }

    const templates = activeResult.result
    const userIdStr = userId.toString()

    // Skip templates the user already received (e.g. from signup or previous profile update)
    const existingForUser = await Notification.find(
      { userId: userIdStr, type: 'ADMIN_NOTIFICATION' },
      { adminNotificationId: 1 }
    ).lean()
    const alreadyReceivedIds = new Set(
      (existingForUser || [])
        .map(n => n.adminNotificationId)
        .filter(Boolean)
    )

    // Fetch user with profile for filter evaluation (needed for templates with filters)
    let user = null
    const templatesWithFilters = templates.filter(t => Array.isArray(t.filters) && t.filters.length > 0)
    if (templatesWithFilters.length > 0) {
      user = await User.findById(userId).populate('profile').lean()
      if (!user) {
        return { status: 'error', result: null, message: 'User not found' }
      }
    }

    const payloads = []
    for (const t of templates) {
      if (alreadyReceivedIds.has(t.adminNotificationId)) continue

      if (!t.filters || t.filters.length === 0) {
        // Scenario 4: no filters → send to all new users
        payloads.push({
          userId: userIdStr,
          type: 'ADMIN_NOTIFICATION',
          title: t.title,
          message: t.message,
          actionUrl: t.actionUrl || undefined,
          actionLabel: t.actionLabel || undefined,
          adminNotificationId: t.adminNotificationId,
          createdByEmail: t.createdByEmail
        })
      } else {
        // Scenario 2: has filters → send only if user matches
        if (user && userMatchesFilters(user, t.filters)) {
          payloads.push({
            userId: userIdStr,
            type: 'ADMIN_NOTIFICATION',
            title: t.title,
            message: t.message,
            actionUrl: t.actionUrl || undefined,
            actionLabel: t.actionLabel || undefined,
            adminNotificationId: t.adminNotificationId,
            createdByEmail: t.createdByEmail
          })
        }
      }
    }

    if (payloads.length === 0) {
      return { status: 'success', result: { count: 0 }, message: 'No matching announcements for new user' }
    }

    const batchResult = await addMany(payloads)
    if (batchResult.status !== 'success') {
      return { status: 'error', result: null, message: batchResult.message || 'Failed to send announcements' }
    }

    return {
      status: 'success',
      result: { count: payloads.length },
      message: `Sent ${payloads.length} announcement(s) to new user`
    }
  } catch (error) {
    console.error('[Notification Service] sendActiveAnnouncementsToUser error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to send announcements to user'
    }
  }
}
