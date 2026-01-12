import * as IndividualChatService from '../individual-chat.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'

// Mark message as read
export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Unauthorized')
      )
    }

    const reqBody = await request.json()
    const { action, messageId, chatId } = reqBody

    if (action === 'markAsRead') {
      if (!messageId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Message ID is required')
        )
      }

      const result = await IndividualChatService.markMessageAsRead(messageId, session.user.email)
      
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
      if (!chatId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Chat ID is required')
        )
      }

      // Decode the chatId (it may be URL-encoded, possibly multiple times)
      let decodedChatId = chatId
      try {
        // Try decoding multiple times if needed (handles double-encoding)
        for (let i = 0; i < 3; i++) {
          try {
            const testDecode = decodeURIComponent(decodedChatId)
            if (testDecode === decodedChatId) break // No more decoding needed
            decodedChatId = testDecode
          } catch (e) {
            break // Can't decode further
          }
        }
      } catch (e) {
        console.warn('Failed to decode chatId:', e)
      }

      // Verify user is a participant
      const [email1, email2] = decodedChatId.split('_')
      if (!email1 || !email2) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Invalid chat ID format')
        )
      }

      // Decode emails if they're URL-encoded and normalize
      let decodedEmail1 = email1
      let decodedEmail2 = email2
      try {
        decodedEmail1 = decodeURIComponent(email1).toLowerCase().trim()
        decodedEmail2 = decodeURIComponent(email2).toLowerCase().trim()
      } catch (e) {
        decodedEmail1 = email1.toLowerCase().trim()
        decodedEmail2 = email2.toLowerCase().trim()
      }
      
      const normalizedUserEmail = session.user.email.toLowerCase().trim()
      const isParticipant = normalizedUserEmail === decodedEmail1 || normalizedUserEmail === decodedEmail2
      
      if (!isParticipant) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Access denied')
        )
      }
      
      // Use decoded and sorted chatId for the service call (ensure consistency)
      const sortedEmails = [decodedEmail1, decodedEmail2].sort()
      decodedChatId = `${sortedEmails[0]}_${sortedEmails[1]}`
      if (!isParticipant) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Access denied')
        )
      }

      const result = await IndividualChatService.markAllMessagesAsRead(decodedChatId, session.user.email)
      
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

    if (action === 'clearChat' || action === 'deleteChat') {
      if (!chatId) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Chat ID is required')
        )
      }

      // Decode and normalize chatId
      let decodedChatId = chatId
      try {
        for (let i = 0; i < 3; i++) {
          try {
            const testDecode = decodeURIComponent(decodedChatId)
            if (testDecode === decodedChatId) break
            decodedChatId = testDecode
          } catch (e) {
            break
          }
        }
      } catch (e) {
        console.warn('Failed to decode chatId:', e)
      }

      const [email1, email2] = decodedChatId.split('_')
      if (!email1 || !email2) {
        return ApiResponseUtils.sendErrorResponse(
          ApiResponseUtils.createErrorResponse('Invalid chat ID format')
        )
      }

      let decodedEmail1 = email1
      let decodedEmail2 = email2
      try {
        decodedEmail1 = decodeURIComponent(email1).toLowerCase().trim()
        decodedEmail2 = decodeURIComponent(email2).toLowerCase().trim()
      } catch (e) {
        decodedEmail1 = email1.toLowerCase().trim()
        decodedEmail2 = email2.toLowerCase().trim()
      }
      
      const sortedEmails = [decodedEmail1, decodedEmail2].sort()
      decodedChatId = `${sortedEmails[0]}_${sortedEmails[1]}`

      const result = action === 'clearChat'
        ? await IndividualChatService.clearChat(decodedChatId, session.user.email)
        : await IndividualChatService.deleteChat(decodedChatId, session.user.email)
      
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

    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse('Invalid action')
    )
  } catch (error) {
    console.error('Error in individual chat actions:', error)
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    )
  }
}


