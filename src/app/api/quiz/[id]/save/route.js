import * as QuizService from '../../quiz.service'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Quiz'
const ArtifactService = QuizService

export async function PUT(request, { params }) {
  try {
    const id = params.id
    const reqBody = await request.json()

    const newArtifact = await ArtifactService.saveQuiz(id, reqBody)
    console.log(`${Artifact} save Step 1 :`, newArtifact)
    if (newArtifact.status === 'success') {
      console.log(`${Artifact} Updated Successfully ():`)
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(newArtifact.message, newArtifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact} saving error.`)
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact.message, newArtifact.result)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message)
  }
}