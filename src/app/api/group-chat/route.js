import * as GroupChatService from './group-chat.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import Group from '../group/group.model.js'
import connectMongo from '@/utils/dbConnect-mongo'

const Artifact = 'Group Chat'
const ArtifactService = GroupChatService

export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const groupId = searchParams.get('groupId')
    const limit = searchParams.get('limit') || '50'
    const skip = searchParams.get('skip') || '0'
    const before = searchParams.get('before') // ISO timestamp for pagination

    if (!groupId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Group ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Check if user can view messages
    await connectMongo()
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
      const errorResponse = ApiResponseUtils.createErrorResponse('Group not found')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const canView = await GroupChatService.canUserViewMessages(group, session.user.email)
    if (!canView.allowed) {
      const errorResponse = ApiResponseUtils.createErrorResponse(canView.reason || 'Access denied')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

        const messages = await ArtifactService.getMessagesByGroupId(groupId, {
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
    const { groupId, message, messageType = 'text', attachments } = reqBody

    const hasContent = (message != null && String(message).trim()) || (Array.isArray(attachments) && attachments.length > 0)
    if (!groupId || !hasContent) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Group ID and either message or attachments are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const newMessage = await ArtifactService.addMessage({
      groupId,
      senderEmail: session.user.email,
      message: message != null ? message : '',
      messageType,
      attachments: Array.isArray(attachments) ? attachments : undefined
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

