import * as GameService from '../game.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Game'
const ArtifactService = GameService

export async function GET(req, { params }) {
  try {
    const id = params.id
    const { searchParams } = new URL(req.url)
    const showFilter = searchParams.get('showFilter')

    const queryParams = {}
    if (showFilter) {
      queryParams.status = showFilter
    }

    var artifact = {}
    artifact = await ArtifactService.getById(id, queryParams)
    console.log('Artifact: ', artifact)
    if (artifact?.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else if (artifact?.status === 'error') {
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    } else {
      var notFoundResponse = ApiResponseUtils.createErrorResponse('Not found', {}, HttpStatusCode.NOT_FOUND)
      return ApiResponseUtils.sendErrorResponse(notFoundResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
