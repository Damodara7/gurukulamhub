import * as IndividualChatService from './individual-chat.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import connectMongo from '@/utils/dbConnect-mongo'
import User from '@/app/models/user.model'

const Artifact = 'Individual Chat'
const ArtifactService = IndividualChatService

// Helper function to generate chatId from two emails
const generateChatId = (email1, email2) => {
  const sorted = [email1, email2].sort()
  return `${sorted[0]}_${sorted[1]}`
}

export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    let chatId = searchParams.get('chatId')
    const limit = searchParams.get('limit') || '50'
    const skip = searchParams.get('skip') || '0'
    const before = searchParams.get('before') // ISO timestamp for pagination

    if (!chatId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Chat ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Decode the chatId (it may be URL-encoded, possibly multiple times)
    try {
      // URLSearchParams.get() already decodes once, but we might need to decode again
      let decoded = chatId
      // Try decoding multiple times if needed (handles double-encoding)
      for (let i = 0; i < 3; i++) {
        try {
          const testDecode = decodeURIComponent(decoded)
          if (testDecode === decoded) break // No more decoding needed
          decoded = testDecode
        } catch (e) {
          break // Can't decode further
        }
      }
      chatId = decoded
    } catch (e) {
      // If decoding fails, use original
      console.warn('Failed to decode chatId:', e)
    }

    // Verify user is a participant in this chat
    const [email1, email2] = chatId.split('_')
    if (!email1 || !email2) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Invalid chat ID format')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
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
      const errorResponse = ApiResponseUtils.createErrorResponse('Access denied')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Ensure chatId is properly sorted (for consistency) - use normalized emails
    const sortedEmails = [decodedEmail1, decodedEmail2].sort()
    const normalizedChatId = `${sortedEmails[0]}_${sortedEmails[1]}`

    const messages = await ArtifactService.getMessagesByChatId(normalizedChatId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      before,
      userEmail: session.user.email
    })

    if (messages.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(messages.message, messages.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(messages.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const reqBody = await request.json()
    let { receiverEmail, message, messageType = 'text' } = reqBody

    if (!receiverEmail || !message) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Receiver email and message are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Decode receiver email if it's URL-encoded (handles multiple levels of encoding)
    try {
      let decoded = receiverEmail
      // Try decoding multiple times if needed (handles double-encoding)
      for (let i = 0; i < 3; i++) {
        try {
          const testDecode = decodeURIComponent(decoded)
          if (testDecode === decoded) break // No more decoding needed
          decoded = testDecode
        } catch (e) {
          break // Can't decode further
        }
      }
      receiverEmail = decoded
    } catch (e) {
      console.warn('Failed to decode receiverEmail:', e)
    }

    // Normalize receiver email
    receiverEmail = receiverEmail.toLowerCase().trim()

    // Verify receiver exists
    await connectMongo()
    // Try case-insensitive email lookup first
    const receiver = await User.findOne({ 
      email: { $regex: new RegExp(`^${receiverEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    }).lean()
    
    if (!receiver) {
      // Try exact match as fallback
      const receiverExact = await User.findOne({ email: receiverEmail }).lean()
      if (!receiverExact) {
        console.error('Receiver not found:', receiverEmail)
        const errorResponse = ApiResponseUtils.createErrorResponse('Receiver not found')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    }

    const newMessage = await ArtifactService.addMessage({
      senderEmail: session.user.email,
      receiverEmail,
      message,
      messageType
    })

    if (newMessage?.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `Message sent successfully`,
        newMessage?.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(newMessage?.message || 'Failed to send message')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function PUT(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const reqBody = await request.json()
    const { messageId, message } = reqBody

    if (!messageId || !message) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Message ID and new message are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const updatedMessage = await ArtifactService.editMessage(messageId, message, session.user.email)

    if (updatedMessage.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(updatedMessage.message, updatedMessage.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updatedMessage.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function DELETE(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const messageId = searchParams.get('messageId')
    const deleteForEveryone = searchParams.get('deleteForEveryone') === 'true'

    if (!messageId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Message ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const deletedMessage = await ArtifactService.deleteMessage(messageId, session.user.email, deleteForEveryone)

    if (deletedMessage.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse('Message deleted successfully', deletedMessage.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedMessage.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

