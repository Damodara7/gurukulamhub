import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import GroupChatMessage from './group-chat.model.js'
import Group from '../group/group.model.js'
import { broadcastGroupChatMessage } from '../ws/groups/[groupId]/chat/publishers'

// Helper function to trim only leading newlines and whitespace, but preserve newlines in content
const trimLeadingNewlines = (text) => {
  // Remove leading newlines and whitespace, but preserve newlines in the content
  return text.replace(/^[\n\r\s]+/, '').trimEnd()
}

export const getMessagesByGroupId = async (groupId, options = {}) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const { limit = 50, skip = 0, before, userEmail } = options

    let query = {
      groupId: new mongoose.Types.ObjectId(groupId)
    }

    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await GroupChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    let filteredMessages = messages.filter(msg => {
      if (!userEmail) return true
      const isDeletedForUser = msg.deletedFor?.some(d => d.userEmail === userEmail)
      if (isDeletedForUser) return false
      return true
    })

    // Classroom message approval: filter by approval status and viewer role
    const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
    if (group?.groupType === 'classroom' && group.needApprovalForMessages && userEmail) {
      const isCreator = group.creatorEmail === userEmail
      const isManager = group.groupManagerEmail === userEmail
      filteredMessages = filteredMessages.filter(msg => {
        const status = msg.approvalStatus || null
        if (status === 'pending') {
          return msg.senderEmail === userEmail || isManager || isCreator
        }
        if (status === 'rejected') {
          return msg.senderEmail === userEmail || isManager || isCreator
        }
        return true
      })
    }

    const reversedMessages = filteredMessages.reverse()

    return {
      status: 'success',
      result: reversedMessages,
      message: `Found ${reversedMessages.length} messages`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve messages'
    }
  }
}

export const addMessage = async (messageData) => {
  await connectMongo()
  try {
    const { groupId, senderEmail, message, messageType = 'text' } = messageData

    // Validate required fields
    if (!groupId || !senderEmail || !message) {
      return {
        status: 'error',
        result: null,
        message: 'Missing required fields: groupId, senderEmail, and message are required'
      }
    }

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    // Check if group exists and populate members
    const group = await Group.findOne({ _id: groupId, isDeleted: false })
      .populate({
        path: 'members',
        select: 'email',
        populate: {
          path: 'profile',
          select: 'firstname lastname'
        }
      })
      .lean()
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    // Check if user can send messages
    const canSend = await canUserSendMessage(group, senderEmail)
    if (!canSend.allowed) {
      return {
        status: 'error',
        result: null,
        message: canSend.reason || 'You are not allowed to send messages in this group'
      }
    }

    const isCreator = group.creatorEmail === senderEmail
    const isManager = group.groupType === 'classroom' && group.groupManagerEmail === senderEmail
    const needApproval =
      group.groupType === 'classroom' &&
      group.needApprovalForMessages &&
      !isCreator &&
      !isManager

    const createPayload = {
      groupId: new mongoose.Types.ObjectId(groupId),
      senderEmail,
      message: trimLeadingNewlines(message),
      messageType
    }
    if (needApproval) {
      createPayload.approvalStatus = 'pending'
    }

    const newMessage = await GroupChatMessage.create(createPayload)

    const savedMessage = await GroupChatMessage.findById(newMessage._id).lean()

    // Broadcast to all connected clients
    broadcastGroupChatMessage(groupId, savedMessage)

    return {
      status: 'success',
      result: savedMessage,
      message: 'Message sent successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to send message'
    }
  }
}

export const deleteMessage = async (messageId, userEmail, deleteForEveryone = false) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid message ID format'
      }
    }

    const message = await GroupChatMessage.findById(messageId).lean()
    if (!message) {
      return {
        status: 'error',
        result: null,
        message: 'Message not found'
      }
    }

    // Check if already deleted for everyone
    if (message.deletedForEveryone && deleteForEveryone) {
      return {
        status: 'error',
        result: null,
        message: 'Message already deleted for everyone'
      }
    }

    // Get groupId - handle both ObjectId and string formats
    if (!message.groupId) {
      return {
        status: 'error',
        result: null,
        message: 'Message missing group ID'
      }
    }

    // Convert groupId to ObjectId for query - handle both ObjectId instances and strings
    let groupIdForQuery
    try {
      if (message.groupId instanceof mongoose.Types.ObjectId) {
        groupIdForQuery = message.groupId
      } else if (mongoose.Types.ObjectId.isValid(message.groupId)) {
        groupIdForQuery = new mongoose.Types.ObjectId(message.groupId)
      } else {
        return {
          status: 'error',
          result: null,
          message: 'Invalid group ID format in message'
        }
      }
    } catch (idError) {
      return {
        status: 'error',
        result: null,
        message: `Error processing group ID: ${idError.message}`
      }
    }

    const group = await Group.findOne({ _id: groupIdForQuery, isDeleted: false }).lean()
    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    const isSender = message.senderEmail === userEmail
    const isCreator = group.creatorEmail === userEmail

    if (deleteForEveryone) {
      // Only sender can delete for everyone (within time limit, typically 1 hour)
      if (!isSender) {
        return {
          status: 'error',
          result: null,
          message: 'Only the message sender can delete for everyone'
        }
      }

      // Check time limit (1 hour)
      const messageAge = Date.now() - new Date(message.createdAt).getTime()
      const oneHour = 60 * 60 * 1000
      if (messageAge > oneHour) {
        return {
          status: 'error',
          result: null,
          message: 'Cannot delete for everyone after 1 hour'
        }
      }

      // Delete for everyone
      const updatedMessage = await GroupChatMessage.findByIdAndUpdate(
        messageId,
        {
          deletedForEveryone: true,
          deletedAt: new Date(),
          deletedBy: userEmail,
          message: 'This message was deleted' // Replace message text
        },
        { new: true }
      ).lean()

      // Broadcast deletion to all
      try {
        const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
        if (broadcastMessageUpdate && updatedMessage) {
          // Convert groupId to string for WebSocket - use the validated groupIdForQuery
          const groupIdString = groupIdForQuery.toString()
          broadcastMessageUpdate(groupIdString, updatedMessage)
        }
      } catch (wsError) {
        console.error('Error broadcasting message update:', wsError)
        // Don't fail the deletion if WebSocket broadcast fails
      }

      return {
        status: 'success',
        result: updatedMessage,
        message: 'Message deleted for everyone'
      }
    } else {
      // Delete for me only
      // Check if already deleted for this user
      const alreadyDeleted = message.deletedFor?.some(d => d.userEmail === userEmail)
      if (alreadyDeleted) {
        return {
          status: 'error',
          result: null,
          message: 'Message already deleted for you'
        }
      }

      // Add to deletedFor array
      const updatedMessage = await GroupChatMessage.findByIdAndUpdate(
        messageId,
        {
          $addToSet: {
            deletedFor: {
              userEmail,
              deletedAt: new Date()
            }
          }
        },
        { new: true }
      ).lean()

      // Broadcast update to all clients
      try {
        const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
        if (broadcastMessageUpdate && updatedMessage) {
          // Convert groupId to string for WebSocket - use the validated groupIdForQuery
          const groupIdString = groupIdForQuery.toString()
          broadcastMessageUpdate(groupIdString, updatedMessage)
        }
      } catch (wsError) {
        console.error('Error broadcasting message update:', wsError)
        // Don't fail the deletion if WebSocket broadcast fails
      }

      return {
        status: 'success',
        result: updatedMessage,
        message: 'Message deleted for you'
      }
    }
  } catch (error) {
    console.error('Error in deleteMessage:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete message'
    }
  }
}

export const editMessage = async (messageId, newMessage, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid message ID format'
      }
    }

    const message = await GroupChatMessage.findById(messageId).lean()
    if (!message || message.isDeleted) {
      return {
        status: 'error',
        result: null,
        message: 'Message not found'
      }
    }

    // Only sender can edit
    if (message.senderEmail !== userEmail) {
      return {
        status: 'error',
        result: null,
        message: 'You are not authorized to edit this message'
      }
    }

    // Check time limit (1 hour)
    const messageAge = Date.now() - new Date(message.createdAt).getTime()
    const oneHour = 60 * 60 * 1000
    if (messageAge > oneHour) {
      return {
        status: 'error',
        result: null,
        message: 'Cannot edit message after 1 hour'
      }
    }

    // Convert groupId to ObjectId for query
    let groupIdForQuery
    try {
      if (message.groupId instanceof mongoose.Types.ObjectId) {
        groupIdForQuery = message.groupId
      } else if (mongoose.Types.ObjectId.isValid(message.groupId)) {
        groupIdForQuery = new mongoose.Types.ObjectId(message.groupId)
      } else {
        return {
          status: 'error',
          result: null,
          message: 'Invalid group ID in message'
        }
      }
    } catch (idError) {
      return {
        status: 'error',
        result: null,
        message: `Error processing group ID: ${idError.message}`
      }
    }

    const updatedMessage = await GroupChatMessage.findByIdAndUpdate(
      messageId,
      {
        message: trimLeadingNewlines(newMessage),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).lean()

    // Broadcast update using messageUpdate type (not newMessage)
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate && updatedMessage) {
        const groupIdString = groupIdForQuery.toString()
        broadcastMessageUpdate(groupIdString, updatedMessage)
      }
    } catch (wsError) {
      console.error('Error broadcasting message update:', wsError)
      // Don't fail the edit if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: updatedMessage,
      message: 'Message updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update message'
    }
  }
}

// Helper function to check if user can send messages
export const canUserSendMessage = async (group, userEmail) => {
  // Creator can always send messages (even if not in members list)
  if (group.creatorEmail === userEmail) {
    return { allowed: true, reason: null }
  }

  // Check if announcement mode is enabled
  if (group.isAnnouncementOnly) {
    return {
      allowed: false,
      reason: 'Only the group creator can send messages in announcement mode'
    }
  }

  // Check if user is a member of the group
  // Members should be populated with email field
  let memberEmails = []
  
  if (group.members && Array.isArray(group.members)) {
    memberEmails = group.members
      .map(member => {
        // Handle populated member objects
        if (typeof member === 'object' && member.email) {
          return member.email
        }
        return null
      })
      .filter(Boolean)
  }

  const isMember = memberEmails.includes(userEmail)

  if (!isMember) {
    return {
      allowed: false,
      reason: 'You must be a member of this group to send messages'
    }
  }

  return { allowed: true, reason: null }
}

// Helper function to check if user can receive/view messages
export const canUserViewMessages = async (group, userEmail) => {
  // Creator can always view messages
  if (group.creatorEmail === userEmail) {
    return { allowed: true, reason: null }
  }

  // Check if user is a member
  // Members should be populated with email field
  let memberEmails = []
  
  if (group.members && Array.isArray(group.members)) {
    memberEmails = group.members
      .map(member => {
        // Handle populated member objects
        if (typeof member === 'object' && member.email) {
          return member.email
        }
        return null
      })
      .filter(Boolean)
  }

  const isMember = memberEmails.includes(userEmail)

  if (!isMember) {
    return {
      allowed: false,
      reason: 'You must be a member of this group to view messages'
    }
  }

  return { allowed: true, reason: null }
}

// Mark message as read
export const markMessageAsRead = async (messageId, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid message ID format'
      }
    }

    const message = await GroupChatMessage.findById(messageId)
    if (!message || message.isDeleted) {
      return {
        status: 'error',
        result: null,
        message: 'Message not found'
      }
    }

    // Don't allow sender to mark their own message as read
    if (message.senderEmail === userEmail) {
      return {
        status: 'success',
        result: message.toObject(),
        message: 'Sender cannot mark their own message as read'
      }
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.some(reader => reader.userEmail === userEmail)
    if (!alreadyRead) {
      message.readBy.push({
        userEmail,
        readAt: new Date()
      })
      await message.save()
    }

    const updatedMessage = await GroupChatMessage.findById(messageId).lean()

    // Broadcast update using messageUpdate type for real-time read receipt updates
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate && updatedMessage) {
        // Convert groupId to string
        let groupIdString
        if (message.groupId instanceof mongoose.Types.ObjectId) {
          groupIdString = message.groupId.toString()
        } else if (typeof message.groupId === 'string') {
          groupIdString = message.groupId
        } else {
          groupIdString = String(message.groupId)
        }
        broadcastMessageUpdate(groupIdString, updatedMessage)
      }
    } catch (wsError) {
      console.error('Error broadcasting read receipt update:', wsError)
      // Don't fail the read marking if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: updatedMessage,
      message: 'Message marked as read'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to mark message as read'
    }
  }
}

// Mark all messages in a group as read for a user
export const markAllMessagesAsRead = async (groupId, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    // Get all unread messages for this user (excluding messages sent by the user)
    const unreadMessages = await GroupChatMessage.find({
      groupId: new mongoose.Types.ObjectId(groupId),
      isDeleted: false,
      senderEmail: { $ne: userEmail }, // Exclude messages sent by the user
      'readBy.userEmail': { $ne: userEmail }
    })

    // Mark each as read
    const updatePromises = unreadMessages.map(message => {
      message.readBy.push({
        userEmail,
        readAt: new Date()
      })
      return message.save()
    })

    await Promise.all(updatePromises)

    // Broadcast updates for all marked messages
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate) {
        const groupIdString = mongoose.Types.ObjectId.isValid(groupId)
          ? new mongoose.Types.ObjectId(groupId).toString()
          : String(groupId)
        
        // Fetch updated messages and broadcast each one
        const updatedMessages = await GroupChatMessage.find({
          _id: { $in: unreadMessages.map(m => m._id) }
        }).lean()
        
        for (const updatedMessage of updatedMessages) {
          broadcastMessageUpdate(groupIdString, updatedMessage)
        }
      }
    } catch (wsError) {
      console.error('Error broadcasting read receipt updates:', wsError)
      // Don't fail if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: { count: unreadMessages.length },
      message: `Marked ${unreadMessages.length} messages as read`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to mark messages as read'
    }
  }
}

// Create a system message
export const createSystemMessage = async (groupId, systemMessage, adminEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const newMessage = await GroupChatMessage.create({
      groupId: new mongoose.Types.ObjectId(groupId),
      senderEmail: adminEmail,
      message: systemMessage,
      messageType: 'system'
    })

    const savedMessage = await GroupChatMessage.findById(newMessage._id).lean()

    // Broadcast to all connected clients
    broadcastGroupChatMessage(groupId, savedMessage)

    return {
      status: 'success',
      result: savedMessage,
      message: 'System message created successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create system message'
    }
  }
}

// --- Classroom message approval: approve / reject / edit by manager ---
export const approveMessage = async (messageId, managerEmail) => {
  await connectMongo()
  try {
    const message = await GroupChatMessage.findById(messageId).lean()
    if (!message || message.approvalStatus !== 'pending') {
      return { status: 'error', result: null, message: 'Message not found or not pending' }
    }
    const group = await Group.findOne({ _id: message.groupId, isDeleted: false }).lean()
    if (!group || group.groupType !== 'classroom' || group.groupManagerEmail !== managerEmail) {
      return { status: 'error', result: null, message: 'Only the group manager can approve messages' }
    }
    const updated = await GroupChatMessage.findByIdAndUpdate(
      messageId,
      { approvalStatus: 'approved', approvedAt: new Date(), approvedBy: managerEmail },
      { new: true }
    ).lean()
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate) {
        broadcastMessageUpdate(message.groupId.toString(), updated)
      }
    } catch (e) {}
    return { status: 'success', result: updated, message: 'Message approved' }
  } catch (error) {
    return { status: 'error', result: null, message: error.message || 'Failed to approve message' }
  }
}

export const rejectMessage = async (messageId, managerEmail, rejectedReason) => {
  await connectMongo()
  try {
    const message = await GroupChatMessage.findById(messageId).lean()
    if (!message || message.approvalStatus !== 'pending') {
      return { status: 'error', result: null, message: 'Message not found or not pending' }
    }
    const group = await Group.findOne({ _id: message.groupId, isDeleted: false }).lean()
    if (!group || group.groupType !== 'classroom' || group.groupManagerEmail !== managerEmail) {
      return { status: 'error', result: null, message: 'Only the group manager can reject messages' }
    }
    const updated = await GroupChatMessage.findByIdAndUpdate(
      messageId,
      {
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: managerEmail,
        rejectedReason: rejectedReason || ''
      },
      { new: true }
    ).lean()
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate) {
        broadcastMessageUpdate(message.groupId.toString(), updated)
      }
    } catch (e) {}
    return { status: 'success', result: updated, message: 'Message rejected' }
  } catch (error) {
    return { status: 'error', result: null, message: error.message || 'Failed to reject message' }
  }
}

export const editMessageByManager = async (messageId, newMessageText, managerEmail) => {
  await connectMongo()
  try {
    const message = await GroupChatMessage.findById(messageId).lean()
    if (!message) {
      return { status: 'error', result: null, message: 'Message not found' }
    }
    const group = await Group.findOne({ _id: message.groupId, isDeleted: false }).lean()
    if (!group || group.groupType !== 'classroom' || group.groupManagerEmail !== managerEmail) {
      return { status: 'error', result: null, message: 'Only the group manager can edit messages for approval' }
    }
    const originalMessage = message.approvalStatus === 'pending' ? message.message : message.originalMessage || message.message
    const updated = await GroupChatMessage.findByIdAndUpdate(
      messageId,
      {
        message: trimLeadingNewlines(newMessageText),
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: managerEmail,
        editedByManager: true,
        originalMessage: originalMessage,
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).lean()
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate) {
        broadcastMessageUpdate(message.groupId.toString(), updated)
      }
    } catch (e) {}
    return { status: 'success', result: updated, message: 'Message edited and approved' }
  } catch (error) {
    return { status: 'error', result: null, message: error.message || 'Failed to edit message' }
  }
}

export const getPendingMessagesForGroup = async (groupId, managerEmail) => {
  await connectMongo()
  try {
    const group = await Group.findOne({ _id: groupId, isDeleted: false }).lean()
    if (!group || group.groupType !== 'classroom' || group.groupManagerEmail !== managerEmail) {
      return { status: 'error', result: null, message: 'Only the group manager can list pending messages' }
    }
    const messages = await GroupChatMessage.find({
      groupId: new mongoose.Types.ObjectId(groupId),
      approvalStatus: 'pending',
      deletedForEveryone: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .lean()
    return { status: 'success', result: messages, message: `Found ${messages.length} pending messages` }
  } catch (error) {
    return { status: 'error', result: null, message: error.message || 'Failed to get pending messages' }
  }
}

// Clear group chat - delete all messages for a user (mark as deleted for user)
export const clearGroupChat = async (groupId, userEmail) => {
  await connectMongo()
  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid group ID format'
      }
    }

    const groupIdForQuery = new mongoose.Types.ObjectId(groupId)

    // Verify user is a member or creator
    const group = await Group.findOne({ _id: groupIdForQuery, isDeleted: false })
      .populate('members', 'email')
      .lean()

    if (!group) {
      return {
        status: 'error',
        result: null,
        message: 'Group not found'
      }
    }

    const isCreator = group.creatorEmail === userEmail
    const isMember = group.members?.some(m => {
      const memberEmail = typeof m === 'object' && m.email ? m.email : m
      return memberEmail === userEmail
    })

    if (!isCreator && !isMember) {
      return {
        status: 'error',
        result: null,
        message: 'You are not a member of this group'
      }
    }

    // Get all messages in this group that are not already deleted for this user
    const messages = await GroupChatMessage.find({
      groupId: groupIdForQuery,
      isDeleted: false,
      'deletedFor.userEmail': { $ne: userEmail }
    })

    // Mark all messages as deleted for this user
    const updatePromises = messages.map(message => {
      const alreadyDeleted = message.deletedFor?.some(d => d.userEmail === userEmail)
      if (!alreadyDeleted) {
        message.deletedFor.push({
          userEmail,
          deletedAt: new Date()
        })
        return message.save()
      }
      return Promise.resolve()
    })

    await Promise.all(updatePromises)

    // Broadcast updates
    try {
      const { broadcastMessageUpdate } = await import('../ws/groups/[groupId]/chat/publishers')
      if (broadcastMessageUpdate) {
        const updatedMessages = await GroupChatMessage.find({
          groupId: groupIdForQuery,
          _id: { $in: messages.map(m => m._id) }
        }).lean()

        for (const updatedMessage of updatedMessages) {
          broadcastMessageUpdate(groupId, updatedMessage)
        }
      }
    } catch (wsError) {
      console.error('Error broadcasting clear chat updates:', wsError)
    }

    return {
      status: 'success',
      result: { count: messages.length },
      message: `Cleared ${messages.length} messages`
    }
  } catch (error) {
    console.error('Error in clearGroupChat:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to clear group chat'
    }
  }
}

