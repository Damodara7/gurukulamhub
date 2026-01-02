import * as IndividualChatService from '../individual-chat.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'

// Get all chats for the current user
export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const chats = await IndividualChatService.getUserChats(session.user.email)

    if (chats.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(chats.message, chats.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(chats.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}


