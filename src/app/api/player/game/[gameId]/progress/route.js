import * as PlayerService from '../../../player.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { user, userAnswer, finish } = await request.json()
    const result = await PlayerService.updatePlayerProgress(gameId, { user, userAnswer, finish })
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

