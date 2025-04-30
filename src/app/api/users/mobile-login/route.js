import { NextRequest, NextResponse } from 'next/server'
import {
  sendSuccessResponse,
  sendErrorResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/utils/apiResponses'
// Calls the connect function to establish a connection to the database.
import * as UserService from '@/app/services/user.service'

export async function POST(request) {
  try {
    const reqBody = await request.json()
    console.log('Google Signup Request details:', reqBody)
    let response = await UserService.mobileLogin({ email: reqBody.email })
    if (response.status === 'success') {

      var successResponse = createSuccessResponse(response.message, response.result)
      return sendSuccessResponse(successResponse)
    } else {
      const errorResponse = createErrorResponse(response.message)
      return sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = createErrorResponse(error?.message)
    return sendErrorResponse(errorResponse)
  }
}
