import * as ApiResponseUtils from '@/utils/apiResponses';
import * as UserProfileService from '../../services/user.service';
import { auth } from '@/libs/auth'

export async function POST(req) {
    try {
        const session = await auth()
        const initiatedByEmail = String(session?.user?.email || '').trim().toLowerCase()
        const initiatedByName =
            String(
                session?.user?.name ||
                `${session?.user?.firstname || ''} ${session?.user?.lastname || ''}`.trim() ||
                session?.user?.email ||
                ''
            ).trim() || 'Unknown'

        let requestBody = {}
        try {
            requestBody = await req.json()
        } catch (error) {
            requestBody = {}
        }

        const response = await UserProfileService.cleanupUnverifiedUsers({
            allowManualDeleteBefore24hrs: Boolean(requestBody?.allowManualDeleteBefore24hrs),
            initiatedByName,
            initiatedByEmail
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
