import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserService from '@/app/services/user.service';

// GET /api/user

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const queryParamsObj = Object.fromEntries(searchParams.entries());

    try {
        const response = await UserService.getOneByQueryParams({ queryParams: queryParamsObj });
        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result);
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Error retrieving user.');
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}
