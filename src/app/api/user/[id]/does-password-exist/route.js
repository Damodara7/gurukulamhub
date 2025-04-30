// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import { doesUserHavePassword } from '@/app/services/user.service'
export async function GET(request, { params }) {
  try {
    const email = params.id
    const hasPassword = await doesUserHavePassword(email)

    if (hasPassword) {
      var successResponse = ApiResponseUtils.createSuccessResponse('User already has password.', hasPassword)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      var successResponse = ApiResponseUtils.createSuccessResponse('User does not has password.', false)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('Error in checking password existence:', error.message)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
