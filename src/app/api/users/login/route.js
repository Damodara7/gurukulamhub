import { NextRequest, NextResponse } from 'next/server'
import {
  sendSuccessResponse,
  sendErrorResponse,
  createSuccessResponse,
  createErrorResponse
} from '@/utils/apiResponses'
// Calls the connect function to establish a connection to the database.
// import * as LoginService from '@/app/services/login.service'
import * as UserService from '@/app/services/user.service'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as AppCodes from '@/configs/appErrorCodes'

export async function POST(request) {
  //await connectMongo()
  try {
    const reqBody = await request.json()
    console.log('LOGIN', reqBody)
    const { email, password } = reqBody
    const loginUserResult = await UserService.login({ email, password })
    //console.log("login user",loginUser)

    if (loginUserResult.status === 'error') {
      console.log('Login error', loginUserResult.message)
      var result = createErrorResponse(loginUserResult.message)
      return sendErrorResponse(result)
    }
    var result = createSuccessResponse('Login successful', loginUserResult.result)
    return sendSuccessResponse(result)
  } catch (error) {
    var result = createErrorResponse(error?.message)
    return sendErrorResponse(result)
  }
}
