import * as ApiResponseUtils from '@/utils/apiResponses'
import * as UserService from '@/app/services/user.service'
import { getLocale } from '@/middleware'

export async function POST(request) {
  console.log('Start of api/forgot-password POST')
  try {
    // It extracts the token property from the JSON body of the incoming request.
    const reqBody = await request.json()
    const { email } = reqBody

    const locale = getLocale(request)

    const result = await UserService.srvSendResetPasswordToken(email, locale)
    if (result.status === 'success') {
      let resultInfo = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(resultInfo)
    }else{
      let resultInfo = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(resultInfo)
    }
  } catch (error) {
    let resultInfo = ApiResponseUtils.createErrorResponse(error?.message)
    return ApiResponseUtils.sendErrorResponse(resultInfo)
  }
}
