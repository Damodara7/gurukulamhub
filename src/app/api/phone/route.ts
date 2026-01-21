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
    // Only include testingOtp if SMS sending failed
    // Use optional chaining and nullish coalescing to handle TypeScript type checking
    const smsSent = (result as any)?.smsSent ?? false
    const shouldShowTestingOtp = result?.error || result?.status === 'error' || !smsSent
    const json_response = {
      success: result,
      results: 3,
      testingOtp: shouldShowTestingOtp ? (result?.testingOtp || null) : null,
      smsOtpError: shouldShowTestingOtp
    }
    console.log('Phone OTP response:', {
      hasTestingOtp: !!json_response.testingOtp,
      shouldShow: shouldShowTestingOtp,
      smsSent: smsSent,
      status: result?.status
    })
    var finalResult = ApiResponseUtils.createSuccessResponse("Sucessfuly sent otp", json_response)
    return ApiResponseUtils.sendSuccessResponse(finalResult)
  } catch (error) {
    console.log('[Send PHONE OTP SMS]', error)
    var finalResult = ApiResponseUtils.createErrorResponse("Failed to sent otp")
    return ApiResponseUtils.sendErrorResponse(finalResult)
  }
}
