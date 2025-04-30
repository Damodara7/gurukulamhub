// Next Imports
import * as ApiResponseUtils from '@/utils/apiResponses'
import * as UserProfileService from '@/app/services/profile.service'

// export async function POST(request) {
//   // await dbConnect()

//   console.log('We are inside /api/profile post request....')
//   try {
//     // Vars
//     console.log('Request Type:', request.headers.get('content-type'))
//     console.log('Body Details...', request.body)
//     //Reading JSON input of the body...
//     const updateDataRequest = await request.json()
//     console.log('Body Details...', updateDataRequest)

//     // Call the Create user profile function
//     const createdProfileResult = await updateUserProfile(updateDataRequest.email, updateDataRequest)

//     if (createdProfileResult) {
//       console.log('User Profile creation Successfully ():')

//       var successResponse = ApiResponseUtils.createSuccessResponse('User profile created successfully', createdProfileResult)
//       return ApiResponseUtils.sendSuccessResponse(successResponse)
//     } else {
//       throw new Error('Creating user profile failed.')
//     }
//   } catch (error) {
//     const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
//     return ApiResponseUtils.sendErrorResponse(errorResponse)
//   }
// }

export async function POST(request) {
  console.log('We are inside /api/profile/route.js post request....')
  try {
    // Vars
    // console.log('Request Type:', request.headers.get('content-type'))
    // console.log('Body Details...', request.body)
    //Reading JSON input of the body...
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    const createdProfileResult = await UserProfileService.addOrUpdate({ email: updateDataRequest.email, data: updateDataRequest })

    if (createdProfileResult.status === 'success') {
      console.log('User Profile registered/updated Successfully ():')

      var successResponse = ApiResponseUtils.createSuccessResponse('User profile updated successfully', createdProfileResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('User Profile registration/update error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(createdProfileResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// extra
export async function PUT(request) {
  console.log('We are inside /api/profile/route.js put request....')
  try {
    // Vars
    console.log('Request Type:', request.headers.get('content-type'))
    console.log('Body Details...', request.body)
    //Reading JSON input of the body...
    const updateDataRequest = await request.json()
    console.log('Body Details...', updateDataRequest)

    const createdProfileResult = await UserProfileService.addOrUpdate({ email: updateDataRequest.email, data: updateDataRequest })

    if (createdProfileResult.status === 'success') {
      console.log('User Profile registered/updated Successfully ():')

      var successResponse = ApiResponseUtils.createSuccessResponse('User profile updated successfully', createdProfileResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('User Profile registration/update error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(createdProfileResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
