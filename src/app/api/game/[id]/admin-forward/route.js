import * as GameService from '../../game.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, { params }) {
  try {
    const { id: gameId } = params
    const { user } = await request.json()

    const result = await GameService.setForwardingAdmin(gameId, user)

    if (result.status === 'success') {
      const successRes = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successRes)
    }
    const errorRes = ApiResponseUtils.createErrorResponse(result.message)
    return ApiResponseUtils.sendErrorResponse(errorRes)
  } catch (error) {
    console.error("error: ", error)
    const errorRes = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorRes)
  }
} 