import * as PlayerService from '../player.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) {
      const errorRes = ApiResponseUtils.createErrorResponse('Email is required')
      return ApiResponseUtils.sendErrorResponse(errorRes)
    }
    const result = await PlayerService.getPlayerByEmail(email)
    if (result.status === 'success') {
      const successRes = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successRes)
    }
    const errorRes = ApiResponseUtils.createErrorResponse(result.message)
    return ApiResponseUtils.sendErrorResponse(errorRes)
  } catch (error) {
    const errorRes = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorRes)
  }
}

