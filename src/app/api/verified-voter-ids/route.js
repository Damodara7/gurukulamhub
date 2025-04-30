import * as ApiResponseUtils from '@/utils/apiResponses'
import { getAllVerifiedVoterIds } from './verified-voter-ids.service'

// GET /api/verified-voter-ids
export async function GET(request) {
  try {
    const result = await getAllVerifiedVoterIds()
    if (result.status === 'success') {
      return ApiResponseUtils.sendSuccessResponse(result)
    } else {
      return ApiResponseUtils.sendErrorResponse(result.message)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}

// POST /api/verified-voter-ids
export async function POST(request) {
  try {
    const verifiedVoterIdObj = await request.json()
    const result = await createVerifiedVoterId(verifiedVoterIdObj)

    if (result.status === 'success') {
      return ApiResponseUtils.sendSuccessResponse(result)
    } else {
      return ApiResponseUtils.sendErrorResponse(result.message)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}
