// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import { getByEmail, addOrUpdate } from '@/app/services/profile.service'

export async function GET(req, { params }) {
  try {
    const userLoginId = params.userId
    console.log('UserId is:', userLoginId)
    const profileResult = await getByEmail({ email: userLoginId })
    if (profileResult.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse('User profile created successfully', profileResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
    const errorResponse = ApiResponseUtils.createErrorResponse(profileResult.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  } catch (error) {
    console.error('api/profile/[userId] GET -> Error fetching user:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function PUT(request, { params }) {
  console.log('We are inside /api/profile/[userId] put request....')
  try {
    const email = params.userId
    // Vars
    console.log('Request Type:', request.headers.get('content-type'))
    console.log('Body Details...', request.body)
    //Reading JSON input of the body...
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    const createdProfileResult = await addOrUpdate({ email, data: updateDataRequest })

    if (createdProfileResult.status = 'success') {
      console.log('User Profile registered/updated Successfully ():')

      var successResponse = ApiResponseUtils.createSuccessResponse('User profile updated successfully', createdProfileResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('User Profile registration/update error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(profileResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// extra
export async function POST(request, { params }) {
  console.log('We are inside /api/profile/[userId] post request....')
  try {
    const email = params.userId
    // Vars
    console.log('Request Type:', request.headers.get('content-type'))
    console.log('Body Details...', request.body)
    //Reading JSON input of the body...
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    const createdProfileResult = await addOrUpdate({ email, data: updateDataRequest })

    if (createdProfileResult.status === 'success') {
      console.log('User Profile registered/updated Successfully ():')

      var successResponse = ApiResponseUtils.createSuccessResponse('User profile updated successfully', createdProfile)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('User Profile registration/update error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(profileResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
