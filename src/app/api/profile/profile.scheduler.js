import cron from 'node-cron'
import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from './profile.model'
import User from '../../models/user.model'
import Notification from '../notifications/notification.model'
import { calculateProfileCompletion } from '@/utils/profileUtils'
import * as NotificationService from '../notifications/notification.service.js'
import mongoose from 'mongoose'

// Helper function to get all fields that should be checked for a profile
function getAllProfileFields(profile) {
  const baseFields = [
    'email',
    'firstname',
    'lastname',
    'gender',
    'age',
    'activeAssociatedOrganizationIds',
    'currentWorkingPositionId',
    'linkedInUrl',
    'facebookUrl',
    'instagramUrl',
    'phone',
    'knownLanguageIds',
    'motherTongue',
    'religion',
    'caste',
    'category',
    'country',
    'region',
    'zipcode',
    'locality',
    'timezone',
    'street',
    'colony',
    'village',
    'accountType'
  ]

  // Add conditional fields based on accountType
  if (profile?.accountType === 'INDIVIDUAL') {
    baseFields.push('nickname', 'openToWork', 'currentSchoolId')
  } else if (profile?.accountType === 'BUSINESS' || profile?.accountType === 'NGO') {
    baseFields.push(
      'organization',
      'websiteUrl',
      'roleInOrganization',
      'organizationRegistrationNumber',
      'organizationGSTNumber',
      'organizationPANNumber',
      'hiring'
    )
  }

  return baseFields
}

// Helper function to get human-readable field names
function getFieldDisplayName(field) {
  const fieldNames = {
    email: 'Email',
    firstname: 'First Name',
    lastname: 'Last Name',
    gender: 'Gender',
    age: 'Age',
    activeAssociatedOrganizationIds: 'Organization',
    currentWorkingPositionId: 'Current Position',
    linkedInUrl: 'LinkedIn URL',
    facebookUrl: 'Facebook URL',
    instagramUrl: 'Instagram URL',
    phone: 'Phone Number',
    knownLanguageIds: 'Languages',
    motherTongue: 'Mother Tongue',
    religion: 'Religion',
    caste: 'Caste',
    category: 'Category',
    country: 'Country',
    region: 'Region',
    zipcode: 'Zipcode',
    locality: 'Locality',
    timezone: 'Timezone',
    street: 'Street',
    colony: 'Colony',
    village: 'Village',
    accountType: 'Account Type',
    nickname: 'Nickname',
    openToWork: 'Open to Work',
    currentSchoolId: 'Current School',
    organization: 'Organization Name',
    websiteUrl: 'Website URL',
    roleInOrganization: 'Role in Organization',
    organizationRegistrationNumber: 'Registration Number',
    organizationGSTNumber: 'GST Number',
    organizationPANNumber: 'PAN Number',
    hiring: 'Hiring Status'
  }
  return fieldNames[field] || field
}

// Helper function to identify missing fields
function getMissingFields(profile) {
  const allFields = getAllProfileFields(profile)
  const missingFields = []

  for (const field of allFields) {
    const value = profile[field]
    let isEmpty = false

    if (value === null || value === undefined || value === '') {
      isEmpty = true
    } else if (Array.isArray(value) && value.length === 0) {
      isEmpty = true
    } else if (typeof value === 'object' && Object.keys(value).length === 0) {
      isEmpty = true
    }

    if (isEmpty) {
      missingFields.push(getFieldDisplayName(field))
    }
  }

  return missingFields
}

// Main function to check and send profile completion reminders (OPTIMAL BATCH APPROACH)
async function checkAndSendProfileReminders() {
  try {
    console.log('[Profile Scheduler] ===== checkAndSendProfileReminders START =====')
    await connectMongo()

    // Get all active and verified users
    const activeUsers = await User.find({
      isActive: true,
      isVerified: true
    })
      .select('_id email')
      .lean()

    console.log(`[Profile Scheduler] Found ${activeUsers.length} active and verified users`)

    if (activeUsers.length === 0) {
      console.log('[Profile Scheduler] ⏭️ No active users found')
      return
    }

    // Calculate today's date range once
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0) // Start of today (00:00:00)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999) // End of today (23:59:59)

    // Step 1: Get all user profiles and calculate completion (batch)
    const userProfiles = []
    const userIds = []

    for (const user of activeUsers) {
      try {
        const profile = await UserProfile.findOne({ email: user.email }).lean()
        if (!profile) continue

        const completionPercentage = calculateProfileCompletion(profile)

        // Only include users with profiles less than 90% complete
        if (completionPercentage < 90) {
          userProfiles.push({
            userId: user._id,
            email: user.email,
            profile,
            completionPercentage
          })
          userIds.push(user._id.toString())
        }
      } catch (userError) {
        console.error(`[Profile Scheduler] Error processing user ${user.email}:`, userError)
      }
    }

    console.log(`[Profile Scheduler] Found ${userProfiles.length} users with incomplete profiles (< 90%)`)

    if (userProfiles.length === 0) {
      console.log('[Profile Scheduler] ⏭️ No users with incomplete profiles')
      return
    }

    // Step 2: ✅ BATCH CHECK - Check for existing notifications for ALL users at once
    const existingNotifications = await Notification.find({
      type: 'PROFILE_COMPLETION_REMINDER',
      userId: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) },
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    })
      .select('userId')
      .lean()

    const existingUserIds = new Set(existingNotifications.map(n => n.userId?.toString()).filter(Boolean))

    if (existingNotifications.length > 0) {
      console.log(
        `[Profile Scheduler] ⚠️ Found ${existingNotifications.length} existing PROFILE_COMPLETION_REMINDER notification(s) for today`
      )
    }

    // Step 3: Filter out users who already have notifications today
    const usersToNotify = userProfiles.filter(
      userProfile => !existingUserIds.has(userProfile.userId.toString())
    )

    console.log(
      `[Profile Scheduler] 📧 Total incomplete users: ${userProfiles.length}, Already notified today: ${existingUserIds.size}, To notify: ${usersToNotify.length}`
    )

    if (usersToNotify.length === 0) {
      console.log('[Profile Scheduler] ⏭️ All users already have PROFILE_COMPLETION_REMINDER notification for today, skipping')
      return
    }

    // Step 4: Delete old notifications (older than today) for users we're about to notify
    try {
      const deleteResult = await Notification.deleteMany({
        userId: { $in: usersToNotify.map(u => u.userId) },
        type: 'PROFILE_COMPLETION_REMINDER',
        createdAt: {
          $lt: todayStart // Only delete notifications older than today
        }
      })
      if (deleteResult.deletedCount > 0) {
        console.log(`[Profile Scheduler] 🗑️ Deleted ${deleteResult.deletedCount} old notification(s)`)
      }
    } catch (deleteError) {
      console.error('[Profile Scheduler] Error deleting previous notifications:', deleteError)
      // Continue even if deletion fails
    }

    // Step 5: ✅ BATCH CREATE - Prepare all notification data
    const notificationsData = usersToNotify.map(userProfile => {
      const { userId, profile, completionPercentage } = userProfile
      const missingFields = getMissingFields(profile)
      const allFields = getAllProfileFields(profile)
      const filledFields = allFields.length - missingFields.length

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

      return {
        userId: userId,
        type: 'PROFILE_COMPLETION_REMINDER',
        title: 'Complete Your Profile',
        message: message,
        relatedEntity: {
          entityType: 'profile',
          entityId: profile._id || userId
        },
        metadata: {
          completionPercentage,
          missingFields: Array.isArray(missingFields) ? missingFields : [missingFields],
          totalFields: allFields.length,
          filledFields,
          isScheduledReminder: true,
          avatarImage: profile.image || null
        },
        actionUrl: '/pages/user-profile',
        actionLabel: 'Complete Profile'
      }
    })

    // Step 6: ✅ BATCH INSERT - Create all notifications at once
    console.log(
      `[Profile Scheduler] Calling NotificationService.addMany with ${notificationsData.length} profile completion notifications`
    )
    const result = await NotificationService.addMany(notificationsData)

    if (result.status === 'success') {
      console.log(
        `[Profile Scheduler] ✅ Successfully created ${notificationsData.length} profile completion reminder notification(s)`
      )
      console.log(
        `[Profile Scheduler] Check complete - Sent: ${notificationsData.length}, Already notified: ${existingUserIds.size}, Complete profiles: ${activeUsers.length - userProfiles.length}, Total: ${activeUsers.length}`
      )
    } else {
      console.error('[Profile Scheduler] ❌ Failed to create notifications:', result.message)
    }

    console.log('[Profile Scheduler] ===== checkAndSendProfileReminders END =====')
  } catch (error) {
    console.error('[Profile Scheduler] ERROR in profile completion reminder check:', error.message)
    console.error('[Profile Scheduler] Error stack:', error.stack)
  }
}

// ✅ Track if scheduler is already initialized to prevent duplicate initialization
let isSchedulerInitialized = false

// Initialize the profile completion reminder scheduler
export async function initializeProfileScheduler() {
  // ✅ Prevent duplicate initialization (important in Next.js where layout can run multiple times)
  if (isSchedulerInitialized) {
    console.log('[Profile Scheduler] ⚠️ Scheduler already initialized, skipping duplicate initialization')
    return
  }

  console.log('[Profile Scheduler] Initializing profile completion reminder scheduler...')

  // Schedule to run at 9:00 AM - only once per day
  const task = cron.schedule(
    '0 9 * * *', // Every day at 9:00 AM
    async () => {
      console.log('[Profile Scheduler] ⏰ Scheduled task triggered at 9:00 AM')
      await checkAndSendProfileReminders()
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
      runOnInit: false // Don't run immediately, wait for first scheduled time
    }
  )

  isSchedulerInitialized = true
  console.log('[Profile Scheduler] ✅ Initialized - Daily at 9:00 AM (Asia/Kolkata)')
}

// Export the check function for manual testing if needed
export { checkAndSendProfileReminders }
