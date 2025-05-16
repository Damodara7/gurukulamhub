import * as GameService from '../../game.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function GET(request, {params}) {
  try {
    const { id: gameId } = params

    const result = await GameService.getLeaderboard(gameId)

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
