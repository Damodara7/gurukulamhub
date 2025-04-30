// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import { setPassword } from '@/app/services/user.service'

export async function PUT(request, { params }) {
  try {
    const email = params.userId
    const updateDataRequest = await request.json()

    const profile = await setPassword(email, updateDataRequest.password)

    if (profile) {
      var successResponse = ApiResponseUtils.createSuccessResponse('Setting password successful', profile)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      throw new Error('Setting password failed.')
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
