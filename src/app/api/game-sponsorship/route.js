import * as GameSponsorshipService from './game-sponsorship.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Game sponsorship request body:', body)

    const result = await GameSponsorshipService.createGameSponsorship(body)

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('Game sponsorship creation error:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sponsorshipId = searchParams.get('sponsorshipId')
    
    const queryParams = {}
    if (sponsorshipId) {
      queryParams._id = sponsorshipId
    }

    const result = await GameSponsorshipService.getGameSponsorships(queryParams)

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('Game sponsorship fetch error:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
