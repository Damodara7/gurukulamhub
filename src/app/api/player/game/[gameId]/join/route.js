import * as PlayerService from '../../../player.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { user } = await request.json()
    const result = await PlayerService.joinGame(gameId, user)
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

