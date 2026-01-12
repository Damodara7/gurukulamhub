import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import GroupRequest from './group-request.model.js'
import Group from '../group/group.model.js'
import User from '@/app/models/user.model.js'
import { broadcastGroupRequests } from '../ws/group-requests/[groupId]/publishers.js'
import { broadcastToUser } from '../ws/users/[userEmail]/publishers.js'
import { broadcastGroupsListUpdates } from '../group/group.service.js'
import {
  createGroupRequestReceivedNotification,
  createGroupRequestApprovedNotification,
  createGroupRequestRejectedNotification
} from '../notifications/notification.helpers.js'

export const createRequest = async requestData => {
  await connectMongo()
  try {
    // Validate required fields
    const requiredFields = ['groupId', 'userEmail']
    const missingFields = requiredFields.filter(field => !requestData[field])

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(requestData.groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    // Check if group exists
    const group = await Group.findOne({ _id: requestData.groupId, isDeleted: false })
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Check if user exists by email
    const user = await User.findOne({ email: requestData.userEmail })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    // Check if user is already a member of the group
    const isMember = group.members?.some(member => member.toString() === user._id.toString())
    if (isMember) {
      return {
        status: 'error',
        result: null,
        message: 'User is already a member of this group'
      }
    }

    // Check if there's already a pending request
    const existingRequest = await GroupRequest.findOne({
      groupId: requestData.groupId,
      userEmail: requestData.userEmail,
      status: 'pending'
    })

    if (existingRequest) {
      return {
        status: 'error',
        result: null,
        message: 'A pending request already exists for this user and group'
      }
    }

    // Create new request
    const newRequest = new GroupRequest(requestData)
    const savedRequest = await newRequest.save()

    // Send notification to group admin about the new request
    try {
      console.log('[Group Request Service] ===== GROUP REQUEST NOTIFICATION START =====')
      console.log('[Group Request Service] Group creator email:', group.creatorEmail)

      // Find admin user by creatorEmail
      const adminUser = await User.findOne({ email: group.creatorEmail })
      console.log('[Group Request Service] Admin user found:', adminUser ? 'Yes' : 'No')

      if (adminUser) {
        console.log('[Group Request Service] Admin user ID:', adminUser._id)

        // Get user profile for requester name
        let requesterName = requestData.userEmail.split('@')[0] // Default fallback
        try {
          if (user.profile) {
            const UserProfile = mongoose.model('userprofiles')
            const requesterProfile = await UserProfile.findById(user.profile).lean()
            if (requesterProfile) {
              const fullName = `${requesterProfile.firstname || ''} ${requesterProfile.lastname || ''}`.trim()
              if (fullName) {
                requesterName = fullName
              }
            }
          }
        } catch (profileError) {
          console.error('[Group Request Service] Error fetching requester profile:', profileError)
          // Continue with default name
        }

        console.log('[Group Request Service] Requester name:', requesterName)
        console.log('[Group Request Service] Calling createGroupRequestReceivedNotification...')
        console.log('[Group Request Service] Admin user ID (ObjectId):', adminUser._id)
        console.log('[Group Request Service] Admin user ID (String):', adminUser._id.toString())

        const notificationResult = await createGroupRequestReceivedNotification(adminUser._id, {
          groupId: group._id,
          groupName: group.groupName,
          userEmail: requestData.userEmail,
          requesterEmail: requestData.userEmail,
          requesterName: requesterName,
          _id: savedRequest._id,
          id: savedRequest._id,
          requestId: savedRequest._id,
          createdAt: savedRequest.createdAt,
          requestedAt: savedRequest.createdAt
        })

        console.log('[Group Request Service] Notification result:', notificationResult)

        if (notificationResult?.status === 'success') {
          console.log('[Group Request Service] ✅ Sent GROUP_REQUEST_RECEIVED notification to admin successfully')
        } else {
          console.error('[Group Request Service] ❌ Failed to send notification:', notificationResult?.message)
        }
      } else {
        console.log('[Group Request Service] ⚠️ Admin user not found for email:', group.creatorEmail)
      }
      console.log('[Group Request Service] ===== GROUP REQUEST NOTIFICATION COMPLETE =====')
    } catch (notificationError) {
      console.error('[Group Request Service] ❌❌❌ ERROR sending group request received notification ❌❌❌')
      console.error('[Group Request Service] Error message:', notificationError.message)
      console.error('[Group Request Service] Error stack:', notificationError.stack)
      // Don't fail the request creation if notification fails
    }

    // Broadcast WebSocket event for group request sent
    try {
      broadcastGroupRequests(requestData.groupId, {
        type: 'requestSent',
        ...savedRequest.toObject(),
        groupId: requestData.groupId,
        userEmail: requestData.userEmail
      })
    } catch (wsError) {
      console.error('Error broadcasting group request sent event:', wsError)
    }

    return {
      status: 'success',
      result: savedRequest.toObject(),
      message: 'Join request created successfully'
    }
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      return {
        status: 'error',
        result: null,
        message: 'A request already exists for this user and group'
      }
    }

    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create join request'
    }
  }
}

export const getRequestsByGroup = async (groupId, status = null) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const filter = { groupId }
    if (status) {
      filter.status = status
    }

    const requests = await GroupRequest.find(filter)
      .populate('approvedBy', 'email profile')
      .populate('rejectedBy', 'email profile')
      .sort({ createdAt: -1 })
      .lean()

    // Get user details for each request
    const requestsWithUserDetails = await Promise.all(
      requests.map(async request => {
        try {
          // Find user by email and populate profile
          const user = await User.findOne({ email: request.userEmail }).populate('profile').lean()

          return {
            ...request,
            userDetails: user
              ? {
                  _id: user._id,
                  email: user.email,
                  memberId: user.memberId,
                  profile: user.profile
                }
              : null
          }
        } catch (error) {
          console.error('Error fetching user details for request:', error)
          return {
            ...request,
            userDetails: null
          }
        }
      })
    )

    return {
      status: 'success',
      result: requestsWithUserDetails,
      message: `Found ${requestsWithUserDetails.length} requests`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch requests'
    }
  }
}

export const getRequestsByUser = async userEmail => {
  await connectMongo()
  try {
    if (!userEmail || typeof userEmail !== 'string') {
      return {
        status: 'error',
        result: null,
        message: 'Valid user email is required'
      }
    }

    const requests = await GroupRequest.find({ userEmail })
      .populate('groupId', 'groupName description status')
      .populate('approvedBy', 'email profile')
      .populate('rejectedBy', 'email profile')
      .sort({ createdAt: -1 })
      .lean()

    return {
      status: 'success',
      result: requests,
      message: `Found ${requests.length} requests`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch user requests'
    }
  }
}

export const approveRequest = async (requestId, adminEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid request ID format'
      }
    }

    // Find admin user by email
    const adminUser = await User.findOne({ email: adminEmail })
    if (!adminUser) {
      return {
        status: 'error',
        result: null,
        message: 'Admin user not found'
      }
    }

    const adminUserId = adminUser._id

    // Find the request
    const request = await GroupRequest.findOne({ _id: requestId, status: 'pending' })
    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'Pending request not found'
      }
    }

    // Check if admin is the creator of the group
    const group = await Group.findOne({ _id: request.groupId, isDeleted: false })
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    if (group.creatorEmail !== adminEmail) {
      return {
        status: 'error',
        result: null,
        message: 'Only group admins can approve requests'
      }
    }

    // Update request status
    request.status = 'approved'
    request.approvedAt = new Date()
    request.approvedBy = adminUserId
    request.approvedEmail = adminEmail

    await request.save()

    // Find user by email and add to group members
    const user = await User.findOne({ email: request.userEmail })
    if (user) {
      // Add user to group members
      if (!group.members.includes(user._id)) {
        group.members.push(user._id)
        group.membersCount = group.members.length
        await group.save()
      }

      // Add group to user's groupIds using $addToSet to prevent duplicates
      await User.updateOne({ _id: user._id }, { $addToSet: { groupIds: request.groupId } })

      // Send notification to user about approval
      try {
        console.log('[Group Request Service] ===== GROUP REQUEST APPROVED NOTIFICATION START =====')
        await createGroupRequestApprovedNotification(user._id, {
          groupId: group._id,
          groupName: group.groupName,
          approvedBy: adminEmail,
          approvedEmail: adminEmail,
          approvedAt: request.approvedAt
        })
        console.log('[Group Request Service] ✅ Sent GROUP_REQUEST_APPROVED notification to user')
        console.log('[Group Request Service] ===== GROUP REQUEST APPROVED NOTIFICATION COMPLETE =====')
      } catch (notificationError) {
        console.error('[Group Request Service] Error sending group request approved notification:', notificationError)
        // Don't fail the approval if notification fails
      }
    }

    // Broadcast WebSocket event for group request approved
    try {
      const requestData = {
        type: 'requestApproved',
        ...request.toObject(),
        groupId: request.groupId,
        userEmail: request.userEmail
      }
      // Broadcast to admins (group request room)
      broadcastGroupRequests(request.groupId, requestData)
      // Broadcast to the specific user
      broadcastToUser(request.userEmail, {
        type: 'groupRequestApproved',
        requestData: requestData
      })
      // Broadcast groups list update to trigger user-side group/channel re-evaluation
      broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group request approved event:', wsError)
    }

    return {
      status: 'success',
      result: request.toObject(),
      message: 'Request approved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to approve request'
    }
  }
}

export const rejectRequest = async (requestId, adminEmail, rejectionReason) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid request ID format'
      }
    }

    // Find admin user by email
    const adminUser = await User.findOne({ email: adminEmail })
    if (!adminUser) {
      return {
        status: 'error',
        result: null,
        message: 'Admin user not found'
      }
    }

    const adminUserId = adminUser._id

    if (!rejectionReason || rejectionReason.trim() === '') {
      return {
        status: 'error',
        result: null,
        message: 'Rejection reason is required'
      }
    }

    // Find the request
    const request = await GroupRequest.findOne({ _id: requestId, status: 'pending' })
    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'Pending request not found'
      }
    }

    // Check if admin is the creator of the group
    const group = await Group.findOne({ _id: request.groupId, isDeleted: false })
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    if (group.creatorEmail !== adminEmail) {
      return {
        status: 'error',
        result: null,
        message: 'Only group admins can reject requests'
      }
    }

    // Update request status
    request.status = 'rejected'
    request.rejectedAt = new Date()
    request.rejectedBy = adminUserId
    request.rejectedEmail = adminEmail
    request.rejectedReason = rejectionReason.trim()

    await request.save()

    // Clean up user's groupIds if they were previously added
    try {
      const user = await User.findOne({ email: request.userEmail })
      if (user) {
        if (user.groupIds && user.groupIds.includes(request.groupId)) {
          await User.updateOne({ _id: user._id }, { $pull: { groupIds: request.groupId } })
          console.log(`Removed group ${request.groupId} from user ${request.userEmail} after rejection`)
        }

        // Send notification to user about rejection
        try {
          console.log('[Group Request Service] ===== GROUP REQUEST REJECTED NOTIFICATION START =====')
          await createGroupRequestRejectedNotification(user._id, {
            groupId: group._id,
            groupName: group.groupName,
            rejectedBy: adminEmail,
            rejectedEmail: adminEmail,
            rejectedReason: request.rejectedReason,
            rejectionReason: request.rejectedReason,
            rejectedAt: request.rejectedAt
          })
          console.log('[Group Request Service] ✅ Sent GROUP_REQUEST_REJECTED notification to user')
          console.log('[Group Request Service] ===== GROUP REQUEST REJECTED NOTIFICATION COMPLETE =====')
        } catch (notificationError) {
          console.error('[Group Request Service] Error sending group request rejected notification:', notificationError)
          // Don't fail the rejection if notification fails
        }
      }
    } catch (userUpdateError) {
      console.error('Error removing group from user after rejection:', userUpdateError)
      // Don't fail the rejection if user update fails
    }

    // Broadcast WebSocket event for group request rejected
    try {
      const requestData = {
        type: 'requestRejected',
        ...request.toObject(),
        groupId: request.groupId,
        userEmail: request.userEmail
      }
      // Broadcast to admins (group request room)
      broadcastGroupRequests(request.groupId, requestData)
      // Broadcast to the specific user
      broadcastToUser(request.userEmail, {
        type: 'groupRequestRejected',
        requestData: requestData
      })
      // Broadcast groups list update to trigger user-side group/channel re-evaluation
      broadcastGroupsListUpdates()
    } catch (wsError) {
      console.error('Error broadcasting group request rejected event:', wsError)
    }

    return {
      status: 'success',
      result: request.toObject(),
      message: 'Request rejected successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to reject request'
    }
  }
}

export const cancelRequest = async (requestId, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid request ID format'
      }
    }

    if (!userEmail || typeof userEmail !== 'string') {
      return {
        status: 'error',
        result: null,
        message: 'Valid user email is required'
      }
    }

    // Find the request
    const request = await GroupRequest.findOne({ _id: requestId, userEmail, status: 'pending' })
    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'Pending request not found'
      }
    }

    // Clean up user's groupIds if they were previously added
    try {
      const user = await User.findOne({ email: userEmail })
      if (user && user.groupIds && user.groupIds.includes(request.groupId)) {
        await User.updateOne({ _id: user._id }, { $pull: { groupIds: request.groupId } })
        console.log(`Removed group ${request.groupId} from user ${userEmail} after request cancellation`)
      }
    } catch (userUpdateError) {
      console.error('Error removing group from user after cancellation:', userUpdateError)
      // Don't fail the cancellation if user update fails
    }

    // Delete the request
    await GroupRequest.deleteOne({ _id: requestId })

    return {
      status: 'success',
      result: null,
      message: 'Request cancelled successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to cancel request'
    }
  }
}

export const getRequestById = async requestId => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid request ID format'
      }
    }

    const request = await GroupRequest.findOne({ _id: requestId })
      .populate('groupId', 'groupName description status')
      .populate('approvedBy', 'email profile')
      .populate('rejectedBy', 'email profile')
      .lean()

    if (!request) {
      return {
        status: 'error',
        result: null,
        message: 'Request not found'
      }
    }

    return {
      status: 'success',
      result: request,
      message: 'Request retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch request'
    }
  }
}
