import * as NotificationService from './notification.service.js'
import mongoose from 'mongoose'

export const createQuizApprovedNotification = async (userId, quizData) => {
  try {
    const quizId = quizData._id?.toString() || quizData.id || quizData._id
    const quizTitle = quizData.title || 'Your Quiz'
    const approvedBy = quizData.approvedBy || 'Admin'
    const quizThumbnail = quizData.thumbnail || quizData.quiz?.thumbnail || null

    const notificationData = {
      userId: userId,
      type: 'QUIZ_APPROVED',
      title: `Quiz "${quizTitle}" Approved`,
      message: `Now ur quiz "${quizTitle}" is approved by ${approvedBy}.`,
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        approvedBy,
        approvedAt: new Date().toISOString(),
        avatarImage: quizThumbnail
      },
      actionUrl: `/myquizzes/view`,
      actionLabel: 'View Quiz'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating quiz approved notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create quiz approved notification'
    }
  }
}

export const createQuizRejectedNotification = async (userId, quizData) => {
  try {
    const quizId = quizData._id?.toString() || quizData.id || quizData._id
    const quizTitle = quizData.title || 'Your Quiz'
    const rejectedBy = quizData.approvedBy || quizData.rejectedBy || 'Admin'
    const remarks = quizData.remarks || []
    const quizThumbnail = quizData.thumbnail || quizData.quiz?.thumbnail || null

    const notificationData = {
      userId: userId,
      type: 'QUIZ_REJECTED',
      title: `Quiz "${quizTitle}" Rejected`,
      message: `Now ur quiz "${quizTitle}" is rejected.${remarks.length > 0 ? ' Please review the remarks.' : ''}`,
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        rejectedBy,
        remarks: Array.isArray(remarks) ? remarks : [remarks],
        rejectedAt: new Date().toISOString(),
        avatarImage: quizThumbnail
      },
      actionUrl: `/myquizzes/view`,
      actionLabel: 'View Quiz'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating quiz rejected notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create quiz rejected notification'
    }
  }
}

export const createGameCreatedNotification = async (userIds, gameData) => {
  console.log('[Notification Helper] ===== createGameCreatedNotification START =====')
  console.log('[Notification Helper] Input:', {
    userIds,
    userIdsCount: userIds?.length,
    gameData
  })

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.log('[Notification Helper] ❌ Invalid input: userIds is not an array or is empty')
      return {
        status: 'error',
        result: null,
        message: 'User IDs array is required and must not be empty'
      }
    }

    const gameId = gameData._id?.toString() || gameData.id || gameData._id
    const gameTitle = gameData.title || gameData.quiz?.title || 'New Game'
    const createdBy = gameData.createdBy?.email || gameData.creatorEmail || 'Admin'
    const registrationDeadline = gameData.registrationDeadline || gameData.endTime
    const maxParticipants = gameData.maxParticipants || gameData.maxPlayers
    const gameThumbnail = gameData.thumbnailPoster || gameData.thumbnail || gameData.quiz?.thumbnail || null

    console.log('[Notification Helper] Prepared data:', {
      gameId,
      gameTitle,
      createdBy,
      registrationDeadline,
      maxParticipants,
      notificationCount: userIds.length
    })

    const groupName = gameData.groupName || null
    const message = groupName
      ? `A new game "${gameTitle}" is now available to you through the group "${groupName}". Register now to participate!`
      : `A new game "${gameTitle}" has been created. Register now to participate!`

    const notificationsData = userIds.map(userId => ({
      userId: userId,
      type: 'GAME_CREATED',
      title: `Game On: "${gameTitle}"`,
      message: message,
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        groupName,
        createdBy,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        maxParticipants,
        avatarImage: gameThumbnail
      },
      actionUrl: `/public-games`,
      actionLabel: 'View Games',
      expiresAt: registrationDeadline ? new Date(registrationDeadline) : null
    }))

    console.log(
      '[Notification Helper] Calling NotificationService.addMany with',
      notificationsData.length,
      'notifications'
    )
    const result = await NotificationService.addMany(notificationsData)
    console.log('[Notification Helper] ✅ NotificationService.addMany result:', result)
    console.log('[Notification Helper] ===== createGameCreatedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGameCreatedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    console.error('[Notification Helper] Full error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game created notifications'
    }
  }
}

export const createGroupJoinedNotification = async (userId, groupData) => {
  try {
    const groupId = groupData._id?.toString() || groupData.id || groupData._id
    const groupName = groupData.groupName || 'a group'
    const addedBy = groupData.addedBy || groupData.createdBy?.email || groupData.creatorEmail || 'Admin'
    const memberCount = groupData.membersCount || groupData.members?.length || 0

    const notificationData = {
      userId: userId,
      type: 'GROUP_JOINED',
      title: `Joined in Group: "${groupName}"`,
      message: `Now u are added to the "${groupName}" group.`,
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        addedBy,
        memberCount,
        joinedAt: new Date().toISOString()
      },
      actionUrl: `/mygroups`,
      actionLabel: 'View Groups'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating group joined notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group joined notification'
    }
  }
}

export const createGroupRemovedNotification = async (userId, groupData) => {
  try {
    const groupId = groupData._id?.toString() || groupData.id || groupData._id
    const groupName = groupData.groupName || 'a group'
    const removedBy =
      groupData.removedBy || groupData.updatorEmail || groupData.createdBy?.email || groupData.creatorEmail || 'Admin'
    const isDeleted = groupData.isDeleted || false

    // Different message for group deletion vs user removal
    const title = isDeleted ? `Group Deleted: "${groupName}"` : `Removed from Group: "${groupName}"`
    const message = isDeleted
      ? `The group "${groupName}" has been deleted. You are no longer a member of this group.`
      : `Now u are removed from the "${groupName}" group.`

    const notificationData = {
      userId: userId,
      type: 'GROUP_REMOVED',
      title: title,
      message: message,
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        removedBy,
        removedAt: new Date().toISOString(),
        isDeleted: isDeleted
      },
      actionUrl: `/mygroups`,
      actionLabel: 'View Groups'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating group removed notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group removed notification'
    }
  }
}

export const createRoleAssignedNotification = async (userId, roleData) => {
  try {
    const roleName = roleData.roleName || roleData.role || 'a role'
    const assignedBy = roleData.assignedBy || roleData.assignedByEmail || 'Admin'
    const allRoles = roleData.allRoles || []

    const notificationData = {
      userId: userId,
      type: 'ROLE_ASSIGNED',
      title: `Role Assigned: "${roleName}"`,
      message: `Now u are assigned the  "${roleName}" role.`,
      relatedEntity: {
        entityType: 'role',
        entityId: roleName
      },
      metadata: {
        roleName,
        assignedBy,
        assignedAt: new Date().toISOString(),
        allRoles: Array.isArray(allRoles) ? allRoles : [allRoles]
      },
      actionUrl: '/pages/user-profile',
      actionLabel: 'View Profile'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating role assigned notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create role assigned notification'
    }
  }
}

export const createRoleRemovedNotification = async (userId, roleData) => {
  try {
    console.log('[Notification Helper] Creating role removed notification for userId:', userId, 'roleData:', roleData)
    const roleName = roleData.roleName || roleData.role || 'a role'
    const removedBy = roleData.removedBy || roleData.removedByEmail || 'Admin'
    const remainingRoles = roleData.remainingRoles || []

    const notificationData = {
      userId: userId,
      type: 'ROLE_REMOVED',
      title: `Role Removed: "${roleName}"`,
      message: `Now u are removed from the "${roleName}" role.`,
      relatedEntity: {
        entityType: 'role',
        entityId: roleName
      },
      metadata: {
        roleName,
        removedBy,
        removedAt: new Date().toISOString(),
        remainingRoles: Array.isArray(remainingRoles) ? remainingRoles : [remainingRoles]
      },
      actionUrl: '/pages/user-profile',
      actionLabel: 'View Profile'
    }

    console.log('[Notification Helper] Notification data prepared:', notificationData)
    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] Role removed notification created:', result)
    return result
  } catch (error) {
    console.error('[Notification Helper] Error creating role removed notification:', error)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create role removed notification'
    }
  }
}

export const createProfileCompletionNotification = async (userId, profileData) => {
  try {
    const completionPercentage = profileData.completionPercentage || 0
    const missingFields = profileData.missingFields || []
    const totalFields = profileData.totalFields || 0
    const filledFields = profileData.filledFields || 0

    // For scheduled reminders (from scheduler), we don't check thresholds
    // We send notification if completion < 90% and 24 hours have passed
    // For manual triggers (from profile update), we still check thresholds
    const isScheduledReminder = profileData.isScheduledReminder !== false // Default to true if not specified
    const thresholds = [50, 75, 90]
    const shouldNotify = isScheduledReminder || thresholds.includes(completionPercentage)

    if (!shouldNotify) {
      return {
        status: 'success',
        result: null,
        message: 'Now ur profile is not 100% complete. Please fill in more details to unlock features.'
      }
    }

    // Create personalized message with missing fields
    let message = `Now ur profile is ${completionPercentage}% complete.`

    if (Array.isArray(missingFields) && missingFields.length > 0) {
      const fieldsToShow = missingFields.slice(0, 10) // Show max 10 fields
      const fieldsList = fieldsToShow.join(', ')
      const moreFieldsCount = missingFields.length > 10 ? ` and ${missingFields.length - 10} more` : ''
      message += ` Please fill in: ${fieldsList}${moreFieldsCount}.`
    } else {
      message += ' Please fill more details to unlock features.'
    }

    const profileImage = profileData.image || profileData.profileImage || null

    const notificationData = {
      userId: userId,
      type: 'PROFILE_COMPLETION_REMINDER',
      title: 'Complete Your Profile',
      message: message,
      relatedEntity: {
        entityType: 'profile',
        entityId: profileData.profileId || userId
      },
      metadata: {
        completionPercentage,
        missingFields: Array.isArray(missingFields) ? missingFields : [missingFields],
        totalFields,
        filledFields,
        isScheduledReminder: isScheduledReminder,
        avatarImage: profileImage
      },
      actionUrl: '/pages/user-profile',
      actionLabel: 'Complete Profile'
    }

    return await NotificationService.addOne(notificationData)
  } catch (error) {
    console.error('Error creating profile completion notification:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create profile completion notification'
    }
  }
}

export const createQuizPendingApprovalNotification = async (adminUserIds, quizData) => {
  try {
    console.log('[Notification Helper] Creating quiz pending approval notifications for admins:', adminUserIds)
    if (!Array.isArray(adminUserIds) || adminUserIds.length === 0) {
      console.warn('[Notification Helper] No admin user IDs provided')
      return {
        status: 'error',
        result: null,
        message: 'Admin user IDs array is required and must not be empty'
      }
    }

    const quizId = quizData._id?.toString() || quizData.id || quizData._id
    const quizTitle = quizData.title || 'A Quiz'
    const createdBy = quizData.createdBy || quizData.owner || 'User'
    const quizThumbnail = quizData.thumbnail || quizData.quiz?.thumbnail || null

    console.log('[Notification Helper] Quiz data:', { quizId, quizTitle, createdBy })

    const notificationsData = adminUserIds.map(adminUserId => ({
      userId: adminUserId,
      type: 'QUIZ_PENDING_APPROVAL',
      title: `Quiz on "${quizTitle}" waiting for Approval`,
      message: `Now ur quiz "${quizTitle}" is waiting for approval by ${createdBy}. Please review and approve or reject it.`,
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        createdBy,
        submittedAt: new Date().toISOString(),
        avatarImage: quizThumbnail
      },
      actionUrl: `/management/user-quizzes/list`,
      actionLabel: 'Review Quiz'
    }))

    console.log('[Notification Helper] Notification data prepared:', notificationsData.length, 'notifications')
    const result = await NotificationService.addMany(notificationsData)
    console.log('[Notification Helper] Notification creation result:', result)
    return result
  } catch (error) {
    console.error('[Notification Helper] Error creating quiz pending approval notifications:', error)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create quiz pending approval notifications'
    }
  }
}

export const createQuizPublishedNotification = async (userIds, quizData) => {
  console.log('[Notification Helper] ===== createQuizPublishedNotification START =====')
  console.log('[Notification Helper] Input:', {
    userIds,
    userIdsCount: userIds?.length,
    quizData
  })

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.log('[Notification Helper] ❌ Invalid input: userIds is not an array or is empty')
      return {
        status: 'error',
        result: null,
        message: 'User IDs array is required and must not be empty'
      }
    }

    const quizId = quizData._id?.toString() || quizData.id || quizData._id
    const quizTitle = quizData.title || 'New Quiz'
    const syllabus = quizData.syllabus || quizData.details || ''
    const publishedBy = quizData.publishedBy || quizData.approvedBy || quizData.createdBy || 'Admin'
    const quizThumbnail = quizData.thumbnail || quizData.quiz?.thumbnail || null

    // Truncate syllabus if too long (max 150 characters for notification message)
    const syllabusPreview = syllabus.length > 150 ? syllabus.substring(0, 150) + '...' : syllabus
    const message = syllabusPreview
      ? `A new quiz "${quizTitle}" is now available. ${syllabusPreview}`
      : `A new quiz "${quizTitle}" is now available. Check it out now!`

    console.log('[Notification Helper] Prepared data:', {
      quizId,
      quizTitle,
      syllabus: syllabusPreview,
      publishedBy,
      notificationCount: userIds.length
    })

    const notificationsData = userIds.map(userId => ({
      userId: userId,
      type: 'QUIZ_PUBLISHED',
      title: `Quiz on "${quizTitle}" is published`,
      message: message,
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        syllabus: syllabus,
        publishedBy,
        publishedAt: new Date().toISOString(),
        avatarImage: quizThumbnail
      },
      actionUrl: `/publicquiz/view`,
      actionLabel: 'View Quiz'
    }))

    console.log(
      '[Notification Helper] Calling NotificationService.addMany with',
      notificationsData.length,
      'notifications'
    )
    const result = await NotificationService.addMany(notificationsData)
    console.log('[Notification Helper] ✅ NotificationService.addMany result:', result)
    console.log('[Notification Helper] ===== createQuizPublishedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createQuizPublishedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    console.error('[Notification Helper] Full error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create quiz published notifications'
    }
  }
}

export const createGameAccessRemovedNotification = async (userIds, gameData) => {
  console.log('[Notification Helper] ===== createGameAccessRemovedNotification START =====')
  console.log('[Notification Helper] Input:', {
    userIds,
    userIdsCount: userIds?.length,
    gameData
  })

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.log('[Notification Helper] ⚠️ No users to notify (empty array)')
      return {
        status: 'success',
        result: null,
        message: 'No users to notify'
      }
    }

    const gameId = gameData._id?.toString() || gameData.id || gameData._id
    const gameTitle = gameData.title || gameData.quiz?.title || 'Game'
    const updatedBy = gameData.updatedBy || gameData.updaterEmail || 'Admin'
    const gameThumbnail = gameData.thumbnailPoster || gameData.thumbnail || gameData.quiz?.thumbnail || null

    console.log('[Notification Helper] Prepared data:', {
      gameId,
      gameTitle,
      updatedBy,
      notificationCount: userIds.length
    })

    const groupName = gameData.groupName || 'the group'
    const message = gameData.groupName
      ? `You no longer have access to the game "${gameTitle}" because you were removed from the group "${groupName}".`
      : `You no longer have access to the game "${gameTitle}". The game has been updated and is no longer available to your group.`

    const notificationsData = userIds.map(userId => ({
      userId: userId,
      type: 'GAME_ACCESS_REMOVED',
      title: `U are removed from the "${gameTitle}" game`,
      message: message,
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        groupName,
        updatedBy,
        removedAt: new Date().toISOString(),
        avatarImage: gameThumbnail
      },
      actionUrl: `/public-games`,
      actionLabel: 'View Games'
    }))

    console.log(
      '[Notification Helper] Calling NotificationService.addMany with',
      notificationsData.length,
      'notifications'
    )
    const result = await NotificationService.addMany(notificationsData)
    console.log('[Notification Helper] ✅ NotificationService.addMany result:', result)
    console.log('[Notification Helper] ===== createGameAccessRemovedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGameAccessRemovedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    console.error('[Notification Helper] Full error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game access removed notifications'
    }
  }
}

export const createGameDeletedNotification = async (userIds, gameData) => {
  console.log('[Notification Helper] ===== createGameDeletedNotification START =====')
  console.log('[Notification Helper] Input:', {
    userIds,
    userIdsCount: userIds?.length,
    gameData
  })

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.log('[Notification Helper] ⚠️ No users to notify (empty array)')
      return {
        status: 'success',
        result: null,
        message: 'No users to notify'
      }
    }

    const gameId = gameData._id?.toString() || gameData.id || gameData._id
    const gameTitle = gameData.title || gameData.quiz?.title || 'Game'
    const deletedBy = gameData.deletedBy || gameData.deleterEmail || 'Admin'
    const gameThumbnail = gameData.thumbnailPoster || gameData.thumbnail || gameData.quiz?.thumbnail || null

    console.log('[Notification Helper] Prepared data:', {
      gameId,
      gameTitle,
      deletedBy,
      notificationCount: userIds.length
    })

    const notificationsData = userIds.map(userId => ({
      userId: userId,
      type: 'GAME_DELETED',
      title: `Game Deleted: "${gameTitle}"`,
      message: `The game "${gameTitle}" has been deleted. You are no longer able to access this game.`,
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        deletedBy,
        deletedAt: new Date().toISOString(),
        avatarImage: gameThumbnail
      },
      actionUrl: `/public-games`,
      actionLabel: 'View Games'
    }))

    console.log(
      '[Notification Helper] Calling NotificationService.addMany with',
      notificationsData.length,
      'notifications'
    )
    const result = await NotificationService.addMany(notificationsData)
    console.log('[Notification Helper] ✅ NotificationService.addMany result:', result)
    console.log('[Notification Helper] ===== createGameDeletedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGameDeletedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    console.error('[Notification Helper] Full error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game deleted notifications'
    }
  }
}

export const createGroupRequestReceivedNotification = async (adminUserId, requestData) => {
  try {
    console.log('[Notification Helper] ===== createGroupRequestReceivedNotification START =====')
    console.log('[Notification Helper] Input:', {
      adminUserId,
      adminUserIdType: typeof adminUserId,
      requestData
    })

    // Ensure adminUserId is valid
    if (!adminUserId) {
      console.error('[Notification Helper] ❌ adminUserId is missing or invalid')
      return {
        status: 'error',
        result: null,
        message: 'Admin user ID is required'
      }
    }

    // Ensure userId is valid - mongoose can handle both ObjectId and valid ObjectId string
    // Keep as-is if it's already an ObjectId, otherwise ensure it's a valid ObjectId string
    let adminUserIdValid = adminUserId
    if (typeof adminUserId === 'string' && !mongoose.Types.ObjectId.isValid(adminUserId)) {
      console.error('[Notification Helper] ❌ adminUserId is not a valid ObjectId string')
      return {
        status: 'error',
        result: null,
        message: 'Invalid admin user ID format'
      }
    }

    const groupId = requestData.groupId?.toString() || requestData.groupId
    const groupName = requestData.groupName || 'a group'
    const requesterEmail = requestData.userEmail || requestData.requesterEmail || 'a user'
    const requesterName = requestData.requesterName || requestData.userName || requesterEmail.split('@')[0]
    const requestId = requestData._id?.toString() || requestData.id || requestData.requestId
    const requestedAt = requestData.createdAt || requestData.requestedAt || new Date()

    console.log('[Notification Helper] Prepared data:', {
      adminUserId: adminUserIdValid,
      adminUserIdType: typeof adminUserIdValid,
      groupId,
      groupName,
      requesterEmail,
      requesterName,
      requestId
    })

    const notificationData = {
      userId: adminUserIdValid,
      type: 'GROUP_REQUEST_RECEIVED',
      title: `New Join Request: "${groupName}"`,
      message: `${requesterName} (${requesterEmail}) wants to join the group "${groupName}".`,
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        requesterEmail,
        requesterName,
        requestId,
        requestedAt: requestedAt instanceof Date ? requestedAt.toISOString() : requestedAt
      },
      actionUrl: `/mygroups/${groupId}/requests`,
      actionLabel: 'Review Request'
    }

    console.log('[Notification Helper] Notification data prepared:', {
      userId: notificationData.userId,
      userIdType: typeof notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message
    })

    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] ✅ NotificationService.addOne result:', result)
    console.log('[Notification Helper] ===== createGroupRequestReceivedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGroupRequestReceivedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    console.error('[Notification Helper] Full error:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group request received notification'
    }
  }
}

export const createGroupRequestApprovedNotification = async (userId, requestData) => {
  try {
    console.log('[Notification Helper] ===== createGroupRequestApprovedNotification START =====')
    console.log('[Notification Helper] Input:', {
      userId,
      userIdType: typeof userId,
      requestData
    })

    // Validate userId
    if (!userId) {
      console.error('[Notification Helper] ❌ userId is missing or invalid')
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('[Notification Helper] ❌ userId is not a valid ObjectId string')
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const groupId = requestData.groupId?.toString() || requestData.groupId
    const groupName = requestData.groupName || 'a group'
    const approvedBy = requestData.approvedBy || requestData.approvedEmail || 'Admin'
    const approvedAt = requestData.approvedAt || new Date()

    console.log('[Notification Helper] Prepared data:', {
      userId,
      groupId,
      groupName,
      approvedBy
    })

    const notificationData = {
      userId: userId,
      type: 'GROUP_REQUEST_APPROVED',
      title: `Request Approved: "${groupName}"`,
      message: `Your request to join "${groupName}" has been approved!`,
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        approvedBy,
        approvedAt: approvedAt instanceof Date ? approvedAt.toISOString() : approvedAt
      },
      actionUrl: `/mygroups/${groupId}`,
      actionLabel: 'View Group'
    }

    console.log('[Notification Helper] Notification data prepared:', notificationData)
    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] ✅ NotificationService.addOne result:', result)
    console.log('[Notification Helper] ===== createGroupRequestApprovedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGroupRequestApprovedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group request approved notification'
    }
  }
}

export const createGroupRequestRejectedNotification = async (userId, requestData) => {
  try {
    console.log('[Notification Helper] ===== createGroupRequestRejectedNotification START =====')
    console.log('[Notification Helper] Input:', {
      userId,
      userIdType: typeof userId,
      requestData
    })

    // Validate userId
    if (!userId) {
      console.error('[Notification Helper] ❌ userId is missing or invalid')
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('[Notification Helper] ❌ userId is not a valid ObjectId string')
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const groupId = requestData.groupId?.toString() || requestData.groupId
    const groupName = requestData.groupName || 'a group'
    const rejectedBy = requestData.rejectedBy || requestData.rejectedEmail || 'Admin'
    const rejectedReason = requestData.rejectedReason || requestData.rejectionReason || null
    const rejectedAt = requestData.rejectedAt || new Date()

    console.log('[Notification Helper] Prepared data:', {
      userId,
      groupId,
      groupName,
      rejectedBy,
      hasRejectionReason: !!rejectedReason
    })

    // Build message with optional rejection reason
    let message = `Your request to join "${groupName}" was rejected.`
    if (rejectedReason && rejectedReason.trim()) {
      message += ` Reason: ${rejectedReason.trim()}`
    }

    const notificationData = {
      userId: userId,
      type: 'GROUP_REQUEST_REJECTED',
      title: `Request Rejected: "${groupName}"`,
      message: message,
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        rejectedBy,
        rejectedAt: rejectedAt instanceof Date ? rejectedAt.toISOString() : rejectedAt,
        rejectedReason: rejectedReason || null
      },
      actionUrl: `/mygroups`,
      actionLabel: 'View Groups'
    }

    console.log('[Notification Helper] Notification data prepared:', notificationData)
    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] ✅ NotificationService.addOne result:', result)
    console.log('[Notification Helper] ===== createGroupRequestRejectedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGroupRequestRejectedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create group request rejected notification'
    }
  }
}

export const createGameRegisteredNotification = async (userId, gameData) => {
  try {
    console.log('[Notification Helper] ===== createGameRegisteredNotification START =====')
    console.log('[Notification Helper] Input:', {
      userId,
      gameData
    })

    // Validate userId
    if (!userId) {
      console.error('[Notification Helper] ❌ userId is missing or invalid')
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('[Notification Helper] ❌ userId is not a valid ObjectId string')
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const gameId = gameData._id?.toString() || gameData.id || gameData._id
    const gameTitle = gameData.title || gameData.quiz?.title || 'Game'
    const startTime = gameData.startTime ? new Date(gameData.startTime) : null
    const gameThumbnail = gameData.thumbnailPoster || gameData.thumbnail || gameData.quiz?.thumbnail || null
    const registrationDeadline = gameData.registrationEndTime || gameData.registrationDeadline || null

    console.log('[Notification Helper] Prepared data:', {
      userId,
      gameId,
      gameTitle,
      startTime,
      hasThumbnail: !!gameThumbnail
    })

    // Format start time for display if available
    let formattedStartTime = null
    if (startTime) {
      formattedStartTime = startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const message = startTime
      ? `You've successfully registered for the game "${gameTitle}". The game starts on ${formattedStartTime}. Get ready to play!`
      : `You've successfully registered for the game "${gameTitle}". Get ready to play!`

    const notificationData = {
      userId: userId,
      type: 'GAME_REGISTERED',
      title: `Registered for Game: "${gameTitle}"`,
      message: message,
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        startTime: startTime ? startTime.toISOString() : null,
        formattedStartTime,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        registeredAt: new Date().toISOString(),
        avatarImage: gameThumbnail
      },
      actionUrl: `/public-games/${gameId}/play`,
      actionLabel: 'View Game'
    }

    console.log('[Notification Helper] Notification data prepared:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title
    })

    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] ✅ NotificationService.addOne result:', result)
    console.log('[Notification Helper] ===== createGameRegisteredNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGameRegisteredNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game registered notification'
    }
  }
}

export const createGameCompletedNotification = async (userId, gameData) => {
  try {
    console.log('[Notification Helper] ===== createGameCompletedNotification START =====')
    console.log('[Notification Helper] Input:', {
      userId,
      gameData
    })

    // Validate userId
    if (!userId) {
      console.error('[Notification Helper] ❌ userId is missing or invalid')
      return {
        status: 'error',
        result: null,
        message: 'User ID is required'
      }
    }

    if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('[Notification Helper] ❌ userId is not a valid ObjectId string')
      return {
        status: 'error',
        result: null,
        message: 'Invalid user ID format'
      }
    }

    const gameId = gameData._id?.toString() || gameData.id || gameData._id
    const gameTitle = gameData.title || gameData.quiz?.title || 'Game'
    const gameThumbnail = gameData.thumbnailPoster || gameData.thumbnail || gameData.quiz?.thumbnail || null

    console.log('[Notification Helper] Prepared data:', {
      userId,
      gameId,
      gameTitle,
      hasThumbnail: !!gameThumbnail
    })

    const notificationData = {
      userId: userId,
      type: 'GAME_COMPLETED',
      title: `Game Completed: "${gameTitle}"`,
      message: `Congratulations! You've successfully completed the game "${gameTitle}". Check your results and see how you performed!`,
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        completedAt: new Date().toISOString(),
        avatarImage: gameThumbnail
      },
      actionUrl: `/public-games/${gameId}/play`,
      actionLabel: 'View Results'
    }

    console.log('[Notification Helper] Notification data prepared:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title
    })

    const result = await NotificationService.addOne(notificationData)
    console.log('[Notification Helper] ✅ NotificationService.addOne result:', result)
    console.log('[Notification Helper] ===== createGameCompletedNotification END =====')
    return result
  } catch (error) {
    console.error('[Notification Helper] ❌❌❌ ERROR in createGameCompletedNotification ❌❌❌')
    console.error('[Notification Helper] Error message:', error.message)
    console.error('[Notification Helper] Error stack:', error.stack)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game completed notification'
    }
  }
}
