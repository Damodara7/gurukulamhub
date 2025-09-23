import * as ApiResponseUtils from '@/utils/apiResponses'
import * as GameSponsorshipPaymentService from './game-sponsorship-payment.service'

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Game sponsorship payment request body:', body)

    const result = await GameSponsorshipPaymentService.createPaymentIntent(body)

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('Game sponsorship payment creation error:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
