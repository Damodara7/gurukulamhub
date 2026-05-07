import * as QuizService from '../../quiz.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request, { params }) {
  try {
    const reqBody = await request.json()
    const id = params.id
    const { email, languageCode } = reqBody || {}

    const response = await QuizService.completeQuizAndAwardPoints({
      quizId: id,
      email,
      languageCode
    })

    if (response.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }

    const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse, response.statusCode)
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
