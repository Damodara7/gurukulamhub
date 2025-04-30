import * as ApiResponseUtils from '@/utils/apiResponses'
import * as UserService from '@/app/services/user.service'
// POST /users/referrer-notification

export async function POST(request) {
    try {
        const reqBody = await request.json()
        const response = await UserService.srvSendReferrerNotification({ data: reqBody})

        if (response.status ==='success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
    } catch (error) {
        console.error('Error in POST /users/referrer-notification', error)
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}
