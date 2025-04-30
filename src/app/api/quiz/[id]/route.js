import * as QuizService from '../quiz.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Quiz'
const ArtifactService = QuizService

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
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message, {}, artifact.statusCode)
      return ApiResponseUtils.sendErrorResponse(errorResponse, artifact.statusCode)
    } else {
      var notFoundResponse = ApiResponseUtils.createErrorResponse('Not found', {}, HttpStatusCode.NotFound)
      return ApiResponseUtils.sendErrorResponse(notFoundResponse, artifact.statusCode)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id
    const reqBody = await request.json()

    //const { email, password } = reqBody
    const newArtifact = await ArtifactService.updateById(id, {
      ...reqBody
    })
    console.log('`${Artifact}` Update Step 1 :', newArtifact)
    if (newArtifact.status === 'success') {
      console.log('`${Artifact}` Updated Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} Updated successfully`, newArtifact)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact} updating error.`)
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message)
  }
}
