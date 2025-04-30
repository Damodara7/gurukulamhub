import { getAllWorkingPositions, addWorkingPosition } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/positions
export async function GET(request) {
  try {
    const result = await getAllWorkingPositions()
    if (!result) {
      throw new Error(`Couldn't get working positions.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched working positions.',result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('api/profile/working-positions GET :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// POST /api/profile/working-positions
export async function POST(request) {
  try {
    const { email, workingPosition } = await request.json()
    const result = await addWorkingPosition(email, workingPosition)

    if (!result) {
      throw new Error(`Couldn't create working position.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created working position.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('api/profile/working-positions POST :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
