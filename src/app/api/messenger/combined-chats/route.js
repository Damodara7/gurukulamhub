import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import * as IndividualChatService from '../../individual-chat/individual-chat.service.js'
import * as GroupService from '../../group/group.service.js'
import connectMongo from '@/utils/dbConnect-mongo'
import GroupChatMessage from '../../group-chat/group-chat.model.js'

// Force dynamic rendering - this route uses auth() which requires headers
export const dynamic = 'force-dynamic'

// Get combined individual chats and groups, sorted by most recent message
export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const userEmail = session.user.email

    // Fetch individual chats and groups in parallel
    const [individualChatsResult, groupsResult] = await Promise.all([
      IndividualChatService.getUserChats(userEmail),
      GroupService.getUserGroups(userEmail)
    ])

    const combinedChats = []

    // Process individual chats
    if (individualChatsResult?.status === 'success') {
      const individualChats = individualChatsResult.result || []
      for (const chat of individualChats) {
        // Ensure lastMessage is not deleted for this user (double-check)
        let lastMessage = chat.lastMessage
        if (lastMessage && lastMessage.deletedFor) {
          const isDeletedForUser = lastMessage.deletedFor.some(d => d.userEmail === userEmail)
          if (isDeletedForUser) {
            lastMessage = null
          }
        }
        
        combinedChats.push({
          type: 'individual',
          id: chat.chatId,
          name: chat.otherUser?.profile
            ? `${chat.otherUser.profile.firstname || ''} ${chat.otherUser.profile.lastname || ''}`.trim() ||
              chat.otherUser.email.split('@')[0]
            : chat.otherUser.email.split('@')[0],
          email: chat.otherUser.email,
          lastMessage: lastMessage, // Will be null if deleted for user
          lastMessageTimestamp: chat.lastMessageTimestamp, // Actual timestamp for sorting (even if cleared)
          unreadCount: chat.unreadCount || 0,
          avatar: chat.otherUser?.profile
            ? (
                chat.otherUser.profile.firstname?.[0] ||
                chat.otherUser.profile.lastname?.[0] ||
                chat.otherUser.email[0]
              ).toUpperCase()
            : chat.otherUser.email[0].toUpperCase(),
          avatarColor: null // Will be calculated on frontend if needed
        })
      }
    }

    // Process groups - fetch last message and unread count for each group
    if (groupsResult?.status === 'success') {
      await connectMongo()
      const groups = groupsResult.result || []

      for (const group of groups) {
        // Get last message for this group (chronologically latest)
        const lastMessageResult = await GroupChatMessage.findOne({
          groupId: group._id,
          isDeleted: false,
          'deletedFor.userEmail': { $ne: userEmail }
        })
          .sort({ createdAt: -1 })
          .lean()

        const needApproval = group.needApprovalForMessages === true
        const actualLastTimestamp = lastMessageResult?.createdAt || null

        let lastMessage = null
        if (lastMessageResult) {
          const isDeletedForUser = lastMessageResult.deletedFor?.some(d => d.userEmail === userEmail)
          if (!isDeletedForUser) {
            const isFromRequester = lastMessageResult.senderEmail === userEmail
            const isPendingOrRejected = (lastMessageResult.approvalStatus === 'pending' || lastMessageResult.approvalStatus === 'rejected')

            // For others: pending/rejected must not be shown as last message; use last non-pending, non-rejected
            if (needApproval && isPendingOrRejected && !isFromRequester) {
              const lastVisibleResult = await GroupChatMessage.findOne({
                groupId: group._id,
                isDeleted: false,
                'deletedFor.userEmail': { $ne: userEmail },
                _id: { $ne: lastMessageResult._id },
                $or: [
                  { senderEmail: userEmail },
                  { approvalStatus: { $nin: ['pending', 'rejected'] } },
                  { approvalStatus: null }
                ]
              })
                .sort({ createdAt: -1 })
                .lean()
              if (lastVisibleResult) {
                const deletedForUser = lastVisibleResult.deletedFor?.some(d => d.userEmail === userEmail)
                if (!deletedForUser) {
                  lastMessage = {
                    _id: lastVisibleResult._id,
                    message: lastVisibleResult.message,
                    senderEmail: lastVisibleResult.senderEmail,
                    createdAt: lastVisibleResult.createdAt,
                    isEdited: lastVisibleResult.isEdited,
                    deletedForEveryone: lastVisibleResult.deletedForEveryone,
                    approvalStatus: lastVisibleResult.approvalStatus || undefined
                  }
                }
              }
              // else lastMessage stays null; sort will use actualLastTimestamp
            } else {
              lastMessage = {
                _id: lastMessageResult._id,
                message: lastMessageResult.message,
                senderEmail: lastMessageResult.senderEmail,
                createdAt: lastMessageResult.createdAt,
                isEdited: lastMessageResult.isEdited,
                deletedForEveryone: lastMessageResult.deletedForEveryone,
                approvalStatus: lastMessageResult.approvalStatus || undefined
              }
            }
          }
        }

        // Calculate unread count for this group
        // Count messages that:
        // 1. Are not from the current user
        // 2. Are not deleted
        // 3. Are not deleted for everyone
        // 4. Are not deleted for this user
        // 5. Are not read by this user
        const unreadCount = await GroupChatMessage.countDocuments({
          groupId: group._id,
          senderEmail: { $ne: userEmail },
          isDeleted: false,
          deletedForEveryone: { $ne: true },
          'deletedFor.userEmail': { $ne: userEmail },
          'readBy.userEmail': { $ne: userEmail }
        })

        combinedChats.push({
          type: 'group',
          id: group._id,
          name: group.groupName || 'Unnamed Group',
          lastMessage,
          lastMessageTimestamp: actualLastTimestamp,
          unreadCount: unreadCount || 0,
          avatar: null,
          avatarColor: null,
          isAnnouncementOnly: group.isAnnouncementOnly
        })
      }
    }

    // Sort by actual last message time (most recent first)
    // Use lastMessageTimestamp (actual timestamp even if cleared) for sorting
    // This ensures cleared chats are sorted by their actual last message time
    combinedChats.sort((a, b) => {
      const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 
                    (a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0)
      const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 
                    (b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0)

      // If both have messages, sort by time (most recent first)
      if (timeA > 0 && timeB > 0) {
        return timeB - timeA
      }

      // If only one has a message, it comes first
      if (timeA > 0 && timeB === 0) return -1
      if (timeA === 0 && timeB > 0) return 1

      // If neither has a message, maintain original order
      return 0
    })

    const successResponse = ApiResponseUtils.createSuccessResponse(
      `Found ${combinedChats.length} chats`,
      combinedChats
    )
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } catch (error) {
    console.error('Error in combined chats GET:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

