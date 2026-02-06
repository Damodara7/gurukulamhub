import connectMongo from '@/utils/dbConnect-mongo'
import mongoose from 'mongoose'
import IndividualChatMessage from './individual-chat.model.js'
import DeletedChat from './deleted-chat.model.js'
import User from '@/app/models/user.model'

// Helper function to generate chatId from two emails (sorted to ensure consistency)
const generateChatId = (email1, email2) => {
  const sorted = [email1, email2].sort()
  return `${sorted[0]}_${sorted[1]}`
}

// Helper function to trim only leading newlines and whitespace, but preserve newlines in content
const trimLeadingNewlines = (text) => {
  return text.replace(/^[\n\r\s]+/, '').trimEnd()
}

// Get messages by chatId (for individual chat between two users)
export const getMessagesByChatId = async (chatId, options = {}) => {
  await connectMongo()
  try {
    const { limit = 50, skip = 0, before, userEmail } = options

    let query = {
      chatId
    }

    // If 'before' timestamp is provided, fetch messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await IndividualChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    // Filter out messages deleted for this user
    // If a message is deleted for the user (e.g., via clear chat), hide it even if it was deleted for everyone
    const filteredMessages = messages.filter(msg => {
      if (!userEmail) return true
      // First check if deleted for this user - if yes, always filter out regardless of deletedForEveryone
      const isDeletedForUser = msg.deletedFor?.some(d => d.userEmail === userEmail)
      if (isDeletedForUser) return false
      // If not deleted for user, show it (even if deleted for everyone, we'll show deleted text in UI)
      return true
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

// Add a new message to individual chat
export const addMessage = async (messageData) => {
  await connectMongo()
  try {
    const { senderEmail, receiverEmail, message, messageType = 'text' } = messageData

    // Validate required fields
    if (!senderEmail || !receiverEmail || !message) {
      return {
        status: 'error',
        result: null,
        message: 'Missing required fields: senderEmail, receiverEmail, and message are required'
      }
    }

    // Validate that sender and receiver are different
    if (senderEmail === receiverEmail) {
      return {
        status: 'error',
        result: null,
        message: 'Cannot send message to yourself'
      }
    }

    // Verify both users exist (case-insensitive email lookup)
    const [sender, receiver] = await Promise.all([
      User.findOne({ email: { $regex: new RegExp(`^${senderEmail}$`, 'i') } }).lean(),
      User.findOne({ email: { $regex: new RegExp(`^${receiverEmail}$`, 'i') } }).lean()
    ])
    
    // Fallback to exact match if case-insensitive doesn't work
    const [senderFallback, receiverFallback] = await Promise.all([
      sender || User.findOne({ email: senderEmail }).lean(),
      receiver || User.findOne({ email: receiverEmail }).lean()
    ])

    const finalSender = senderFallback || sender
    const finalReceiver = receiverFallback || receiver

    if (!finalSender) {
      console.error('Sender not found:', senderEmail)
      return {
        status: 'error',
        result: null,
        message: 'Sender not found'
      }
    }

    if (!finalReceiver) {
      console.error('Receiver not found:', receiverEmail)
      return {
        status: 'error',
        result: null,
        message: 'Receiver not found'
      }
    }

    // Generate chatId
    const chatId = generateChatId(senderEmail, receiverEmail)

    // Create message - preserve newlines in content, only trim leading whitespace
    const newMessage = await IndividualChatMessage.create({
      chatId,
      senderEmail,
      receiverEmail,
      message: trimLeadingNewlines(message),
      messageType
    })

    const savedMessage = await IndividualChatMessage.findById(newMessage._id).lean()

    // If this chat was previously deleted for either participant, reactivate it
    // by removing the DeletedChat entry. Old messages stay hidden because
    // deleteChat() already marked them as deletedFor the user, and getMessagesByChatId
    // filters those out.
    try {
      const normalizedSender = senderEmail.toLowerCase().trim()
      const normalizedReceiver = receiverEmail.toLowerCase().trim()

      await DeletedChat.deleteMany({
        chatId,
        userEmail: { $in: [normalizedSender, normalizedReceiver] }
      })
    } catch (cleanupError) {
      console.error('Error clearing DeletedChat entries on new message:', cleanupError)
      // Do not fail message send if cleanup fails
    }

    // Broadcast to both users via WebSocket
    try {
      const { broadcastIndividualChatMessage } = await import('../ws/individual-chat/[chatId]/publishers')
      if (broadcastIndividualChatMessage && savedMessage) {
        broadcastIndividualChatMessage(chatId, savedMessage)
      }
    } catch (wsError) {
      console.error('Error broadcasting individual chat message:', wsError)
      // Don't fail if WebSocket broadcast fails
    }

    return {
      status: 'success',
      result: savedMessage,
      message: 'Message sent successfully'
    }
  } catch (error) {
    console.error('Error in addMessage:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to send message'
    }
  }
}

// Delete a message
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

    const message = await IndividualChatMessage.findById(messageId).lean()
    if (!message || message.isDeleted) {
      return {
        status: 'error',
        result: null,
        message: 'Message not found'
      }
    }

    const isSender = message.senderEmail === userEmail
    const isParticipant = message.senderEmail === userEmail || message.receiverEmail === userEmail

    if (!isParticipant) {
      return {
        status: 'error',
        result: null,
        message: 'You are not authorized to delete this message'
      }
    }

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
      const updatedMessage = await IndividualChatMessage.findByIdAndUpdate(
        messageId,
        {
          deletedForEveryone: true,
          deletedAt: new Date(),
          deletedBy: userEmail,
          message: 'This message was deleted'
        },
        { new: true }
      ).lean()

      // Broadcast deletion
      try {
        const { broadcastMessageUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
        if (broadcastMessageUpdate && updatedMessage) {
          broadcastMessageUpdate(message.chatId, updatedMessage)
        }
      } catch (wsError) {
        console.error('Error broadcasting message update:', wsError)
      }

      return {
        status: 'success',
        result: updatedMessage,
        message: 'Message deleted for everyone'
      }
    } else {
      // Delete for me only
      const alreadyDeleted = message.deletedFor?.some(d => d.userEmail === userEmail)
      if (alreadyDeleted) {
        return {
          status: 'error',
          result: null,
          message: 'Message already deleted for you'
        }
      }

      // Add to deletedFor array
      const updatedMessage = await IndividualChatMessage.findByIdAndUpdate(
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

      // Broadcast update
      try {
        const { broadcastMessageUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
        if (broadcastMessageUpdate && updatedMessage) {
          broadcastMessageUpdate(message.chatId, updatedMessage)
        }
      } catch (wsError) {
        console.error('Error broadcasting message update:', wsError)
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

// Edit a message
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

    const message = await IndividualChatMessage.findById(messageId).lean()
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

    const updatedMessage = await IndividualChatMessage.findByIdAndUpdate(
      messageId,
      {
        message: trimLeadingNewlines(newMessage),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).lean()

    // Broadcast update
    try {
      const { broadcastMessageUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
      if (broadcastMessageUpdate && updatedMessage) {
        broadcastMessageUpdate(message.chatId, updatedMessage)
      }
    } catch (wsError) {
      console.error('Error broadcasting message update:', wsError)
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

    const message = await IndividualChatMessage.findById(messageId)
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

    const updatedMessage = await IndividualChatMessage.findById(messageId).lean()

    // Broadcast update
    try {
      const { broadcastMessageUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
      if (broadcastMessageUpdate && updatedMessage) {
        broadcastMessageUpdate(message.chatId, updatedMessage)
      }
    } catch (wsError) {
      console.error('Error broadcasting read receipt update:', wsError)
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

// Mark all messages in a chat as read for a user
export const markAllMessagesAsRead = async (chatId, userEmail) => {
  await connectMongo()
  try {
    // Get all unread messages for this user (excluding messages sent by the user)
    const unreadMessages = await IndividualChatMessage.find({
      chatId,
      isDeleted: false,
      senderEmail: { $ne: userEmail },
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
      const { broadcastMessageUpdate, broadcastUnreadCountUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
      if (broadcastMessageUpdate) {
        const updatedMessages = await IndividualChatMessage.find({
          _id: { $in: unreadMessages.map(m => m._id) }
        }).lean()

        for (const updatedMessage of updatedMessages) {
          broadcastMessageUpdate(chatId, updatedMessage)
        }
      }
      
      // Broadcast unread count update (set to 0 since all messages are now read)
      if (broadcastUnreadCountUpdate) {
        broadcastUnreadCountUpdate(chatId, 0)
      }
    } catch (wsError) {
      console.error('Error broadcasting read receipt updates:', wsError)
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

// Get all chats for a user (list of chats with last message and unread count)
export const getUserChats = async (userEmail) => {
  await connectMongo()
  try {
    // Get list of deleted chatIds for this user (chats that should be hidden)
    const deletedChatIds = await DeletedChat.distinct('chatId', {
      userEmail: userEmail.toLowerCase().trim()
    })

    // First, get all unique chatIds where user is either sender or receiver (regardless of deletion)
    // This ensures we include chats even if all messages are cleared for the user
    // But exclude chats that are deleted (hidden from user's list)
    const allChatIds = await IndividualChatMessage.distinct('chatId', {
      $or: [
        { senderEmail: userEmail },
        { receiverEmail: userEmail }
      ],
      isDeleted: false,
      chatId: { $nin: deletedChatIds } // Exclude deleted chats
    })

    // For each chatId, find the last message that's NOT deleted for this user
    const enrichedChats = await Promise.all(
      allChatIds.map(async (chatId) => {
        // Get the last message that's not deleted for this user (for display)
        const lastMessage = await IndividualChatMessage.findOne({
          chatId,
          isDeleted: false,
          'deletedFor.userEmail': { $ne: userEmail }
        })
          .sort({ createdAt: -1 })
          .lean()

        // Get the actual last message timestamp (even if deleted for user) for sorting
        const actualLastMessage = await IndividualChatMessage.findOne({
          chatId,
          isDeleted: false
        })
          .sort({ createdAt: -1 })
          .select('createdAt senderEmail receiverEmail')
          .lean()

        // Determine the other user's email
        // If we have a lastMessage, use it to determine the other user
        // Otherwise, extract from chatId
        let otherUserEmail = null
        if (lastMessage) {
          otherUserEmail = lastMessage.senderEmail === userEmail 
            ? lastMessage.receiverEmail 
            : lastMessage.senderEmail
        } else if (actualLastMessage) {
          // Use actualLastMessage to determine other user if visible message doesn't exist
          otherUserEmail = actualLastMessage.senderEmail === userEmail 
            ? actualLastMessage.receiverEmail 
            : actualLastMessage.senderEmail
        } else {
          // If no messages at all, extract other user from chatId
          const [email1, email2] = chatId.split('_')
          const normalizedUserEmail = userEmail.toLowerCase().trim()
          const normalizedEmail1 = email1.toLowerCase().trim()
          const normalizedEmail2 = email2.toLowerCase().trim()
          
          if (normalizedUserEmail === normalizedEmail1) {
            otherUserEmail = email2
          } else if (normalizedUserEmail === normalizedEmail2) {
            otherUserEmail = email1
          } else {
            // Fallback: use the first email that's not the user's email
            otherUserEmail = email1
          }
        }

        const otherUser = await User.findOne({ email: otherUserEmail })
          .populate('profile', 'firstname lastname')
          .lean()

        // Calculate accurate unread count by counting messages that:
        // 1. Are from the other user (not from current user)
        // 2. Are not deleted
        // 3. Are not deleted for everyone
        // 4. Are not deleted for this user
        // 5. Are not read by this user
        const unreadCount = await IndividualChatMessage.countDocuments({
          chatId,
          senderEmail: { $ne: userEmail },
          isDeleted: false,
          deletedForEveryone: { $ne: true },
          'deletedFor.userEmail': { $ne: userEmail },
          'readBy.userEmail': { $ne: userEmail }
        })

        return {
          chatId,
          otherUser: {
            email: otherUserEmail,
            profile: otherUser?.profile || null
          },
          // lastMessage will be null if all messages are cleared for this user
          lastMessage: lastMessage ? {
            _id: lastMessage._id,
            message: lastMessage.message,
            senderEmail: lastMessage.senderEmail,
            createdAt: lastMessage.createdAt,
            isEdited: lastMessage.isEdited,
            deletedForEveryone: lastMessage.deletedForEveryone
          } : null,
          // Store actual last message timestamp for sorting (even if cleared for user)
          lastMessageTimestamp: actualLastMessage?.createdAt || null,
          unreadCount: unreadCount || 0
        }
      })
    )

    // Sort by actual last message time (most recent first)
    // Use lastMessageTimestamp (actual timestamp even if cleared) for sorting
    enrichedChats.sort((a, b) => {
      const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                    (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
      const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                    (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)
      
      // Most recent first
      if (timeA > 0 && timeB > 0) return timeB - timeA
      // Chats with messages come before chats without messages
      if (timeA > 0 && timeB === 0) return -1
      if (timeA === 0 && timeB > 0) return 1
      // If both have no messages, maintain order
      return 0
    })

    return {
      status: 'success',
      result: enrichedChats,
      message: `Found ${enrichedChats.length} chats`
    }
  } catch (error) {
    console.error('Error in getUserChats:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve chats'
    }
  }
}

// Search user by exact email match
export const searchUserByEmail = async (email) => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .populate('profile', 'firstname lastname')
      .select('email profile')
      .lean()

    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }

    return {
      status: 'success',
      result: {
        email: user.email,
        profile: user.profile || null
      },
      message: 'User found'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to search user'
    }
  }
}

// Clear chat - delete all messages for a user (mark as deleted for user)
export const clearChat = async (chatId, userEmail) => {
  await connectMongo()
  try {
    // Verify user is a participant
    const [email1, email2] = chatId.split('_')
    if (!email1 || !email2) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid chat ID format'
      }
    }

    const normalizedUserEmail = userEmail.toLowerCase().trim()
    const normalizedEmail1 = email1.toLowerCase().trim()
    const normalizedEmail2 = email2.toLowerCase().trim()
    const isParticipant = normalizedUserEmail === normalizedEmail1 || normalizedUserEmail === normalizedEmail2

    if (!isParticipant) {
      return {
        status: 'error',
        result: null,
        message: 'Access denied'
      }
    }

    // Get all messages in this chat that are not already deleted for this user
    const messages = await IndividualChatMessage.find({
      chatId,
      isDeleted: false,
      'deletedFor.userEmail': { $ne: userEmail }
    })

    // Mark all messages as deleted for this user
    const updatePromises = messages.map(message => {
      // Check if already deleted for this user
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
      const { broadcastMessageUpdate, broadcastUnreadCountUpdate } = await import('../ws/individual-chat/[chatId]/publishers')
      if (broadcastMessageUpdate) {
        const updatedMessages = await IndividualChatMessage.find({
          chatId,
          _id: { $in: messages.map(m => m._id) }
        }).lean()

        for (const updatedMessage of updatedMessages) {
          broadcastMessageUpdate(chatId, updatedMessage)
        }
      }
      
      // Broadcast unread count update (set to 0 since all messages are cleared)
      if (broadcastUnreadCountUpdate) {
        broadcastUnreadCountUpdate(chatId, 0)
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
    console.error('Error in clearChat:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to clear chat'
    }
  }
}

// Delete chat - marks chat as deleted (hidden from user's list) and clears all messages
export const deleteChat = async (chatId, userEmail) => {
  await connectMongo()
  try {
    // Verify user is a participant
    const [email1, email2] = chatId.split('_')
    if (!email1 || !email2) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid chat ID format'
      }
    }

    const normalizedUserEmail = userEmail.toLowerCase().trim()
    const normalizedEmail1 = email1.toLowerCase().trim()
    const normalizedEmail2 = email2.toLowerCase().trim()
    const isParticipant = normalizedUserEmail === normalizedEmail1 || normalizedUserEmail === normalizedEmail2

    if (!isParticipant) {
      return {
        status: 'error',
        result: null,
        message: 'Access denied'
      }
    }

    // First, clear all messages (same as clearChat)
    const clearResult = await clearChat(chatId, userEmail)
    if (clearResult.status !== 'success') {
      return clearResult
    }

    // Then, mark the chat as deleted (hidden from user's list)
    // Use upsert to avoid duplicate entries
    await DeletedChat.findOneAndUpdate(
      {
        chatId,
        userEmail: normalizedUserEmail
      },
      {
        chatId,
        userEmail: normalizedUserEmail,
        deletedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    )

    // Broadcast chat deletion update (to remove from chat list)
    try {
      const { broadcastIndividualChatDeleted } = await import('../ws/messenger/publishers')
      if (broadcastIndividualChatDeleted) {
        broadcastIndividualChatDeleted(chatId, normalizedUserEmail)
      }
    } catch (wsError) {
      console.error('Error broadcasting delete chat update:', wsError)
    }

    return {
      status: 'success',
      result: { count: clearResult.result?.count || 0 },
      message: `Chat deleted and ${clearResult.result?.count || 0} messages cleared`
    }
  } catch (error) {
    console.error('Error in deleteChat:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete chat'
    }
  }
}

