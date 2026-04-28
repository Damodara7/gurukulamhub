import connectMongo from '@/utils/dbConnect-mongo'
import * as ApiResponseUtils from '@/utils/apiResponses'
import ReferralSettings, { DEFAULT_REFERRAL_SETTINGS } from './referral-settings.model'
import { auth } from '@/libs/auth'

export const dynamic = 'force-dynamic'

async function getOrCreateSettings() {
  let settings = await ReferralSettings.findOne().lean()
  if (!settings) {
    settings = await ReferralSettings.create(DEFAULT_REFERRAL_SETTINGS)
    return settings.toObject()
  }
  return settings
}

function withSortedHistory(settings) {
  if (!settings) return settings
  const history = Array.isArray(settings.history) ? settings.history : []
  return {
    ...settings,
    history: [...history].sort((a, b) => new Date(b?.editedAt || 0).getTime() - new Date(a?.editedAt || 0).getTime())
  }
}

export async function GET() {
  try {
    await connectMongo()
    const settings = withSortedHistory(await getOrCreateSettings())
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
    const session = await auth()
    const editorEmail = String(session?.user?.email || '').trim().toLowerCase()
    const editorName =
      String(
        session?.user?.name ||
          `${session?.user?.firstname || ''} ${session?.user?.lastname || ''}`.trim() ||
          session?.user?.email ||
          ''
      ).trim() || 'Unknown'

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
        ApiResponseUtils.createErrorResponse(
          'Threshold points for unlocking +1 distribution level should be greater than or equal to 1'
        )
      )
    }

    const existing = await ReferralSettings.findOne()
    const baseline = existing
      ? {
          directReferrerPoints: Number(existing.directReferrerPoints),
          maxDistributionLevels: Number(existing.maxDistributionLevels),
          promotionPointsThreshold: Number(existing.promotionPointsThreshold)
        }
      : { ...DEFAULT_REFERRAL_SETTINGS }

    const nextValues = {
      directReferrerPoints,
      maxDistributionLevels,
      promotionPointsThreshold
    }

    const changedFields = Object.keys(nextValues)
      .filter(field => Number(baseline[field]) !== Number(nextValues[field]))
      .map(field => ({
        field,
        previousValue: baseline[field],
        newValue: nextValues[field]
      }))

    let updated = null
    if (changedFields.length === 0 && existing) {
      updated = existing.toObject()
    } else {
      updated = await ReferralSettings.findOneAndUpdate(
        {},
        {
          $set: nextValues,
          ...(changedFields.length > 0
            ? {
                $push: {
                  history: {
                    $each: [
                      {
                        editedAt: new Date(),
                        editedByName: editorName,
                        editedByEmail: editorEmail,
                        changes: changedFields
                      }
                    ],
                    $position: 0,
                    $slice: 200
                  }
                }
              }
            : {})
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean()
    }

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Referral settings updated successfully', withSortedHistory(updated))
    )
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to update referral settings')
    )
  }
}
