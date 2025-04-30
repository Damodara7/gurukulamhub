import * as ApiResponseUtils from '@/utils/apiResponses'
import { getUserNetworkTree } from '@/app/services/network.service'

// GET /api/network/[id]/

export async function GET(request, { params }) {
  try {
    const email = params.id
    const response = await getUserNetworkTree(email)

    if (response?.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(response?.message, response?.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)

    } else {
      const successResponse = ApiResponseUtils.createErrorResponse(response?.message)
      return ApiResponseUtils.sendErrorResponse(successResponse)
    }
  } catch (error) {
    console.log("Failed to get network response(catch)", error)
    const errorResponse = ApiResponseUtils.createErrorResponse('Failed to fetch referrer and referrals.', error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
