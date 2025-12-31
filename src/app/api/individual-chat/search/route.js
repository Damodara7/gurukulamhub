import * as IndividualChatService from '../individual-chat.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'

// Search user by exact email match
export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const email = searchParams.get('email')

    if (!email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Email is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Only allow exact email match
    const user = await IndividualChatService.searchUserByEmail(email)

    if (user.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(user.message, user.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(user.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}


