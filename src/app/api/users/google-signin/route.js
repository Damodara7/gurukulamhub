import { NextRequest, NextResponse } from 'next/server'
import {
  sendSuccessResponse,
  sendErrorResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/utils/apiResponses'
// Calls the connect function to establish a connection to the database.
import * as UserService from '@/app/services/user.service'
import * as UserProfileService from '@/app/services/profile.service'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as AppCodes from '@/configs/appErrorCodes'

export async function POST(request) {
  //await connectMongo()

  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()
    console.log('Google Signup Request details:', reqBody)
    let response = await UserService.addByGoogleSignin({ email: reqBody.email, data: reqBody })
    if (response.status === 'success') {

      var successResponse = createSuccessResponse(response.message || 'New User created successfully', response.result)
      return sendSuccessResponse(successResponse)
    } else {
      const errorResponse = createErrorResponse(response.message || 'User creation failed')
      return sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = createErrorResponse(error?.message)
    return sendErrorResponse(errorResponse)
  }
}
