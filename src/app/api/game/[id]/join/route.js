import * as GameService from '../../game.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, {params}) {
  try {
    const { id: gameId } = params
    const { user } = await request.json()

    console.log(user, gameId)

    const result = await GameService.joinGame(gameId, {
      id: user.id,
      email: user.email
    })

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
