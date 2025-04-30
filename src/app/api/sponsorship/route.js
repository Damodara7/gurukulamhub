import * as ApiResponseUtils from '@/utils/apiResponses'
import * as SponsorshipService from './sponsorship.service'

export async function GET(request) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries());

    let response = {}

    if(queryParamsObj.id){
        response = await SponsorshipService.getOne({ queryParams: { _id: queryParamsObj.id} })
    }else{
        response = await SponsorshipService.getAll({ queryParams: queryParamsObj })
    }

  if (response.status === 'success') {
    const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } else {
    const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
export async function POST(request) {
  const reqBody = await request.json()

  const response = await SponsorshipService.create({ data: reqBody })

  if (response.status === 'success') {
    const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } else {
    const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
