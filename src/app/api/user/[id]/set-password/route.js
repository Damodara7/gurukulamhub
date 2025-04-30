// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import { setPassword } from '@/app/services/user.service'

export async function PUT(request, { params }) {
  try {
    const email = params.id
    const updateDataRequest = await request.json()

    const result = await setPassword({ email, password: updateDataRequest.password })

    if (result.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
