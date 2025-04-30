import * as UserLearningService from "./user-learnig.service";
import * as ApiResponseUtils from '@/utils/apiResponses';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const queryParams = Object.fromEntries(searchParams.entries())

        let response;

        if (queryParams.email) {
            response = await UserLearningService.getLearningRecordsForUser({ email: queryParams?.email })
        } else {
            response = await UserLearningService.getAll()
        }

        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }

    } catch (error) {
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}

export async function POST(request) {
    // Get the JSON body from the request
    try {
        const reqBody = await request.json();
        const { email, data } = reqBody

        const response = await UserLearningService.addLearningRecords({ email, data })

        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
    } catch (error) {
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}
