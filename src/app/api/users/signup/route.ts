import { NextRequest, NextResponse } from 'next/server'
import {
  sendSuccessResponse,
  sendErrorResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/utils/apiResponses'
// Calls the connect function to establish a connection to the database.
import * as UserService from '@/app/services/user.service'
import * as AppCodes from '@/configs/appErrorCodes'

export async function POST(request: NextRequest) {
  //await connectMongo()

  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()
    const { email, password, firstname, lastname, phone } = reqBody

    const result = await UserService.addOrUpdate({ email, data: { ...reqBody } })
    if (result.status === 'success') {
      const successResponse = createSuccessResponse(result.message, result.result)
      return sendSuccessResponse(successResponse)
    } else {
      const errorResponse = createErrorResponse(result?.message, result.result)
      return sendErrorResponse(errorResponse)
    }
  } catch (error: any) {
    console.error('Error in POST request:', error)
    const errorResponse = createErrorResponse(error?.message)
    return sendErrorResponse(errorResponse)
  }
}

const handleUserNotFound = () => {
  const errorCode = 'USER_NOT_FOUND'
  const nextActionCode = 'SHOW_LOGIN_FORM'
  const userId = '123456' // Additional context parameter
  const context = { userId } // Additional context object
  const errorResponse = createErrorResponse(errorCode, context, nextActionCode)
  return errorResponse
}

const handleDuplicateUserFound = (user: any) => {
  var errorCode = ''
  var nextActionCode = '/login'
  var context = {}

  if (user.currentStatus === 'VERIFY_OTP_SENT') {
    errorCode = AppCodes.ERROR_USER_ALREADY_EXISTS_UNVERIFIED
    nextActionCode = AppCodes.ACTION_SHOW_ALERT
    context = { email: user.email }
  } else {
    errorCode = AppCodes.ERROR_USER_ALREADY_EXISTS
    nextActionCode = AppCodes.ACTION_CONFIRM_TO_NAVIGATE_TO_PAGE
    context = { email: user.email, nextPage: '/auth/login' } // Additional context object
  }
  const errorResponse = createErrorResponse(errorCode, context, nextActionCode)
  return errorResponse
}

const handleNewUserCreated = (user: any) => {
  const context = { user } // Additional context object
  const successResponse = createSuccessResponse('New User Created', context)
  return successResponse
}
