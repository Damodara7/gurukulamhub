import * as GroupChatService from '../group-chat.service.js'
import * as GroupService from '../../group/group.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import Group from '../../group/group.model.js'
import User from '@/app/models/user.model.js'
import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'

// Mark message as read
export async function POST(request) {
  try {
    await connectMongo()
    
    const session = await auth()
    if (!session?.user?.email) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Unauthorized')
      )
    }

    const reqBody = await request.json()
    const { action, messageId, groupId, memberEmail, isAnnouncementOnly } = reqBody

    if (action === 'markAsRead') {
      if (!messageId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Message ID is required')
        )
      }

      const result = await GroupChatService.markMessageAsRead(messageId, session.user.email)
      
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      } else {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse(result.message)
        )
      }
    }

    if (action === 'markAllAsRead') {
      if (!groupId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID is required')
        )
      }

      const result = await GroupChatService.markAllMessagesAsRead(groupId, session.user.email)
      
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      } else {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse(result.message)
        )
      }
    }

    if (action === 'removeMember') {
      if (!groupId || !memberEmail) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID and member email are required')
        )
      }
      
      // Verify user is the creator
      const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
      if (!group) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group not found')
        )
      }

      if (group.creatorEmail !== session.user.email) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Only the group creator can remove members')
        )
      }

      if (memberEmail === group.creatorEmail) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Cannot remove the group creator')
        )
      }

      // Find the user to remove
      const userToRemove = await User.findOne({ email: memberEmail }).lean()
      if (!userToRemove) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('User not found')
        )
      }

      // Get user's profile for name
      let userName = memberEmail.split('@')[0]
      if (userToRemove.profile) {
        const UserProfile = mongoose.model('userprofiles')
        const userProfile = await UserProfile.findById(userToRemove.profile).lean()
        if (userProfile) {
          userName = `${userProfile.firstname || ''} ${userProfile.lastname || ''}`.trim() || userName
        }
      }

      // Get admin's profile for name
      const adminUser = await User.findOne({ email: session.user.email }).lean()
      let adminName = session.user.email.split('@')[0]
      if (adminUser?.profile) {
        const UserProfile = mongoose.model('userprofiles')
        const adminProfile = await UserProfile.findById(adminUser.profile).lean()
        if (adminProfile) {
          adminName = `${adminProfile.firstname || ''} ${adminProfile.lastname || ''}`.trim() || adminName
        }
      }

      // Remove member from group
      const updatedGroupDoc = await Group.findByIdAndUpdate(
        groupId,
        {
          $pull: { members: userToRemove._id },
          $inc: { membersCount: -1 }
        },
        { new: true }
      )
        .populate({
          path: 'members',
          populate: { path: 'profile' }
        })
      
      const updatedGroup = updatedGroupDoc ? updatedGroupDoc.toObject() : null

      // Remove group from user's groupIds
      await User.updateOne({ _id: userToRemove._id }, { $pull: { groupIds: groupId } })

      // Create system message
      await GroupChatService.createSystemMessage(
        groupId,
        `${userName} was removed by ${adminName}`,
        session.user.email
      )

      // Broadcast group update
      try {
        const { broadcastGroupsListUpdates } = await import('../../group/group.service.js')
        const { broadcastGroupDetails } = await import('../../ws/groups/[groupId]/publishers')
        broadcastGroupsListUpdates()
        broadcastGroupDetails(groupId, updatedGroup)
      } catch (wsError) {
        console.error('Error broadcasting group update:', wsError)
      }

      return ApiResponseUtils.sendSuccessResponse(
        ApiResponseUtils.createSuccessResponse('Member removed successfully', updatedGroup)
      )
    }

    if (action === 'updateSettings') {
      if (!groupId || isAnnouncementOnly === undefined) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID and isAnnouncementOnly are required')
        )
      }

      // Verify user is the creator
      const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
      if (!group) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group not found')
        )
      }

      if (group.creatorEmail !== session.user.email) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Only the group creator can update settings')
        )
      }

      // Update group
      const updatedGroupDoc = await Group.findByIdAndUpdate(
        groupId,
        { isAnnouncementOnly },
        { new: true }
      )
        .populate({
          path: 'members',
          populate: { path: 'profile' }
        })
      
      const updatedGroup = updatedGroupDoc ? updatedGroupDoc.toObject() : null

      // Create system message
      const settingText = isAnnouncementOnly
        ? 'Group settings changed: Only admins can send messages'
        : 'Group settings changed: All members can send messages'
      
      await GroupChatService.createSystemMessage(
        groupId,
        settingText,
        session.user.email
      )

      // Broadcast group update
      try {
        const { broadcastGroupsListUpdates } = await import('../../group/group.service.js')
        const { broadcastGroupDetails } = await import('../../ws/groups/[groupId]/publishers')
        broadcastGroupsListUpdates()
        broadcastGroupDetails(groupId, updatedGroup)
      } catch (wsError) {
        console.error('Error broadcasting group update:', wsError)
      }

      return ApiResponseUtils.sendSuccessResponse(
        ApiResponseUtils.createSuccessResponse('Settings updated successfully', updatedGroup)
      )
    }

    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse('Invalid action')
    )
  } catch (error) {
    console.error('Error in group chat actions:', error)
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    )
  }
}

