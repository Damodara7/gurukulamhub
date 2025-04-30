import { NextRequest, NextResponse } from 'next/server'
import * as SMSService from '@/app/services/sms.service'
import * as ApiResponseUtils from '@/utils/apiResponses'
import * as UserService from '@/app/services/user.service'

// Add new event
export async function POST(request: NextRequest) {
  console.log('We are inside /api/phone post request....')
  try {
    // Given incoming request /home
    const postData = await request.json()
    console.log('SendSMS Details...', postData)
    var { email, phone, name } = postData
    if (name == null) name = email
    var result = await UserService.srvSendPhoneOtp(email, phone, name)
    console.log('Sending response....', result)
    const json_response = {
      success: result,
      results: 3
    }
    var finalResult = ApiResponseUtils.createSuccessResponse("Sucessfuly sent otp",result)
    return ApiResponseUtils.sendSuccessResponse(finalResult)
  } catch (error) {
    console.log('[Send PHONE OTP SMS]', error)
    var finalResult = ApiResponseUtils.createErrorResponse("Failed to sent otp")
    return ApiResponseUtils.sendErrorResponse(finalResult)
  }
}
