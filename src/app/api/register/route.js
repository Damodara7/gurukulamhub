import { updateUserProfile } from '../../services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request) {
  // await dbConnect()

  console.log('We are inside /api/register/post request....')
  try {
    // Vars
    console.log('Request Type:', request.headers.get('content-type'))
    console.log('Body Details...', request.body)
    //Reading JSON input of the body...
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    // Call the Create user profile function
    const createdProfile = await updateUserProfile(updateDataRequest.email, updateDataRequest)

    if (createdProfile) {
      console.log('User registration Successful ():')

      var successResponse = ApiResponseUtils.createSuccessResponse('User profile created successfully', createdProfile)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('User registration error.')
      throw new Error('Failed to register user!')
    }
  } catch (error) {
    console.error('Error in /api/register POST:', error.message)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
