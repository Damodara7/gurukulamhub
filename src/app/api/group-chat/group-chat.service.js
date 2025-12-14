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
      // Include all messages, including deletedForEveryone (we'll show them with banned icon in UI)
    }

    // If 'before' timestamp is provided, fetch messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await GroupChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    // Filter out messages deleted for this user (but keep messages deleted for everyone)
    const filteredMessages = messages.filter(msg => {
      if (!userEmail) return true
      // Don't filter if deleted for everyone (we'll show deleted text in UI)
      if (msg.deletedForEveryone) return true
      // Filter if deleted for this user
      const isDeletedForUser = msg.deletedFor?.some(d => d.userEmail === userEmail)
      return !isDeletedForUser
    })

    // Reverse to get chronological order (oldest first)
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

    // Create message - preserve newlines in content, only trim leading whitespace
    const newMessage = await GroupChatMessage.create({
      groupId: new mongoose.Types.ObjectId(groupId),
      senderEmail,
      message: trimLeadingNewlines(message),
      messageType
    })

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

