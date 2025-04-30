import * as ApiResponseUtils from '@/utils/apiResponses'
import * as SponsorshipPaymentService from './sponsorship-payment.service'

export async function POST(request) {
  const reqBody = await request.json()

  const response = await SponsorshipPaymentService.create({ data: reqBody })

  if (response.status === 'success') {
    const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } else {
    const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}