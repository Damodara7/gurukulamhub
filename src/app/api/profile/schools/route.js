import { getAllSchools, addSchool, updateSchool, deleteSchool } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/schools
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

    const result = await getAllSchools(email)
    if (!result) {
      throw new Error(`Couldn't get schools`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched schools.', result)
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
    const result = await addSchool({ email, school })

    if (!result) {
      throw new Error(`Couldn't create school.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created school.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/schools POST :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// PUT /api/profile/schools/[id]
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('id')
    const { email, school } = await request.json()

    if (!schoolId) {
      throw new Error('School ID is required')
    }

    const result = await updateSchool(schoolId, { email, school })

    if (!result) {
      throw new Error(`Couldn't update school.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully updated school.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/schools PUT :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// DELETE /api/profile/schools/[id]
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('id')

    if (!schoolId) {
      throw new Error('School ID is required')
    }

    const result = await deleteSchool(schoolId)

    if (!result) {
      throw new Error(`Couldn't delete school.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully deleted school.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/schools DELETE :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
