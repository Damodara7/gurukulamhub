import * as UserService from '../../services/user.service'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { getLocale } from '@/middleware'

export async function POST(request) {
    try {
        const locale = getLocale(request)
        const reqBody = await request.json();
        const { fromEmail, toEmail } = reqBody;
        const response = await UserService.srvSendReferralLink({ fromEmail, toEmail, locale })
        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
    } catch (error) {
        console.log('Error sending referral link(catch)', error)
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}
