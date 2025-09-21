import * as GamesLiveService from '../game-live/game.live.service.js'
import * as FeatureService from '../feature/feature.service.js'
import * as RoleService from '../role/role.service.js'
import * as UserProfileService from '../profile/profile.service.js'
import * as UserService from '../../services/user.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { getLocale } from '@/middleware'

//Dynamic service lookup with given service name.
function configserviceName(serviceName) {
  switch (serviceName) {
    case 'GamesLiveService':
      return GamesLiveService
    case 'FeatureService':
      return FeatureService
    case 'RoleService':
      return RoleService
    case 'UserProfileService':
      return UserProfileService
    case 'UserService':
      return UserService
  }
}

export async function POST(request, response) {
  try {
    const locale = getLocale(request)
    const pReqBody = await request.json()
    const { methodName, serviceName, reqBody } = pReqBody
    const ArtifactService = configserviceName(serviceName)
    if (!ArtifactService[methodName]) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Method not found')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const methodResult = await ArtifactService[methodName]({ locale, ...reqBody })

    if (methodResult.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${serviceName}.${methodName} executed successfully`,
        methodResult.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(
        methodResult.message,
        methodResult?.result,
        methodResult?.statusCode,
        methodResult?.nextActionCode
      )
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
