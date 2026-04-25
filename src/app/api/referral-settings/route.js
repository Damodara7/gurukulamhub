import connectMongo from '@/utils/dbConnect-mongo'
import * as ApiResponseUtils from '@/utils/apiResponses'
import ReferralSettings, { DEFAULT_REFERRAL_SETTINGS } from './referral-settings.model'

export const dynamic = 'force-dynamic'

async function getOrCreateSettings() {
  let settings = await ReferralSettings.findOne().lean()
  if (!settings) {
    settings = await ReferralSettings.create(DEFAULT_REFERRAL_SETTINGS)
    return settings.toObject()
  }
  return settings
}

export async function GET() {
  try {
    await connectMongo()
    const settings = await getOrCreateSettings()
    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Referral settings fetched successfully', settings)
    )
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse(error?.message || 'Failed to fetch referral settings'))
  }
}

export async function PUT(request) {
  try {
    await connectMongo()
    const body = await request.json()

    const directReferrerPoints = Number(body?.directReferrerPoints)
    const maxDistributionLevels = Number(body?.maxDistributionLevels)
    const promotionPointsThreshold = Number(body?.promotionPointsThreshold)

    if (!Number.isFinite(directReferrerPoints) || directReferrerPoints < 0) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Direct referrer points should be a number greater than or equal to 0')
      )
    }
    if (!Number.isFinite(maxDistributionLevels) || maxDistributionLevels < 1 || maxDistributionLevels > 25) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Distribution levels should be between 1 and 25')
      )
    }
    if (!Number.isFinite(promotionPointsThreshold) || promotionPointsThreshold < 1) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Promotion points threshold should be greater than or equal to 1')
      )
    }

    const updated = await ReferralSettings.findOneAndUpdate(
      {},
      {
        $set: {
          directReferrerPoints,
          maxDistributionLevels,
          promotionPointsThreshold
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Referral settings updated successfully', updated)
    )
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to update referral settings')
    )
  }
}
