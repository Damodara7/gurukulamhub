import { NextRequest } from 'next/server'
import * as ApiResponseUtils from '@/utils/apiResponses'
// Calls the connect function to establish a connection to the database.
import * as UserService from '@/app/services/user.service'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'

export async function POST(request: NextRequest) {
  try {
    // It extracts the token property from the JSON body of the incoming request.
    const reqBody = await request.json()

    const { email,phone, otp } = reqBody
    console.log('OTP Verification Request details:', email,phone, otp)
    const returnStatus: number = await UserService.srvVerifyPhoneOtp(email, otp)
    console.log('OTP Verification Result status:', returnStatus)
    var resultInfo:ApiResponseUtils.ResultInfo;
    if (returnStatus == 0) {     
       resultInfo = ApiResponseUtils.createErrorResponse("Invalid Otp") ;
      return ApiResponseUtils.sendErrorResponse(resultInfo)
    } else if (returnStatus == 1) {
       resultInfo = ApiResponseUtils.createSuccessResponse("Verified Phone Successfully") ;
      return ApiResponseUtils.sendSuccessResponse(resultInfo)
    } else if (returnStatus == -1) {
      resultInfo = ApiResponseUtils.createErrorResponse("Unknown Error Occurred while OTP Verification") ;
      return ApiResponseUtils.sendErrorResponse(resultInfo)
    }
  } catch (error: any) {
    resultInfo = ApiResponseUtils.createErrorResponse(error?.message) ;
    return ApiResponseUtils.sendErrorResponse(resultInfo)
  }
}
