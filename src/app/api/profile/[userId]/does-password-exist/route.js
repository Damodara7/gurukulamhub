// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import { doesUserHavePassword } from '@/app/services/user.service'

export async function GET(request, { params }) {
  try {
    const email = params.userId
    const hasPassword = await doesUserHavePassword(email)

    if (hasPassword) {
      var successResponse = ApiResponseUtils.createSuccessResponse('Setting password successful', hasPassword)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      throw new Error("Coudn't reach user profile.")
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
