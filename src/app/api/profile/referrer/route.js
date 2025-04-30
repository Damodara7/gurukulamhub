// Next Imports
import {
  sendSuccessResponse,
  sendErrorResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/utils/apiResponses'
import * as UserProfileService from '@/app/services/profile.service'

export async function GET(req) {
  const {searchParams} = new URL(req.url)

  // console.log("userId: " + searchParams.get("userId"));
  // console.log("Search Params",searchParams);
  const email = searchParams.get('email')
  const detailsResult = await UserProfileService.getByEmail({email})
  console.log('Retrieved details:', detailsResult)
  if (detailsResult.status === 'success') {
    const curated = {
      email: detailsResult.result.email,
      firstname: detailsResult.result.firstname,
      lastname: detailsResult.result.lastname,
      countryDialCode: detailsResult.result.countryDialCode,
      phone: detailsResult.result.phone
    }
    console.log('Curated', curated)
    const successResponse = createSuccessResponse('User found.', curated)

    return sendSuccessResponse(successResponse)
  } else {
    const errorResponse = createErrorResponse('User not found.')

    return sendErrorResponse(errorResponse)
  }
}

export async function PUT(request) {
  console.log('We are inside /api/profile/referrer/route.js put request....')
  try {
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    if (updateDataRequest.referredBy) {
      await UserProfileService.updateReferral({ email: updateDataRequest.email, data: { referredBy: updateDataRequest.referredBy } })
    } else {
      await setNetworkLevel(updateDataRequest.email, 0)
    }

    console.log('Referrer details updated Successfully.')

    var successResponse = createSuccessResponse('Referrer details updated Successfully.', null)
    return sendSuccessResponse(successResponse)
  } catch (error) {
    const errorResponse = createErrorResponse(error.message)
    return sendErrorResponse(errorResponse)
  }
}
