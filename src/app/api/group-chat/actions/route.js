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
    const {
      action,
      messageId,
      groupId,
      memberEmail,
      isAnnouncementOnly,
      needApprovalForMessages,
      rejectedReason,
      newMessage: newMessageText
    } = reqBody

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

      const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
      if (!group) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group not found')
        )
      }

      const isCreator = group.creatorEmail === session.user.email
      const isGroupManager = group.groupType === 'classroom' && group.groupManagerEmail === session.user.email

      if (!isCreator && !isGroupManager) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Only the group creator or group manager can remove members')
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

      // Classroom: group manager can only remove members they added
      if (group.groupType === 'classroom' && isGroupManager && !isCreator) {
        const memberAddedBy = group.memberAddedBy || {}
        const addedByMap = memberAddedBy instanceof Map ? Object.fromEntries(memberAddedBy) : memberAddedBy
        const addedBy = addedByMap[userToRemove._id.toString()]
        if (addedBy !== session.user.email) {
          return ApiResponseUtils.sendErrorResponse(
            ApiResponseUtils.createErrorResponse('You can only remove members you added')
          )
        }
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

      const updatePayload = {
        $pull: { members: userToRemove._id },
        $inc: { membersCount: -1 }
      }
      if (group.groupType === 'classroom' && group.memberAddedBy) {
        updatePayload.$unset = { [`memberAddedBy.${userToRemove._id.toString()}`]: 1 }
      }

      const updatedGroupDoc = await Group.findByIdAndUpdate(
        groupId,
        updatePayload,
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
      if (!groupId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID is required')
        )
      }

      const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
      if (!group) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group not found')
        )
      }

      const isCreator = group.creatorEmail === session.user.email
      const isGroupManager = group.groupType === 'classroom' && group.groupManagerEmail === session.user.email

      if (!isCreator && !isGroupManager) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Only the group creator or group manager can update settings')
        )
      }

      const updatePayload = {}
      if (isCreator && isAnnouncementOnly !== undefined) updatePayload.isAnnouncementOnly = isAnnouncementOnly
      if (group.groupType === 'classroom' && needApprovalForMessages !== undefined) {
        updatePayload.needApprovalForMessages = needApprovalForMessages
      }
      if (Object.keys(updatePayload).length === 0) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('No settings to update')
        )
      }

      const updatedGroupDoc = await Group.findByIdAndUpdate(
        groupId,
        updatePayload,
        { new: true }
      )
        .populate({
          path: 'members',
          populate: { path: 'profile' }
        })
      
      const updatedGroup = updatedGroupDoc ? updatedGroupDoc.toObject() : null

      // Create system message
      let settingText = 'Group settings updated'
      if (updatePayload.isAnnouncementOnly !== undefined) {
        settingText = updatePayload.isAnnouncementOnly
          ? 'Group settings changed: Only admins can send messages'
          : 'Group settings changed: All members can send messages'
      } else if (updatePayload.needApprovalForMessages !== undefined) {
        settingText = updatePayload.needApprovalForMessages
          ? 'Message approval is now required (manager must approve messages)'
          : 'Message approval is now disabled'
      }

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

    if (action === 'clearChat') {
      if (!groupId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID is required')
        )
      }

      const result = await GroupChatService.clearGroupChat(groupId, session.user.email)
      
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

    if (action === 'exitGroup') {
      if (!groupId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID is required')
        )
      }

      const result = await GroupService.exitGroup(groupId, session.user.email)
      
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

    if (action === 'getPendingMessages') {
      if (!groupId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Group ID is required')
        )
      }
      const result = await GroupChatService.getPendingMessagesForGroup(groupId, session.user.email)
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      }
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(result.message)
      )
    }

    if (action === 'approveMessage') {
      if (!messageId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Message ID is required')
        )
      }
      const result = await GroupChatService.approveMessage(messageId, session.user.email)
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      }
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(result.message)
      )
    }

    if (action === 'rejectMessage') {
      if (!messageId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Message ID is required')
        )
      }
      const result = await GroupChatService.rejectMessage(
        messageId,
        session.user.email,
        rejectedReason || ''
      )
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      }
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(result.message)
      )
    }

    if (action === 'editMessageByManager') {
      if (!messageId || newMessageText === undefined) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Message ID and new message are required')
        )
      }
      const result = await GroupChatService.editMessageByManager(
        messageId,
        newMessageText,
        session.user.email
      )
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(
          ApiResponseUtils.createSuccessResponse(result.message, result.result)
        )
      }
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(result.message)
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

