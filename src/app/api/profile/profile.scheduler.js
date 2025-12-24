import cron from 'node-cron'
import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from './profile.model'
import User from '../../models/user.model'
import Notification from '../notifications/notification.model'
import { calculateProfileCompletion } from '@/utils/profileUtils'
import { createProfileCompletionNotification } from '../notifications/notification.helpers.js'

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

// Main function to check and send profile completion reminders
async function checkAndSendProfileReminders() {
  await connectMongo()

  try {
    // Get all active and verified users
    const activeUsers = await User.find({
      isActive: true,
      isVerified: true
    })
      .select('_id email')
      .lean()

    let notificationsSent = 0
    let usersSkipped = 0
    let usersWithCompleteProfile = 0

    for (const user of activeUsers) {
      try {
        // Get user profile
        const profile = await UserProfile.findOne({ email: user.email }).lean()

        if (!profile) {
          usersSkipped++
          continue
        }

        // Calculate profile completion percentage
        const completionPercentage = calculateProfileCompletion(profile)

        // Skip if profile is 90% or more complete
        if (completionPercentage >= 90) {
          usersWithCompleteProfile++
          continue
        }

        // Delete previous profile completion reminder notification for this user
        // This ensures user only sees the latest notification (clean notification list)
        // Old notification is removed before sending new one
        try {
          await Notification.deleteMany({
            userId: user._id,
            type: 'PROFILE_COMPLETION_REMINDER'
          })
        } catch (deleteError) {
          console.error(`[Profile Scheduler] Error deleting previous notifications for ${user.email}:`, deleteError)
          // Continue even if deletion fails
        }

        // Get missing fields
        const missingFields = getMissingFields(profile)
        const allFields = getAllProfileFields(profile)
        const filledFields = allFields.length - missingFields.length

        // Send new notification
        const notificationResult = await createProfileCompletionNotification(user._id, {
          completionPercentage,
          missingFields: missingFields, // Pass all missing fields, helper will limit to 10 in message
          totalFields: allFields.length,
          filledFields,
          profileId: profile._id,
          isScheduledReminder: true // Mark as scheduled reminder to bypass threshold check
        })

        if (notificationResult.status === 'success') {
          notificationsSent++
        } else {
          console.error(`[Profile Scheduler] Failed to send notification to ${user.email}:`, notificationResult.message)
        }
      } catch (userError) {
        console.error(`[Profile Scheduler] Error processing user ${user.email}:`, userError)
      }
    }

    // Only log summary if there's activity
    if (notificationsSent > 0 || usersSkipped > 0) {
      console.log(
        `[Profile Scheduler] Check complete - Sent: ${notificationsSent}, Skipped: ${usersSkipped}, Complete: ${usersWithCompleteProfile}, Total: ${activeUsers.length}`
      )
    }
  } catch (error) {
    console.error('[Profile Scheduler] ERROR in profile completion reminder check:', error.message)
    console.error('[Profile Scheduler] Error stack:', error.stack)
  }
}

// Initialize the profile completion reminder scheduler
export async function initializeProfileScheduler() {
  console.log('[Profile Scheduler] Initializing profile completion reminder scheduler...')

  // Schedule to run at 8 AM (morning)
  cron.schedule(
    '0 8 * * *', // Every day at 8:00 AM
    async () => {
      await checkAndSendProfileReminders()
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
      runOnInit: false // Don't run immediately, wait for first scheduled time
    }
  )

  // Schedule to run at 6 PM (evening)
  cron.schedule(
    '0 18 * * *', // Every day at 6:00 PM (18:00)
    async () => {
      await checkAndSendProfileReminders()
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
      runOnInit: false // Don't run immediately, wait for first scheduled time
    }
  )

  console.log('[Profile Scheduler] Initialized - Daily at 8:00 AM and 6:00 PM (Asia/Kolkata)')
}

// Export the check function for manual testing if needed
export { checkAndSendProfileReminders }
