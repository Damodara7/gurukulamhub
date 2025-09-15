import {
  getAllWorkingPositions,
  addWorkingPosition,
  updateWorkingPosition,
  deleteWorkingPosition
} from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/working-positions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

    const result = await getAllWorkingPositions(email)
    if (!result) {
      throw new Error(`Couldn't get working positions.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched working positions.', result)
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
    const result = await addWorkingPosition({ email, workingPosition })

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

// PUT /api/profile/working-positions/[id]
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get('id')
    const { email, workingPosition } = await request.json()

    if (!positionId) {
      throw new Error('Working position ID is required')
    }

    const result = await updateWorkingPosition(positionId, { email, workingPosition })

    if (!result) {
      throw new Error(`Couldn't update working position.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully updated working position.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/working-positions PUT :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// DELETE /api/profile/working-positions/[id]
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get('id')

    if (!positionId) {
      throw new Error('Working position ID is required')
    }

    const result = await deleteWorkingPosition(positionId)

    if (!result) {
      throw new Error(`Couldn't delete working position.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully deleted working position.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/working-positions DELETE :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
