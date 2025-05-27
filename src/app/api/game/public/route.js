import * as GameService from '../game.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
const ArtifactService = GameService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { id, pin, email, ...rest } = queryParamsObj

    let artifact

    if (id) {
      artifact = await ArtifactService.getOne({ _id: id, ...rest })
    } else if (pin) {
      artifact = await ArtifactService.getOne({ pin: pin, ...rest })
    } else {
      artifact = await ArtifactService.getAllPublic({ ...rest })
    }
    if (artifact.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else if (artifact.status === 'error') {
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
