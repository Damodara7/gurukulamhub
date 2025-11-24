import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserService from '@/app/services/user.service';

export async function POST(request) {
    try {
        const reqBody = await request.json();
        const { users } = reqBody;

        // Validate request
        if (!users || !Array.isArray(users)) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Users array is required');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        if (users.length === 0) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Users array cannot be empty');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        // Limit batch size to prevent overwhelming the server
        if (users.length > 1000) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Maximum 1000 users can be imported at once');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        // Validate each user has required fields
        const invalidUsers = users.filter(user => !user.email || !user.firstname || !user.lastname);
        if (invalidUsers.length > 0) {
            const errorResponse = ApiResponseUtils.createErrorResponse(
                `${invalidUsers.length} user(s) are missing required fields (email, firstname, lastname)`
            );
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        // Call bulk import service
        const result = await UserService.bulkAddByAdmin({ usersData: users });

        if (result.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                result.message,
                result.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(result.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        console.error('Error in bulk import:', error);
        const errorResponse = ApiResponseUtils.createErrorResponse(
            error.message || 'An unexpected error occurred during bulk import'
        );
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}

