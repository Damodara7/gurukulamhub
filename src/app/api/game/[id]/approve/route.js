import * as GameService from '../../game.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, {params}) {
  try {
    const { id: gameId } = params
    const reqBody = await request.json()

    // Extract game ID from request body (consider using URL parameters instead)
    if (!gameId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Game ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Update the game using the service
    const updateResult = await GameService.approveGame(gameId, reqBody)

    if (updateResult.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}