import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserProfileService from '../../services/user.service';

export async function POST(req) {
    try {
        const response = await UserProfileService.cleanupUnverifiedUsers()
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
