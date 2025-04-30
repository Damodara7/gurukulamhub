import * as QuizService from '../quiz/quiz.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request) {

    try {
        // Vars
        const reqBody = await request.json()
        const { quizId, language } = reqBody

        const response = await QuizService.translateQuizQuestions({ quizId, language })

        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }

    } catch (error) {
        console.error(error)
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}
