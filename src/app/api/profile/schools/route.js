import { getAllSchools, addSchool } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/schools
export async function GET(request) {
  try {
    const result = await getAllSchools()
    if (!result) {
      throw new Error(`Couldn't get schools`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched schools.',result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/schools GET :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// POST /api/profile/schools
export async function POST(request) {
  try {
    const { email, school } = await request.json()
    const result = await addSchool(email, school)

    if (!result) {
      throw new Error(`Couldn't create school.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created school.',result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/schools POST :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
