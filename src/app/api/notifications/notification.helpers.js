import * as NotificationService from './notification.service.js'

export const createQuizApprovedNotification = async (userId, quizData) => {
  try {
    const quizId = quizData._id?.toString() || quizData.id || quizData._id
    const quizTitle = quizData.title || 'Your Quiz'
    const approvedBy = quizData.approvedBy || 'Admin'

    const notificationData = {
      userId: userId,
      type: 'QUIZ_APPROVED',
      title: 'Quiz Approved',
      message: `Your quiz "${quizTitle}" has been approved by ${approvedBy}.`,
      priority: 'high',
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        approvedBy,
        approvedAt: new Date().toISOString()
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

    const notificationData = {
      userId: userId,
      type: 'QUIZ_REJECTED',
      title: 'Quiz Rejected',
      message: `Your quiz "${quizTitle}" has been rejected.${remarks.length > 0 ? ' Please review the remarks.' : ''}`,
      priority: 'high',
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        rejectedBy,
        remarks: Array.isArray(remarks) ? remarks : [remarks],
        rejectedAt: new Date().toISOString()
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
      title: 'New Game Available',
      message: message,
      priority: 'high',
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
        maxParticipants
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
      title: 'Welcome to Group',
      message: `You have been added to the group "${groupName}".`,
      priority: 'medium',
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

    const notificationData = {
      userId: userId,
      type: 'GROUP_REMOVED',
      title: 'Removed from Group',
      message: `You have been removed from the group "${groupName}".`,
      priority: 'high',
      relatedEntity: {
        entityType: 'group',
        entityId: groupId
      },
      metadata: {
        groupName,
        groupId,
        removedBy,
        removedAt: new Date().toISOString()
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
      title: 'New Role Assigned',
      message: `You have been assigned the role "${roleName}".`,
      priority: 'high',
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
      title: 'Role Removed',
      message: `The role "${roleName}" has been removed from your account.`,
      priority: 'high',
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
        message: 'Profile completion percentage does not meet notification threshold'
      }
    }

    // Create personalized message with missing fields
    let message = `Your profile is ${completionPercentage}% complete.`

    if (Array.isArray(missingFields) && missingFields.length > 0) {
      const fieldsToShow = missingFields.slice(0, 10) // Show max 10 fields
      const fieldsList = fieldsToShow.join(', ')
      const moreFieldsCount = missingFields.length > 10 ? ` and ${missingFields.length - 10} more` : ''
      message += ` Please fill in: ${fieldsList}${moreFieldsCount}.`
    } else {
      message += ' Fill in more details to unlock features.'
    }

    const notificationData = {
      userId: userId,
      type: 'PROFILE_COMPLETION_REMINDER',
      title: 'Complete Your Profile',
      message: message,
      priority: 'low',
      relatedEntity: {
        entityType: 'profile',
        entityId: profileData.profileId || userId
      },
      metadata: {
        completionPercentage,
        missingFields: Array.isArray(missingFields) ? missingFields : [missingFields],
        totalFields,
        filledFields,
        isScheduledReminder: isScheduledReminder
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

    console.log('[Notification Helper] Quiz data:', { quizId, quizTitle, createdBy })

    const notificationsData = adminUserIds.map(adminUserId => ({
      userId: adminUserId,
      type: 'QUIZ_PENDING_APPROVAL',
      title: 'Quiz Pending Approval',
      message: `A new quiz "${quizTitle}" has been submitted for approval by ${createdBy}. Please review and approve or reject it.`,
      priority: 'high',
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        createdBy,
        submittedAt: new Date().toISOString()
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
      title: 'New Quiz Published',
      message: message,
      priority: 'high',
      relatedEntity: {
        entityType: 'quiz',
        entityId: quizId
      },
      metadata: {
        quizTitle,
        quizId,
        syllabus: syllabus,
        publishedBy,
        publishedAt: new Date().toISOString()
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
      title: 'Access Removed from Game',
      message: message,
      priority: 'high',
      relatedEntity: {
        entityType: 'game',
        entityId: gameId
      },
      metadata: {
        gameTitle,
        gameId,
        groupName,
        updatedBy,
        removedAt: new Date().toISOString()
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
