import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserProfileService from '../../services/user.service';

export async function POST(req) {
    try {
        let requestBody = {}
        try {
            requestBody = await req.json()
        } catch (error) {
            requestBody = {}
        }

        const response = await UserProfileService.cleanupUnverifiedUsers({
            allowManualDeleteBefore24hrs: Boolean(requestBody?.allowManualDeleteBefore24hrs)
        })
        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result);
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message);
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}

export async function GET() {
    try {
        const response = await UserProfileService.getUnverifiedUsersForCleanup()
        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result || {
                users: [],
                cleanupEligibleCount: 0
            });
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message);
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}
